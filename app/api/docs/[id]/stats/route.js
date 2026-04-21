import { MongoClient } from "mongodb";

export async function GET(req, { params }) {
    let client;
    try {
        const resolvedParams = await params;
        const { id: docId } = resolvedParams;
        const { searchParams } = new URL(req.url);
        const authorEmail = searchParams.get("authorEmail");

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

        let stats = {
            views: 0,
            upvotes: 0,
            likes: 0,
            dislikes: 0,
            votes: 0,
            engagementRate: 0,
            lastUpdated: new Date(),
        };

        // Always fetch from analytics_optimized (only source of truth now)
        const analyticsCollection = db.collection("analytics_optimized");

        if (authorEmail) {
            // If authorEmail provided, fetch directly
            const analyticsDoc = await analyticsCollection.findOne(
                { userEmail: authorEmail },
                { projection: { "summary.topArticles": 1 } }
            );

            if (analyticsDoc?.summary?.topArticles) {
                const article = analyticsDoc.summary.topArticles.find(a => a.articleId === docId);
                if (article) {
                    stats = {
                        views: article.views || 0,
                        upvotes: article.votes || 0,
                        likes: article.votes || 0,
                        dislikes: article.dislikes || 0,
                        votes: article.votes || 0,
                        engagementRate: article.views > 0 ? ((article.votes / article.views) * 100).toFixed(2) : 0,
                        lastUpdated: analyticsDoc.updatedAt || new Date(),
                    };
                }
            }
        } else {
            // If no authorEmail, search across all users (slower but works)
            const analyticsDoc = await analyticsCollection.findOne(
                { "summary.topArticles.articleId": docId },
                { projection: { "summary.topArticles.$": 1, updatedAt: 1 } }
            );

            if (analyticsDoc?.summary?.topArticles?.[0]) {
                const article = analyticsDoc.summary.topArticles[0];
                stats = {
                    views: article.views || 0,
                    upvotes: article.votes || 0,
                    likes: article.votes || 0,
                    dislikes: article.dislikes || 0,
                    votes: article.votes || 0,
                    engagementRate: article.views > 0 ? ((article.votes / article.views) * 100).toFixed(2) : 0,
                    lastUpdated: analyticsDoc.updatedAt || new Date(),
                };
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                stats,
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
