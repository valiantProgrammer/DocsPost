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

        const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
        await analyticsCollection.insertOne({
            userEmail,
            articleId,
            articleTitle,
            type: "vote",
            voteType,
            timestamp: now,
            date: utcDate,
            month: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)),
            year: now.getUTCFullYear(),
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

        // Log to optimized analytics collection
        try {
            await fetch("http://localhost:3000/api/analytics/log-vote-optimized", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    docId: articleId,
                    userEmail,
                    voteType,
                    articleTitle
                })
            });
        } catch (fetchError) {
            console.error("Error calling log-vote-optimized:", fetchError);
        }

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
