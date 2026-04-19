import { MongoClient } from "mongodb";

export async function GET(req) {
    let client;
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");

        if (!slug) {
            return new Response(
                JSON.stringify({ error: "Document slug is required" }),
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

        const docsCollection = db.collection("user_documents");

        // Increment view count and get updated document
        const document = await docsCollection.findOneAndUpdate(
            { slug },
            { $inc: { views: 1 } },
            { returnDocument: "after" }
        );

        if (!document) {
            return new Response(
                JSON.stringify({ error: "Document not found" }),
                { status: 404 }
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                document: {
                    _id: document._id.toString(),
                    title: document.title,
                    description: document.description,
                    content: document.content,
                    category: document.category,
                    difficulty: document.difficulty,
                    slug: document.slug,
                    views: document.views || 0,
                    userEmail: document.userEmail,
                    createdAt: document.createdAt,
                    updatedAt: document.updatedAt,
                },
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching document:", error);
        return new Response(
            JSON.stringify({ error: error.message || "Failed to fetch document" }),
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.close();
        }
    }
}
