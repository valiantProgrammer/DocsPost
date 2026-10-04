import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

function generateSlug(title) {
    return (title || "untitled")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "untitled-doc";
}

export async function GET(req) {
    let client;
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");
        const documentId = searchParams.get("documentId");
        const userEmail = searchParams.get("userEmail") || "";

        if (!slug && !documentId) {
            return NextResponse.json({ error: "Document slug or id is required" }, { status: 400 });
        }

        if (!process.env.MONGODB_URI) {
            return NextResponse.json({ error: "Database connection not configured" }, { status: 500 });
        }

        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("DocsPost");
        const docsCollection = db.collection("user_documents");

        let document = null;
        if (slug) {
            document = await docsCollection.findOneAndUpdate(
                { slug },
                { $inc: { views: 1 } },
                { returnDocument: "after" }
            );
        } else if (documentId) {
            try {
                document = await docsCollection.findOne({ _id: new ObjectId(documentId) });
            } catch (e) {
                // In case documentId is not valid ObjectId
            }
        }

        if (!document) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        // Auto-assign slug if missing
        let documentSlug = document.slug;
        if (!documentSlug && document.title) {
            documentSlug = generateSlug(document.title);
            // Optionally persist it
            await docsCollection.updateOne(
                { _id: document._id },
                { $set: { slug: documentSlug } }
            );
        }

        let authorUsername = "";
        if (document.userEmail) {
            try {
                const usersCollection = db.collection("users");
                const author = await usersCollection.findOne({ email: document.userEmail });
                authorUsername = author?.username || document.userEmail;
            } catch (err) {
                console.error("Error fetching author:", err);
                authorUsername = document.userEmail;
            }
        }

        return NextResponse.json({
            success: true,
            document: {
                _id: document._id.toString(),
                title: document.title,
                slug: documentSlug || "",
                description: document.description || "",
                content: typeof document.content === "string" ? document.content : "",
                category: document.category || "Backend Development",
                difficulty: document.difficulty || "Beginner",
                views: document.views || 0,
                userEmail: document.userEmail,
                authorUsername,
                createdAt: document.createdAt,
                updatedAt: document.updatedAt,
                status: document.status || (document.published ? "Published" : "Draft"),
                visibility: document.visibility || "Public",
                tags: Array.isArray(document.tags) ? document.tags : [],
                featuredImage: document.featuredImage || "",
                wordCount: document.wordCount || (document.content ? document.content.trim().split(/\s+/).filter(Boolean).length : 0),
                advancedSettings: document.advancedSettings || {
                    allowComments: true,
                    showToc: true,
                    seoTitle: "",
                    seoDescription: "",
                    scheduledPublishDate: null,
                },
            },
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching document:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch document" }, { status: 500 });
    } finally {
        if (client) {
            await client.close();
        }
    }
}
