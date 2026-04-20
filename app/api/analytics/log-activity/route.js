import { MongoClient } from "mongodb";

export async function POST(req) {
    let client;
    try {
        const { userEmail, articleId, articleTitle, type, voteType } = await req.json();

        if (!userEmail || !type) {
            return new Response(
                JSON.stringify({ error: "Missing required fields: userEmail, type" }),
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

        const now = new Date();
        const dateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Log to analytics collection (for heatmap and stats)
        const analyticsCollection = db.collection("analytics");

        const activityEntry = {
            userEmail,
            type, // "view", "vote", "create"
            timestamp: now,
            date: dateOnly,
            month: new Date(now.getFullYear(), now.getMonth(), 1),
            year: now.getFullYear(),
        };

        // Add optional fields based on type
        if (articleId) activityEntry.articleId = articleId;
        if (articleTitle) activityEntry.articleTitle = articleTitle;
        if (voteType) activityEntry.voteType = voteType; // "like" or "dislike"

        // Insert individual activity log
        await analyticsCollection.insertOne(activityEntry);

        // Update or create daily stats
        const statsCollection = db.collection("analytics_stats");
        await statsCollection.updateOne(
            {
                userEmail,
                date: dateOnly,
            },
            {
                $inc: {
                    totalActivity: 1,
                    ...(type === "view" && { views: 1 }),
                    ...(type === "vote" && { votes: 1 }),
                    ...(type === "vote" && voteType === "like" && { likes: 1 }),
                    ...(type === "create" && { created: 1 }),
                },
                $set: {
                    userEmail,
                    lastActivity: now,
                },
            },
            { upsert: true }
        );

        return new Response(
            JSON.stringify({
                success: true,
                message: `${type} activity logged successfully`
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error logging activity:", error.message, error.stack);
        return new Response(
            JSON.stringify({ error: error.message || "Failed to log activity" }),
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.close();
        }
    }
}
