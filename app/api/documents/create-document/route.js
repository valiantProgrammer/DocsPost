import { MongoClient } from "mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
    let client;
    try {
        const { title, description, content, category, difficulty, userEmail } = await req.json();

        if (!title || !description || !userEmail) {
            return new Response(
                JSON.stringify({ error: "Missing required fields" }),
                { status: 400 }
            );
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

        // Generate slug from title
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        const now = new Date();
        const document = {
            title,
            description,
            content: content || "",
            category: category || "Other",
            difficulty: difficulty || "Beginner",
            slug,
            userEmail,
            views: 0,
            createdAt: now,
            updatedAt: now,
            published: false,
        };

        const docsCollection = db.collection("user_documents");
        const result = await docsCollection.insertOne(document);
        const docId = result.insertedId.toString();

        // Initialize stats collections for this document
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
                documentId: result.insertedId,
            }),
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating document:", error);
        return new Response(
            JSON.stringify({ error: error.message || "Failed to create document" }),
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.close();
        }
    }
}
