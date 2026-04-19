import { MongoClient } from "mongodb";

export async function GET(req, { params }) {
    let client;
    try {
        const resolvedParams = await params;
        const { id: docId } = resolvedParams;

        if (!docId) {
            return new Response(
                JSON.stringify({ error: "Doc ID is required" }),
                { status: 400 }
            );
        }

        if (!process.env.MONGODB_URI) {
            console.error("MONGODB_URI is not set");
            return new Response(
                JSON.stringify({ error: "Database connection not configured" }),
                { status: 500 }
            );
        }

        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("DocsPost");

        // Get doc stats
        const statsCollection = db.collection("doc_stats");
        const stats = await statsCollection.findOne({ docId });

        // Get view count
        const viewsCollection = db.collection("doc_views");
        const viewCount = await viewsCollection.countDocuments({ docId });

        // Get upvote count
        const upvotesCollection = db.collection("doc_upvotes");
        const upvoteCount = await upvotesCollection.countDocuments({ docId });

        // Get report count
        const reportsCollection = db.collection("doc_reports");
        const reportCount = await reportsCollection.countDocuments({ docId });

        return new Response(
            JSON.stringify({
                success: true,
                stats: {
                    views: viewCount,
                    upvotes: upvoteCount,
                    reports: reportCount,
                    lastUpdated: stats?.lastViewed || new Date(),
                },
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching doc stats:", error.message, error.stack);
        return new Response(
            JSON.stringify({ error: error.message || "Failed to fetch stats" }),
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.close();
        }
    }
}
