import { MongoClient } from "mongodb";

/**
 * GET /api/analytics/contribution-activity
 * Fetch contribution activity for a user (articles created by day)
 * 
 * Query params:
 * - email: User email
 * - days: Number of days to look back (default: 30)
 */
export async function GET(req) {
    let client;
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");
        const days = parseInt(searchParams.get("days")) || 30;

        if (!email) {
            return new Response(
                JSON.stringify({ error: "Email is required" }),
                { status: 400 }
            );
        }

        if (!process.env.MONGODB_URI) {
            return new Response(
                JSON.stringify({ error: "Database connection not configured" }),
                { status: 500 }
            );
        }

        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("DocsPost");

        // Calculate date range
        const now = new Date();
        const startDate = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() - days,
            0, 0, 0, 0
        ));

        // Fetch contribution stats from analytics_stats
        const statsCollection = db.collection("analytics_stats");
        const contributionStats = await statsCollection
            .find({
                userEmail: email,
                date: { $gte: startDate }
            })
            .sort({ date: -1 })
            .toArray();

        // Calculate totals
        let totalArticlesCreated = 0;
        let totalActivity = 0;
        const creationsByDay = [];

        contributionStats.forEach(stat => {
            totalArticlesCreated += stat.articlesCreated || 0;
            totalActivity += stat.totalActivity || 0;

            creationsByDay.push({
                date: stat.date,
                articlesCreated: stat.articlesCreated || 0,
                articles: stat.createdArticles || [],
                totalActivity: stat.totalActivity || 0,
            });
        });

        return new Response(
            JSON.stringify({
                success: true,
                userEmail: email,
                period: {
                    days,
                    startDate,
                    endDate: now,
                },
                summary: {
                    totalArticlesCreated,
                    totalActivity,
                    activeDays: creationsByDay.filter(d => d.articlesCreated > 0).length,
                    averagePerDay: creationsByDay.length > 0
                        ? (totalArticlesCreated / creationsByDay.length).toFixed(2)
                        : 0,
                },
                creationsByDay,
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching contribution activity:", error.message);
        return new Response(
            JSON.stringify({ error: error.message || "Failed to fetch contribution activity" }),
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.close();
        }
    }
}
