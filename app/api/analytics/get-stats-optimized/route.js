import { MongoClient } from "mongodb";

/**
 * Fetch analytics from the new optimized collection (one document per user)
 */
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userEmail = searchParams.get("email");
        const timeframe = searchParams.get("timeframe") || "daily";

        if (!userEmail) {
            return new Response(
                JSON.stringify({ error: "Email is required" }),
                { status: 400 }
            );
        }

        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("DocsPost");

        // Fetch from optimized collection
        const analyticsDoc = await db.collection("analytics_optimized").findOne(
            { userEmail },
            {
                [timeframe]: 1,
                summary: 1,
                _id: 0
            }
        );

        if (!analyticsDoc) {
            // Return empty structure if user has no analytics yet
            return new Response(
                JSON.stringify({
                    success: true,
                    timeframe,
                    viewStats: [],
                    voteStats: [],
                    articleStats: [],
                    summary: {
                        allTimeViews: 0,
                        allTimeVotes: 0,
                        topArticles: [],
                        activeArticles: 0
                    }
                }),
                { status: 200 }
            );
        }

        // Transform to the format expected by frontend
        const timeframeData = analyticsDoc[timeframe];

        if (!timeframeData || !timeframeData.intervals) {
            return new Response(
                JSON.stringify({
                    success: true,
                    timeframe,
                    viewStats: [],
                    voteStats: [],
                    articleStats: [],
                    summary: analyticsDoc.summary || {}
                }),
                { status: 200 }
            );
        }

        // Verify intervals is an array
        if (!Array.isArray(timeframeData.intervals)) {
            console.error(`[Analytics Error] ${timeframe}.intervals is not an array!`, {
                userEmail,
                timeframe,
                type: typeof timeframeData.intervals,
                value: timeframeData.intervals
            });

            // Return empty if intervals is corrupted
            return new Response(
                JSON.stringify({
                    success: true,
                    timeframe,
                    viewStats: [],
                    voteStats: [],
                    articleStats: [],
                    summary: analyticsDoc.summary || {}
                }),
                { status: 200 }
            );
        }

        // Convert intervals to viewStats format
        const viewStats = timeframeData.intervals.map(interval => ({
            _id: interval.intervalId,
            views: interval.views,
            articles: interval.articles
        }));

        // Aggregate votes by article (topic)
        const votesByArticle = {};
        timeframeData.intervals.forEach(interval => {
            if (interval.votes.likes > 0 || interval.votes.dislikes > 0) {
                // Aggregate all votes in this interval across articles
                if (!votesByArticle[interval.intervalId]) {
                    votesByArticle[interval.intervalId] = {
                        _id: interval.intervalId,
                        totalLikes: 0,
                        totalDislikes: 0,
                        articles: []
                    };
                }
                votesByArticle[interval.intervalId].totalLikes += interval.votes.likes;
                votesByArticle[interval.intervalId].totalDislikes += interval.votes.dislikes;
                if (interval.articles && Array.isArray(interval.articles)) {
                    votesByArticle[interval.intervalId].articles.push(...interval.articles);
                }
            }
        });
        const voteStats = Object.values(votesByArticle);

        // Get article stats from summary with view and vote counts
        const articleStats = (analyticsDoc.summary?.topArticles || []).map(article => ({
            articleId: article.articleId,
            title: article.title,
            views: article.views || 0,
            votes: article.votes || 0,
            likes: article.votes || 0, // For backward compatibility with dashboard
            dislikes: article.dislikes || 0
        }));

        await client.close();

        const responseData = {
            success: true,
            timeframe,
            viewStats,
            voteStats,
            articleStats,
            summary: analyticsDoc.summary || {}
        };

        // Log all responses for debugging
        console.log(`[Analytics Query] Timeframe: ${timeframe}`);
        console.log(`  UserEmail: ${userEmail}`);
        console.log(`  View intervals found: ${viewStats.length}`);
        console.log(`  First interval sample:`, viewStats[0]);
        console.log(`  Full response:`, JSON.stringify(responseData, null, 2));

        return new Response(
            JSON.stringify(responseData),
            { status: 200 }
        );

    } catch (error) {
        console.error("Error fetching analytics:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500 }
        );
    }
}
