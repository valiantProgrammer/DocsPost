import { MongoClient } from "mongodb";

export async function POST(req) {
    let client;
    try {
        const { docId, articleTitle, eventType, voteType, viewerEmail } = await req.json();
        console.log(`[Article Event] POST /api/analytics/log-article-event called`);
        console.log(`[Article Event]   docId: ${docId}, eventType: ${eventType}, voteType: ${voteType}`);

        if (!docId || !eventType) {
            console.error(`[Article Event] Missing required fields`);
            return new Response(
                JSON.stringify({ error: "docId and eventType are required" }),
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

        // Get document info (optional - if not found, use provided title)
        const docsCollection = db.collection("user_documents");
        const document = await docsCollection.findOne({ slug: docId });

        // Use provided title or fall back to document title or default
        const finalTitle = articleTitle || (document ? document.title : null) || "Untitled";
        const authorEmail = document ? document.userEmail : "unknown";

        console.log(`[Article Event] DocID: ${docId}, Title: ${finalTitle}, Author: ${authorEmail}, EventType: ${eventType}`);

        // Create detailed report record (article stats now tracked in analytics_optimized)
        await createReportRecord(db, docId, finalTitle, authorEmail, eventType, voteType, viewerEmail, now);

        await client.close();
        return new Response(
            JSON.stringify({ success: true, message: `${eventType} logged successfully` }),
            { status: 200 }
        );

    } catch (error) {
        console.error(`[Article Event ERROR] Failed to log event:`, error);
        return new Response(
            JSON.stringify({ error: error.message || "Failed to log event" }),
            { status: 500 }
        );
    } finally {
        if (client) await client.close();
    }
}

async function updateArticleStats(db, articleId, title, authorEmail, eventType, voteType) {
    try {
        const statsCollection = db.collection("article_stats");
        const now = new Date();

        console.log(`[updateArticleStats] Starting for articleId: ${articleId}, title: ${title}, authorEmail: ${authorEmail}`);

        if (eventType === "view") {
            // Increment view count
            const result = await statsCollection.updateOne(
                { articleId },
                {
                    $inc: { totalViews: 1 },
                    $set: {
                        articleId,
                        title,
                        authorEmail,
                        lastViewedAt: now,
                        updatedAt: now
                    },
                    $setOnInsert: {
                        articleId,
                        title,
                        authorEmail,
                        totalViews: 1,
                        totalVotes: 0,
                        totalLikes: 0,
                        totalDislikes: 0,
                        engagementRate: 0,
                        createdAt: now,
                        lastViewedAt: now,
                        updatedAt: now
                    }
                },
                { upsert: true }
            );

            console.log(`[updateArticleStats] View update result:`, result);
            console.log(`[Article Event] Updated view count for article: ${articleId}`);
        } else if (eventType === "vote") {
            // Increment vote count
            const voteField = voteType === "like" ? "totalLikes" : "totalDislikes";

            const result = await statsCollection.updateOne(
                { articleId },
                {
                    $inc: {
                        totalVotes: 1,
                        [voteField]: 1
                    },
                    $set: {
                        articleId,
                        title,
                        authorEmail,
                        lastVotedAt: now,
                        updatedAt: now
                    },
                    $setOnInsert: {
                        articleId,
                        title,
                        authorEmail,
                        totalViews: 0,
                        totalVotes: 1,
                        totalLikes: voteType === "like" ? 1 : 0,
                        totalDislikes: voteType === "dislike" ? 1 : 0,
                        engagementRate: 0,
                        createdAt: now,
                        lastVotedAt: now,
                        updatedAt: now
                    }
                },
                { upsert: true }
            );

            console.log(`[updateArticleStats] Vote update result:`, result);

            // Update engagement rate
            const doc = await statsCollection.findOne({ articleId });
            console.log(`[updateArticleStats] Found document:`, doc);

            if (doc) {
                const engagementRate = doc.totalViews > 0
                    ? ((doc.totalVotes / doc.totalViews) * 100)
                    : 0;

                await statsCollection.updateOne(
                    { articleId },
                    { $set: { engagementRate } }
                );
            }

            console.log(`[Article Event] Updated ${voteType} count for article: ${articleId}`);
        }

    } catch (error) {
        console.error(`[Article Event ERROR] Failed to update article stats:`, error);
        console.error(`[Article Event ERROR] Stack:`, error.stack);
    }
}

/**
 * Create a detailed report record for view/vote events
 */
async function createReportRecord(db, articleId, title, authorEmail, eventType, voteType, viewerEmail, timestamp) {
    try {
        const reportsCollection = db.collection("analytics_reports");

        const report = {
            articleId,
            title,
            authorEmail,
            eventType,
            voteType: voteType || null,
            viewerEmail: viewerEmail || "anonymous",
            timestamp,
            date: new Date(Date.UTC(timestamp.getUTCFullYear(), timestamp.getUTCMonth(), timestamp.getUTCDate(), 0, 0, 0, 0)),
            year: timestamp.getUTCFullYear(),
            month: timestamp.getUTCMonth() + 1
        };

        await reportsCollection.insertOne(report);
        console.log(`[Article Event] Created report record for ${eventType} on article: ${articleId}`);
    } catch (error) {
        console.error(`[Article Event ERROR] Failed to create report record:`, error);
    }
}
