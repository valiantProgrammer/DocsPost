import { MongoClient } from "mongodb";

const MAX_INTERVALS = {
    daily: 30,
    monthly: 36,
    quarterly: 28,
    yearly: 20
};

/**
 * Log a view to the optimized analytics collection
 * Creates/updates documents with proper schema using upsert
 */
export async function POST(req) {
    let client;
    try {
        const { docId, userEmail } = await req.json();
        console.log(`[View Log] POST /api/docs/log-view-optimized called`);
        console.log(`[View Log]   docId: ${docId}, userEmail: ${userEmail}`);

        if (!docId) {
            console.error(`[View Log] Missing docId`);
            return new Response(JSON.stringify({ error: "Doc ID is required" }), { status: 400 });
        }

        if (!process.env.MONGODB_URI) {
            console.error("MONGODB_URI is not set");
            return new Response(JSON.stringify({ error: "Database connection not configured" }), { status: 500 });
        }

        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("DocsPost");

        const now = new Date();
        const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

        // Get document info
        const docsCollection = db.collection("user_documents");
        const document = await docsCollection.findOne({ slug: docId });

        if (!document) {
            console.warn(`[View Warning] Document not found for slug: ${docId}`);
            return new Response(JSON.stringify({ error: "Document not found" }), { status: 404 });
        }

        const authorEmail = document.userEmail;
        console.log(`[View Logged] DocID: ${docId}, Author: ${authorEmail}, Time: ${now.toISOString()}`);

        // Calculate interval identifiers
        const istDate = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
        const dailyId = istDate.toISOString().split('T')[0];
        const hours = istDate.getUTCHours();
        const minutes = Math.floor(istDate.getUTCMinutes() / 15) * 15;
        const quarterlyId = `${dailyId} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        const monthlyId = istDate.toISOString().substring(0, 7);
        const yearlyId = istDate.getUTCFullYear().toString();

        const optimizedCollection = db.collection("analytics_optimized");

        // Update or create intervals for each timeframe
        await updateOrCreateInterval(optimizedCollection, authorEmail, "quarterly", quarterlyId, docId, now);
        await updateOrCreateInterval(optimizedCollection, authorEmail, "daily", dailyId, docId, utcDate);
        await updateOrCreateInterval(optimizedCollection, authorEmail, "monthly", monthlyId, docId,
            new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)));
        await updateOrCreateInterval(optimizedCollection, authorEmail, "yearly", yearlyId, docId,
            new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0)));

        // Update summary
        await optimizedCollection.updateOne(
            { userEmail: authorEmail },
            { $inc: { "summary.allTimeViews": 1 }, $set: { updatedAt: now, "summary.lastViewTime": now } },
            { upsert: true }
        );

        // Update topArticles with view count
        await updateTopArticlesWithView(optimizedCollection, authorEmail, docId, document.title || "Untitled");

        // Log to article stats collection (one doc per article)
        try {
            await fetch("http://localhost:3000/api/analytics/log-article-event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    docId,
                    articleTitle: document.title || "Untitled",
                    eventType: "view",
                    viewerEmail: userEmail || "anonymous"
                })
            });
        } catch (fetchError) {
            console.error("Error calling log-article-event:", fetchError);
        }

        await client.close();
        return new Response(JSON.stringify({ success: true, message: "View logged successfully" }), { status: 200 });

    } catch (error) {
        console.error(`[View Log ERROR] Failed to log view:`, error);
        console.error(`[View Log ERROR] Stack:`, error.stack);
        return new Response(JSON.stringify({ error: error.message || "Failed to log view" }), { status: 500 });
    } finally {
        if (client) await client.close();
    }
}

/**
 * Update or create an interval
 * Ensures proper schema structure and applies sliding window
 */
async function updateOrCreateInterval(collection, userEmail, timeframe, intervalId, articleId, timestamp) {
    const maxIntervals = MAX_INTERVALS[timeframe] || 30;
    const defaultTimeframeStructure = {
        intervals: [],
        totalViews: 0,
        totalVotes: 0,
        lastUpdated: new Date()
    };

    // Try to update existing interval
    const updateResult = await collection.updateOne(
        { userEmail, [`${timeframe}.intervals.intervalId`]: intervalId },
        {
            $inc: {
                [`${timeframe}.intervals.$.views`]: 1,
                [`${timeframe}.totalViews`]: 1
            },
            $addToSet: { [`${timeframe}.intervals.$.articles`]: articleId },
            $set: { [`${timeframe}.lastUpdated`]: new Date(), updatedAt: new Date() }
        }
    );

    if (updateResult.matchedCount > 0) {
        // Interval exists - apply sliding window by fetching and slicing locally
        const doc = await collection.findOne({ userEmail }, { projection: { [`${timeframe}.intervals`]: 1 } });
        if (doc && doc[timeframe]?.intervals && Array.isArray(doc[timeframe].intervals)) {
            const intervals = doc[timeframe].intervals;
            if (intervals.length > maxIntervals) {
                const sliced = intervals.slice(-maxIntervals);
                await collection.updateOne(
                    { userEmail },
                    { $set: { [`${timeframe}.intervals`]: sliced } }
                );
            }
        }
        return;
    }

    // Check if document exists
    const existingDoc = await collection.findOne({ userEmail }, { projection: { _id: 1 } });

    if (existingDoc) {
        // Document exists - just push the interval without $setOnInsert
        const newInterval = {
            intervalId,
            timestamp,
            views: 1,
            articles: [articleId],
            votes: { likes: 0, dislikes: 0 }
        };

        await collection.updateOne(
            { userEmail },
            {
                $push: { [`${timeframe}.intervals`]: newInterval },
                $inc: { [`${timeframe}.totalViews`]: 1 },
                $set: { [`${timeframe}.lastUpdated`]: new Date(), updatedAt: new Date() }
            }
        );
    } else {
        // Document doesn't exist - create with all timeframes
        const newInterval = {
            intervalId,
            timestamp,
            views: 1,
            articles: [articleId],
            votes: { likes: 0, dislikes: 0 }
        };

        const insertDoc = {
            userEmail,
            createdAt: new Date(),
            updatedAt: new Date(),
            daily: {
                intervals: timeframe === "daily" ? [newInterval] : [],
                totalViews: timeframe === "daily" ? 1 : 0,
                totalVotes: 0,
                lastUpdated: new Date()
            },
            monthly: {
                intervals: timeframe === "monthly" ? [newInterval] : [],
                totalViews: timeframe === "monthly" ? 1 : 0,
                totalVotes: 0,
                lastUpdated: new Date()
            },
            quarterly: {
                intervals: timeframe === "quarterly" ? [newInterval] : [],
                totalViews: timeframe === "quarterly" ? 1 : 0,
                totalVotes: 0,
                lastUpdated: new Date()
            },
            yearly: {
                intervals: timeframe === "yearly" ? [newInterval] : [],
                totalViews: timeframe === "yearly" ? 1 : 0,
                totalVotes: 0,
                lastUpdated: new Date()
            },
            summary: {
                allTimeViews: 1,
                allTimeVotes: 0,
                avgViewsPerDay: 0,
                topArticles: [],
                lastViewTime: new Date(),
                activeArticles: 0
            }
        };

        await collection.insertOne(insertDoc);
        return;
    }

    // Apply sliding window by fetching and slicing locally
    const doc = await collection.findOne({ userEmail }, { projection: { [`${timeframe}.intervals`]: 1 } });
    if (doc && doc[timeframe]?.intervals && Array.isArray(doc[timeframe].intervals)) {
        const intervals = doc[timeframe].intervals;
        if (intervals.length > maxIntervals) {
            const sliced = intervals.slice(-maxIntervals);
            await collection.updateOne(
                { userEmail },
                { $set: { [`${timeframe}.intervals`]: sliced } }
            );
        }
    }
}

/**
 * Update topArticles with view count
 */
async function updateTopArticlesWithView(collection, userEmail, articleId, articleTitle) {
    try {
        const doc = await collection.findOne({ userEmail });

        if (!doc || !doc.summary) {
            console.warn(`[View Warning] Document or summary not found for user: ${userEmail}`);
            return;
        }

        const topArticles = doc.summary.topArticles || [];

        // Find if article already exists in topArticles
        const existingArticleIndex = topArticles.findIndex(a => a.articleId === articleId);

        if (existingArticleIndex >= 0) {
            // Update existing article's view count
            const updatedArticles = [...topArticles];
            updatedArticles[existingArticleIndex] = {
                ...updatedArticles[existingArticleIndex],
                views: (updatedArticles[existingArticleIndex].views || 0) + 1
            };

            // Sort by views descending
            updatedArticles.sort((a, b) => (b.views || 0) - (a.views || 0));

            await collection.updateOne(
                { userEmail },
                {
                    $set: {
                        "summary.topArticles": updatedArticles,
                        updatedAt: new Date()
                    }
                }
            );
        } else {
            // Add new article to topArticles
            const newArticle = {
                articleId,
                title: articleTitle,
                views: 1,
                votes: 0
            };

            const updatedArticles = [...topArticles, newArticle]
                .sort((a, b) => (b.views || 0) - (a.views || 0))
                .slice(0, 10); // Keep top 10

            await collection.updateOne(
                { userEmail },
                {
                    $set: {
                        "summary.topArticles": updatedArticles,
                        updatedAt: new Date()
                    }
                }
            );
        }

        console.log(`[View Log] Updated topArticles for ${userEmail}, article: ${articleId}`);
    } catch (error) {
        console.error(`[View Log ERROR] Failed to update topArticles:`, error);
    }
}
