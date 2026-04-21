import { MongoClient } from "mongodb";

/**
 * GET /api/analytics/diagnostic-contribution
 * Diagnostic endpoint to check contribution data in analytics_stats
 * 
 * Query params:
 * - email: User email
 */
export async function GET(req) {
    let client;
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

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

        // Check all records for this user in analytics_stats
        const statsCollection = db.collection("analytics_stats");
        const allStats = await statsCollection
            .find({ userEmail: email })
            .sort({ date: -1 })
            .toArray();

        console.log(`[Diagnostic] Found ${allStats.length} records for ${email}`);
        allStats.forEach(stat => {
            console.log(`[Diagnostic] Date: ${stat.date}, Created: ${stat.articlesCreated}, Articles: `, stat.createdArticles);
        });

        return new Response(
            JSON.stringify({
                success: true,
                userEmail: email,
                totalRecords: allStats.length,
                records: allStats.map(stat => ({
                    date: stat.date,
                    articlesCreated: stat.articlesCreated || 0,
                    articles: stat.createdArticles || [],
                    totalActivity: stat.totalActivity || 0,
                    created: stat.created || 0,
                })),
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching diagnostic data:", error.message);
        return new Response(
            JSON.stringify({ error: error.message || "Failed to fetch diagnostic data" }),
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.close();
        }
    }
}
