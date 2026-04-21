import { MongoClient } from "mongodb";

const MAX_INTERVALS = {
    daily: 30,
    monthly: 36,
    quarterly: 28,
    yearly: 20
};

/**
 * Log a vote to the optimized analytics collection
 * Updates votes in intervals and summary
 */
export async function POST(req) {
    let client;
    try {
        const { docId, userEmail, voteType, articleTitle, voterEmail } = await req.json();
        console.log(`[Vote Log] POST /api/analytics/log-vote-optimized called`);
        console.log(`[Vote Log]   docId: ${docId}, userEmail: ${userEmail}, voteType: ${voteType}, voterEmail: ${voterEmail}`);

        if (!docId || !userEmail || !voteType) {
            console.error(`[Vote Log] Missing required fields`);
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
            console.warn(`[Vote Warning] Document not found for slug: ${docId}`);
            return new Response(JSON.stringify({ error: "Document not found" }), { status: 404 });
        }

        const authorEmail = document.userEmail;
        console.log(`[Vote Logged] DocID: ${docId}, Author: ${authorEmail}, VoteType: ${voteType}, Time: ${now.toISOString()}`);

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

        // Update vote counts in all timeframe intervals
        await updateVoteInInterval(optimizedCollection, authorEmail, "quarterly", quarterlyId, docId, voteField, now);
        await updateVoteInInterval(optimizedCollection, authorEmail, "daily", dailyId, docId, voteField, now);
        await updateVoteInInterval(optimizedCollection, authorEmail, "monthly", monthlyId, docId, voteField, now);
        await updateVoteInInterval(optimizedCollection, authorEmail, "yearly", yearlyId, docId, voteField, now);

        // Update summary vote counts and topArticles
        await updateTopArticlesWithVote(optimizedCollection, authorEmail, docId, voteField, document.title || "Untitled");

        // Log to article stats collection (one doc per article)
        try {
            await fetch("http://localhost:3000/api/analytics/log-article-event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    docId,
                    articleTitle: document.title || "Untitled",
                    eventType: "vote",
                    voteType: voteType,
                    viewerEmail: voterEmail || "anonymous"
                })
            });
        } catch (fetchError) {
            console.error("Error calling log-article-event:", fetchError);
        }

        await client.close();
        return new Response(JSON.stringify({ success: true, message: "Vote logged successfully" }), { status: 200 });

    } catch (error) {
        console.error(`[Vote Log ERROR] Failed to log vote:`, error);
        console.error(`[Vote Log ERROR] Stack:`, error.stack);
        return new Response(JSON.stringify({ error: error.message || "Failed to log vote" }), { status: 500 });
    } finally {
        if (client) await client.close();
    }
}

/**
 * Update vote count in a specific timeframe interval
 */
async function updateVoteInInterval(collection, userEmail, timeframe, intervalId, articleId, voteField, timestamp) {
    try {
        // Try to update existing interval
        const updateResult = await collection.updateOne(
            { userEmail, [`${timeframe}.intervals.intervalId`]: intervalId },
            {
                $inc: { [`${timeframe}.intervals.$.votes.${voteField}`]: 1 },
                $set: { [`${timeframe}.lastUpdated`]: new Date(), updatedAt: new Date() }
            }
        );

        if (updateResult.matchedCount > 0) {
            // Also increment timeframe totalVotes
            await collection.updateOne(
                { userEmail },
                { $inc: { [`${timeframe}.totalVotes`]: 1 } }
            );
            return;
        }

        // If interval doesn't exist, create it with vote
        const newInterval = {
            intervalId,
            timestamp,
            views: 0,
            articles: [articleId],
            votes: { likes: voteField === "likes" ? 1 : 0, dislikes: voteField === "dislikes" ? 1 : 0 }
        };

        await collection.updateOne(
            { userEmail },
            {
                $push: { [`${timeframe}.intervals`]: newInterval },
                $inc: { [`${timeframe}.totalVotes`]: 1 },
                $set: { [`${timeframe}.lastUpdated`]: new Date(), updatedAt: new Date() }
            }
        );

    } catch (error) {
        console.error(`[Vote Log ERROR] Failed to update interval ${timeframe}:`, error);
    }
}

/**
 * Update topArticles summary with vote counts
 */
async function updateTopArticlesWithVote(collection, userEmail, articleId, voteField, articleTitle) {
    try {
        const doc = await collection.findOne({ userEmail });

        if (!doc || !doc.summary) {
            console.warn(`[Vote Warning] Document or summary not found for user: ${userEmail}`);
            return;
        }

        const topArticles = doc.summary.topArticles || [];

        // Find if article already exists in topArticles
        const existingArticleIndex = topArticles.findIndex(a => a.articleId === articleId);

        if (existingArticleIndex >= 0) {
            // Update existing article's vote count
            const updatedArticles = [...topArticles];
            updatedArticles[existingArticleIndex] = {
                ...updatedArticles[existingArticleIndex],
                votes: (updatedArticles[existingArticleIndex].votes || 0) + 1
            };

            // Sort by votes descending
            updatedArticles.sort((a, b) => (b.votes || 0) - (a.votes || 0));

            await collection.updateOne(
                { userEmail },
                {
                    $set: {
                        "summary.topArticles": updatedArticles,
                        "summary.allTimeVotes": (doc.summary.allTimeVotes || 0) + 1,
                        updatedAt: new Date()
                    }
                }
            );
        } else {
            // Add new article to topArticles
            const newArticle = {
                articleId,
                title: articleTitle,
                views: 0,
                votes: 1
            };

            const updatedArticles = [...topArticles, newArticle]
                .sort((a, b) => (b.votes || 0) - (a.votes || 0))
                .slice(0, 10); // Keep top 10

            await collection.updateOne(
                { userEmail },
                {
                    $set: {
                        "summary.topArticles": updatedArticles,
                        "summary.allTimeVotes": (doc.summary.allTimeVotes || 0) + 1,
                        updatedAt: new Date()
                    }
                }
            );
        }

        console.log(`[Vote Log] Updated topArticles for ${userEmail}, article: ${articleId}`);
    } catch (error) {
        console.error(`[Vote Log ERROR] Failed to update topArticles:`, error);
    }
}
