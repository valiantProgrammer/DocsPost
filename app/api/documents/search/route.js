import { MongoClient } from "mongodb";

export async function GET(req) {
    let client;
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q")?.trim();
        const category = searchParams.get("category");
        const page = parseInt(searchParams.get("page")) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        if (!query) {
            return new Response(
                JSON.stringify({ error: "Search query is required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        if (!process.env.MONGODB_URI) {
            return new Response(
                JSON.stringify({ error: "Database connection not configured" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("DocsPost");
        const docsCollection = db.collection("user_documents");

        // Build search filter
        const searchFilter = {
            $or: [
                { title: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
                { content: { $regex: query, $options: "i" } },
            ],
        };

        // Add category filter if provided
        if (category) {
            searchFilter.category = category;
        }

        // Get total count for pagination
        const totalCount = await docsCollection.countDocuments(searchFilter);

        // Search documents
        const documents = await docsCollection
            .find(searchFilter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        const results = documents.map((doc) => ({
            _id: doc._id.toString(),
            title: doc.title,
            description: doc.description,
            slug: doc.slug,
            category: doc.category,
            difficulty: doc.difficulty,
            views: doc.views || 0,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        }));

        return new Response(
            JSON.stringify({
                success: true,
                results,
                total: totalCount,
                page,
                pages: Math.ceil(totalCount / limit),
                limit,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Search error:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    } finally {
        if (client) {
            await client.close();
        }
    }
}
