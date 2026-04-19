import { connectDB } from "@/lib/db";
import { MongoClient, ObjectId } from "mongodb";

export async function POST(req) {
    try {
        const { userEmail, articleId, articleTitle } = await req.json();

        if (!userEmail || !articleId) {
            return new Response(
                JSON.stringify({ error: "Missing required fields" }),
                { status: 400 }
            );
        }

        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("DocsPost");

        // Create or update analytics entry
        const analyticsCollection = db.collection("analytics");
        const now = new Date();

        // Log individual view
        await analyticsCollection.insertOne({
            userEmail,
            articleId,
            articleTitle,
            type: "view",
            timestamp: now,
            date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            month: new Date(now.getFullYear(), now.getMonth(), 1),
            year: now.getFullYear(),
        });

        // Update aggregated stats
        const statsCollection = db.collection("analytics_stats");
        await statsCollection.updateOne(
            {
                userEmail,
                articleId,
                date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            },
            {
                $inc: { views: 1, totalViews: 1 },
                $set: {
                    userEmail,
                    articleId,
                    articleTitle,
                    lastUpdated: now,
                },
            },
            { upsert: true }
        );

        await client.close();

        return new Response(
            JSON.stringify({ success: true, message: "View logged successfully" }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error logging view:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500 }
        );
    }
}
