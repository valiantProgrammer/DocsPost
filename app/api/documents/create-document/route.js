import { MongoClient } from "mongodb";

export async function POST(req) {
    let client;
    try {
        const {
            title,
            description,
            content,
            category,
            difficulty,
            userEmail,
            status,
            visibility,
            tags,
            featuredImage,
        } = await req.json();

        if (!title || !userEmail) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        if (!process.env.MONGODB_URI) {
            return new Response(
                JSON.stringify({ error: "Database connection not configured" }),
                { status: 500 }
            );
        }

        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("DocsPost");

        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        const now = new Date();
        const normalizedStatus = status === "Published" ? "Published" : "Draft";

        const document = {
            title,
            description: description || (content || "").slice(0, 140),
            content: content || "",
            category: category || "Other",
            difficulty: difficulty || "Beginner",
            slug,
            userEmail,
            views: 0,
            createdAt: now,
            updatedAt: now,
            published: normalizedStatus === "Published",
            status: normalizedStatus,
            visibility: visibility || "Public",
            tags: Array.isArray(tags) ? tags : [],
            featuredImage: featuredImage || "",
        };

        const docsCollection = db.collection("user_documents");
        const result = await docsCollection.insertOne(document);
        const docId = result.insertedId.toString();

        const statsCollection = db.collection("doc_stats");
        await statsCollection.updateOne(
            { docId },
            {
                $set: {
                    docId,
                    title,
                    userEmail,
                    views: 0,
                    upvotes: 0,
                    reports: 0,
                    createdAt: now,
                    updatedAt: now,
                },
            },
            { upsert: true }
        );

        return new Response(
            JSON.stringify({
                success: true,
                message: "Document created successfully",
                documentId: docId,
            }),
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating document:", error);
        return new Response(JSON.stringify({ error: error.message || "Failed to create document" }), {
            status: 500,
        });
    } finally {
        if (client) {
            await client.close();
        }
    }
}
