import { MongoClient } from "mongodb";

export async function GET(req) {
    let client;
    try {
        const { searchParams } = new URL(req.url);
        const userEmail = searchParams.get("email");
        const category = searchParams.get("category");

        if (!userEmail && !category) {
            return new Response(
                JSON.stringify({ error: "User email or category is required" }),
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

        // Build filter based on parameters
        const filter = {};
        if (userEmail) filter.userEmail = userEmail;
        if (category) filter.category = category;

        const documents = await docsCollection
            .find(filter)
            .sort({ createdAt: -1 })
            .toArray();

        return new Response(
            JSON.stringify({
                success: true,
                documents: documents.map((doc) => ({
                    _id: doc._id.toString(),
                    title: doc.title,
                    description: doc.description,
                    content: doc.content,
                    category: doc.category,
                    difficulty: doc.difficulty,
                    slug: doc.slug,
                    userEmail: doc.userEmail,
                    views: doc.views || 0,
                    createdAt: doc.createdAt,
                    updatedAt: doc.updatedAt,
                })),
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching documents:", error);
        return new Response(
            JSON.stringify({ error: error.message || "Failed to fetch documents" }),
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.close();
        }
    }
}
