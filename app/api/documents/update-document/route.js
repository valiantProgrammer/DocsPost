import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";

function generateSlug(title) {
    return (title || "untitled")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "untitled-doc";
}

export async function PUT(req) {
    let client;
    try {
        let session = await getSessionUser(req);
        let user = session.user;

        const body = await req.json();
        const {
            documentId,
            title,
            slug: incomingSlug,
            description,
            content,
            contentJson,
            category,
            difficulty,
            status,
            visibility,
            tags,
            featuredImage,
            wordCount,
            advancedSettings,
            userEmail: fallbackEmail,
        } = body;

        if (!user && fallbackEmail && process.env.MONGODB_URI) {
            const tempClient = new MongoClient(process.env.MONGODB_URI);
            await tempClient.connect();
            const found = await tempClient.db("DocsPost").collection("users").findOne({ email: fallbackEmail.toLowerCase() });
            await tempClient.close();
            if (found) {
                user = {
                    _id: found._id.toString(),
                    email: found.email,
                    username: found.username || found.email.split("@")[0],
                };
            }
        }

        if (!user) {
            return NextResponse.json({ error: "Unauthorized: Active session required" }, { status: 401 });
        }

        if (!documentId) {
            return NextResponse.json({ error: "Missing documentId" }, { status: 400 });
        }

        if (!process.env.MONGODB_URI) {
            return NextResponse.json({ error: "Database connection not configured" }, { status: 500 });
        }

        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("DocsPost");
        const docsCollection = db.collection("user_documents");

        // Verify document ownership
        const docObjectId = new ObjectId(documentId);
        const existingDoc = await docsCollection.findOne({ _id: docObjectId });
        if (!existingDoc) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        if (existingDoc.userEmail !== user.email) {
            return NextResponse.json({ error: "Forbidden: You do not own this document" }, { status: 403 });
        }

        // Handle slug
        let finalSlug = existingDoc.slug;
        if (incomingSlug || title) {
            const baseSlug = (incomingSlug || generateSlug(title || existingDoc.title))
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");

            if (baseSlug && baseSlug !== existingDoc.slug) {
                // Check if taken by another doc
                const conflict = await docsCollection.findOne({
                    slug: baseSlug,
                    _id: { $ne: docObjectId },
                });
                if (conflict) {
                    finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
                } else {
                    finalSlug = baseSlug;
                }
            }
        }

        // Reject base64 images
        let safeFeaturedImage = featuredImage !== undefined ? featuredImage : existingDoc.featuredImage;
        if (safeFeaturedImage && safeFeaturedImage.startsWith("data:image")) {
            safeFeaturedImage = existingDoc.featuredImage || "";
        }

        const normalizedStatus = status === "Published" ? "Published" : (status || existingDoc.status || "Draft");
        const computedWordCount = typeof wordCount === "number"
            ? wordCount
            : (content ? content.trim().split(/\s+/).filter(Boolean).length : existingDoc.wordCount || 0);

        const updateData = {
            updatedAt: new Date(),
            status: normalizedStatus,
            published: normalizedStatus === "Published",
        };

        if (title !== undefined) updateData.title = title.trim();
        if (finalSlug) updateData.slug = finalSlug;
        if (description !== undefined) updateData.description = description.slice(0, 160);
        if (content !== undefined) updateData.content = content;
        if (contentJson !== undefined) updateData.contentJson = contentJson;
        if (category !== undefined) updateData.category = category;
        if (difficulty !== undefined) updateData.difficulty = difficulty;
        if (visibility !== undefined) updateData.visibility = visibility;
        if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags.map(t => t.trim().replace(/^#/, "")).filter(Boolean).slice(0, 8) : [];
        if (safeFeaturedImage !== undefined) updateData.featuredImage = safeFeaturedImage;
        if (computedWordCount !== undefined) updateData.wordCount = computedWordCount;
        if (advancedSettings !== undefined) updateData.advancedSettings = advancedSettings;

        await docsCollection.updateOne(
            { _id: docObjectId },
            { $set: updateData }
        );

        // Update stats title if changed
        if (title) {
            await db.collection("doc_stats").updateOne(
                { docId: documentId },
                { $set: { title: title.trim(), updatedAt: updateData.updatedAt } }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Document updated successfully",
            slug: finalSlug,
            updatedAt: updateData.updatedAt,
        }, { status: 200 });
    } catch (error) {
        console.error("Error updating document:", error);
        return NextResponse.json({ error: error.message || "Failed to update document" }, { status: 500 });
    } finally {
        if (client) {
            await client.close();
        }
    }
}
