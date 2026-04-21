import { MongoClient } from "mongodb";

/**
 * Fetch article statistics from analytics_optimized collection
 * One document per user with topArticles array
 */
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const articleId = searchParams.get("articleId");
        const authorEmail = searchParams.get("authorEmail");

        if (!process.env.MONGODB_URI) {
            console.error("MONGODB_URI is not set");
            return new Response(
                JSON.stringify({ error: "Database connection not configured" }),
                { status: 500 }
            );
        }

        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("DocsPost");

        const analyticsCollection = db.collection("analytics_optimized");

        if (articleId) {
            // Find the article across all users
            const analyticsDoc = await analyticsCollection.findOne(
                { "summary.topArticles.articleId": articleId },
                { projection: { "summary.topArticles.$": 1, userEmail: 1, updatedAt: 1 } }
            );

            if (!analyticsDoc || !analyticsDoc.summary?.topArticles?.[0]) {
                await client.close();
                return new Response(
                    JSON.stringify({
                        success: true,
                        articleId,
                        stats: {
                            articleId,
                            title: "Unknown",
                            views: 0,
                            votes: 0,
                            likes: 0,
                            dislikes: 0,
                            engagementRate: 0,
                            authorEmail: "unknown",
                            lastUpdated: new Date(),
                        }
                    }),
                    { status: 200 }
                );
            }

            const article = analyticsDoc.summary.topArticles[0];
            const stats = {
                articleId: article.articleId,
                title: article.title,
                views: article.views || 0,
                votes: article.votes || 0,
                likes: article.votes || 0,
                dislikes: article.dislikes || 0,
                engagementRate: article.views > 0 ? ((article.votes / article.views) * 100).toFixed(2) : 0,
                authorEmail: analyticsDoc.userEmail,
                lastUpdated: analyticsDoc.updatedAt
            };

            await client.close();

            return new Response(
                JSON.stringify({
                    success: true,
                    articleId,
                    stats
                }),
                { status: 200 }
            );
        } else if (authorEmail) {
            // Fetch all articles for the author
            const analyticsDoc = await analyticsCollection.findOne(
                { userEmail: authorEmail },
                { projection: { "summary.topArticles": 1, "summary.allTimeViews": 1, "summary.allTimeVotes": 1, updatedAt: 1 } }
            );

            const articles = analyticsDoc?.summary?.topArticles || [];
            const formattedArticles = articles.map(a => ({
                articleId: a.articleId,
                title: a.title,
                views: a.views || 0,
                votes: a.votes || 0,
                likes: a.votes || 0,
                dislikes: a.dislikes || 0,
                engagementRate: a.views > 0 ? ((a.votes / a.views) * 100).toFixed(2) : 0,
                authorEmail
            }));

            await client.close();

            return new Response(
                JSON.stringify({
                    success: true,
                    authorEmail,
                    articles: formattedArticles,
                    totalArticles: formattedArticles.length,
                    summary: {
                        totalViews: analyticsDoc?.summary?.allTimeViews || 0,
                        totalVotes: analyticsDoc?.summary?.allTimeVotes || 0,
                        totalLikes: analyticsDoc?.summary?.allTimeVotes || 0,
                        totalDislikes: 0,
                        avgEngagementRate: formattedArticles.length > 0
                            ? formattedArticles.reduce((sum, a) => sum + (parseFloat(a.engagementRate) || 0), 0) / formattedArticles.length
                            : 0
                    }
                }),
                { status: 200 }
            );
        } else {
            // Return error if neither articleId nor authorEmail provided
            await client.close();
            return new Response(
                JSON.stringify({ error: "articleId or authorEmail is required" }),
                { status: 400 }
            );
        }

    } catch (error) {
        console.error("Error fetching article stats:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500 }
        );
    }
}
