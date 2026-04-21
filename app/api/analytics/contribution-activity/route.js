import { MongoClient } from "mongodb";

/**
 * GET /api/analytics/contribution-activity
 * Fetch contribution activity for a user (articles created by day)
 * Data fetched directly from user_documents collection
 * 
 * Query params:
 * - email: User email
 * - days: Number of days to look back (default: 365)
 */
export async function GET(req) {
    let client;
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");
        const days = parseInt(searchParams.get("days")) || 365;

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

        // Fetch articles directly from user_documents collection
        const docsCollection = db.collection("user_documents");
        const userArticles = await docsCollection
            .find({
                userEmail: email,
                createdAt: { $gte: startDate }
            })
            .sort({ createdAt: -1 })
            .toArray();

        console.log(`[Contribution Activity] Found ${userArticles.length} articles for ${email} in last ${days} days`);

        // Group articles by creation date (UTC)
        const creationMap = {};
        userArticles.forEach(article => {
            const createdDate = new Date(article.createdAt);
            const dateStr = createdDate.toISOString().split("T")[0]; // YYYY-MM-DD format

            if (!creationMap[dateStr]) {
                creationMap[dateStr] = {
                    date: new Date(Date.UTC(
                        createdDate.getUTCFullYear(),
                        createdDate.getUTCMonth(),
                        createdDate.getUTCDate(),
                        0, 0, 0, 0
                    )),
                    articles: [],
                    articlesCreated: 0
                };
            }

            creationMap[dateStr].articles.push({
                articleId: article.slug,
                title: article.title,
                createdAt: article.createdAt,
                category: article.category || "Other",
                views: article.views || 0
            });
            creationMap[dateStr].articlesCreated += 1;
        });

        // Convert map to array
        const creationsByDay = Object.values(creationMap);

        // Calculate totals
        const totalArticlesCreated = userArticles.length;
        const activeDays = creationsByDay.filter(d => d.articlesCreated > 0).length;
        const averagePerDay = creationsByDay.length > 0
            ? (totalArticlesCreated / creationsByDay.length).toFixed(2)
            : 0;

        console.log(`[Contribution Activity] Total articles: ${totalArticlesCreated}, Active days: ${activeDays}`);

        return new Response(
            JSON.stringify({
                success: true,
                userEmail: email,
                dataSource: "user_documents",
                period: {
                    days,
                    startDate,
                    endDate: now,
                },
                summary: {
                    totalArticlesCreated,
                    activeDays,
                    averagePerDay,
                    totalActivity: totalArticlesCreated,
                },
                creationsByDay: creationsByDay.sort((a, b) => a.date - b.date),
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
