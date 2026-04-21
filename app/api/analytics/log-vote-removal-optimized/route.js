import { MongoClient } from "mongodb";

/**
 * Log a vote removal to the optimized analytics collection
 * Decrements votes in intervals and summary when a user removes an upvote
 */
export async function POST(req) {
    let client;
    try {
        const { docId, userEmail, voteType, articleTitle, voterEmail } = await req.json();
        console.log(`[Vote Removal Log] POST /api/analytics/log-vote-removal-optimized called`);
        console.log(`[Vote Removal Log]   docId: ${docId}, userEmail: ${userEmail}, voteType: ${voteType}`);

        if (!docId || !userEmail || !voteType) {
            console.error(`[Vote Removal Log] Missing required fields`);
            return new Response(JSON.stringify({ error: "docId, userEmail, and voteType are required" }), { status: 400 });
        }

        if (!process.env.MONGODB_URI) {
            console.error("MONGODB_URI is not set");
            return new Response(JSON.stringify({ error: "Database connection not configured" }), { status: 500 });
        }

        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("DocsPost");

        const now = new Date();

        // Get document info to get author email
        const docsCollection = db.collection("user_documents");
        const document = await docsCollection.findOne({ slug: docId });

        if (!document) {
            console.warn(`[Vote Removal Warning] Document not found for slug: ${docId}`);
            return new Response(JSON.stringify({ error: "Document not found" }), { status: 404 });
        }

        const authorEmail = document.userEmail;
        console.log(`[Vote Removal Logged] DocID: ${docId}, Author: ${authorEmail}, VoteType: ${voteType}`);

        // Calculate interval identifiers (IST timezone)
        const istDate = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
        const dailyId = istDate.toISOString().split('T')[0];
        const hours = istDate.getUTCHours();
        const minutes = Math.floor(istDate.getUTCMinutes() / 15) * 15;
        const quarterlyId = `${dailyId} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        const monthlyId = istDate.toISOString().substring(0, 7);
        const yearlyId = istDate.getUTCFullYear().toString();

        const optimizedCollection = db.collection("analytics_optimized");
        const voteField = voteType === "like" ? "likes" : "dislikes";

        // Decrement vote counts in all timeframe intervals
        await decrementVoteInInterval(optimizedCollection, authorEmail, "quarterly", quarterlyId, voteField);
        await decrementVoteInInterval(optimizedCollection, authorEmail, "daily", dailyId, voteField);
        await decrementVoteInInterval(optimizedCollection, authorEmail, "monthly", monthlyId, voteField);
        await decrementVoteInInterval(optimizedCollection, authorEmail, "yearly", yearlyId, voteField);

        // Update summary - decrement allTimeVotes and update topArticles
        const voteDecrement = voteType === "like" ? 1 : 0;
        await optimizedCollection.updateOne(
            { userEmail: authorEmail },
            {
                $inc: { "summary.allTimeVotes": -1 },
                $set: { updatedAt: now }
            }
        );

        // Update topArticles vote count
        await optimizedCollection.updateOne(
            { userEmail: authorEmail, "summary.topArticles.articleId": docId },
            {
                $inc: { "summary.topArticles.$.votes": -1 }
            }
        );

        await client.close();
        return new Response(JSON.stringify({ success: true, message: "Vote removal logged successfully" }), { status: 200 });

    } catch (error) {
        console.error(`[Vote Removal Log ERROR] Failed to log vote removal:`, error);
        console.error(`[Vote Removal Log ERROR] Stack:`, error.stack);
        return new Response(JSON.stringify({ error: error.message || "Failed to log vote removal" }), { status: 500 });
    } finally {
        if (client) await client.close();
    }
}

/**
 * Decrement vote count in a specific timeframe interval
 */
async function decrementVoteInInterval(collection, userEmail, timeframe, intervalId, voteField) {
    try {
        await collection.updateOne(
            { userEmail, [`${timeframe}.intervals.intervalId`]: intervalId },
            {
                $inc: { [`${timeframe}.intervals.$.votes.${voteField}`]: -1 },
                $set: { [`${timeframe}.lastUpdated`]: new Date(), updatedAt: new Date() }
            }
        );

        // Also decrement timeframe totalVotes
        await collection.updateOne(
            { userEmail },
            { $inc: { [`${timeframe}.totalVotes`]: -1 } }
        );

    } catch (error) {
        console.error(`[Vote Removal Log ERROR] Failed to decrement votes in ${timeframe}:`, error);
    }
}
