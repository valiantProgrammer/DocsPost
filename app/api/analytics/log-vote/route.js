import { MongoClient } from "mongodb";

export async function POST(req) {
    try {
        const { userEmail, articleId, articleTitle, voteType } = await req.json();

        if (!userEmail || !articleId || !voteType) {
            return new Response(
                JSON.stringify({ error: "Missing required fields" }),
                { status: 400 }
            );
        }

        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("DocsPost");

        // Log individual vote
        const analyticsCollection = db.collection("analytics");
        const now = new Date();

        await analyticsCollection.insertOne({
            userEmail,
            articleId,
            articleTitle,
            type: "vote",
            voteType,
            timestamp: now,
            date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            month: new Date(now.getFullYear(), now.getMonth(), 1),
            year: now.getFullYear(),
        });

        // Update aggregated stats
        const statsCollection = db.collection("analytics_stats");
        const voteField = voteType === "like" ? "likes" : "dislikes";

        await statsCollection.updateOne(
            {
                userEmail,
                articleId,
                date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            },
            {
                $inc: { [voteField]: 1 },
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
            JSON.stringify({ success: true, message: "Vote logged successfully" }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error logging vote:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500 }
        );
    }
}
