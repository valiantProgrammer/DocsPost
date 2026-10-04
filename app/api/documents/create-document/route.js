import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";

function generateSlug(title) {
    return (title || "untitled")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "untitled-doc";
}

export async function POST(req) {
    let client;
    try {
        // Authenticate user via session/JWT/cookie
        let session = await getSessionUser(req);
        let user = session.user;

        const body = await req.json();
        const {
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

        // Fallback check if session couldn't get user from cookies
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

        if (!title || !title.trim()) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        if (!process.env.MONGODB_URI) {
            return NextResponse.json({ error: "Database connection not configured" }, { status: 500 });
        }

        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("DocsPost");
        const docsCollection = db.collection("user_documents");

        // Validate and ensure unique slug
        let baseSlug = (incomingSlug || generateSlug(title)).toLowerCase().trim();
        baseSlug = baseSlug.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "untitled";
        let finalSlug = baseSlug;
        let counter = 1;
        while (await docsCollection.findOne({ slug: finalSlug })) {
            finalSlug = `${baseSlug}-${counter}`;
            counter++;
        }

        // Reject base64 images in featuredImage
        let safeFeaturedImage = featuredImage || "";
        if (safeFeaturedImage.startsWith("data:image")) {
            safeFeaturedImage = ""; // Do not store base64 in MongoDB
        }

        const now = new Date();
        const normalizedStatus = status === "Published" ? "Published" : "Draft";

        // Count words from markdown content if not provided
        const computedWordCount = typeof wordCount === "number"
            ? wordCount
            : (content ? content.trim().split(/\s+/).filter(Boolean).length : 0);

        const document = {
            title: title.trim(),
            slug: finalSlug,
            description: (description || "").slice(0, 160),
            content: typeof content === "string" ? content : "",
            contentJson: contentJson || null,
            category: category || "Backend Development",
            difficulty: difficulty || "Beginner",
            userEmail: user.email,
            authorUsername: user.username,
            views: 0,
            createdAt: now,
            updatedAt: now,
            published: normalizedStatus === "Published",
            status: normalizedStatus,
            visibility: visibility || "Public",
            tags: Array.isArray(tags) ? tags.map(t => t.trim().replace(/^#/, "")).filter(Boolean).slice(0, 8) : [],
            featuredImage: safeFeaturedImage,
            wordCount: computedWordCount,
            advancedSettings: advancedSettings || {
                allowComments: true,
                showToc: true,
                seoTitle: "",
                seoDescription: "",
                scheduledPublishDate: null,
            },
        };

        const result = await docsCollection.insertOne(document);
        const docId = result.insertedId.toString();

        const statsCollection = db.collection("doc_stats");
        await statsCollection.updateOne(
            { docId },
            {
                $set: {
                    docId,
                    title: document.title,
                    userEmail: user.email,
                    views: 0,
                    upvotes: 0,
                    reports: 0,
                    createdAt: now,
                    updatedAt: now,
                },
            },
            { upsert: true }
        );

        return NextResponse.json({
            success: true,
            message: "Document created successfully",
            documentId: docId,
            slug: finalSlug,
            document: { ...document, _id: docId },
        }, { status: 201 });
    } catch (error) {
        console.error("Error creating document:", error);
        return NextResponse.json({ error: error.message || "Failed to create document" }, { status: 500 });
    } finally {
        if (client) {
            await client.close();
        }
    }
}
