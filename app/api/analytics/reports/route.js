import { MongoClient } from "mongodb";

/**
 * Fetch detailed analytics reports
 * Used for historical analysis and detailed reporting
 */
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const articleId = searchParams.get("articleId");
        const authorEmail = searchParams.get("authorEmail");
        const eventType = searchParams.get("eventType"); // "view" or "vote"
        const days = parseInt(searchParams.get("days") || "30");
        const limit = parseInt(searchParams.get("limit") || "100");

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

        const reportsCollection = db.collection("analytics_reports");

        // Build filter
        const filter = {};

        if (articleId) {
            filter.articleId = articleId;
        }

        if (authorEmail) {
            filter.authorEmail = authorEmail;
        }

        if (eventType) {
            filter.eventType = eventType;
        }

        // Filter by date range (last N days)
        const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        filter.timestamp = { $gte: daysAgo };

        // Fetch reports sorted by timestamp descending (newest first)
        const reports = await reportsCollection
            .find(filter)
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray();

        // Aggregate statistics by type
        const stats = {
            totalRecords: reports.length,
            byEventType: {},
            byArticle: {},
            byDay: {}
        };

        reports.forEach(report => {
            // By event type
            if (!stats.byEventType[report.eventType]) {
                stats.byEventType[report.eventType] = 0;
            }
            stats.byEventType[report.eventType]++;

            // By article
            if (!stats.byArticle[report.articleId]) {
                stats.byArticle[report.articleId] = { count: 0, title: report.title };
            }
            stats.byArticle[report.articleId].count++;

            // By day
            const dateStr = report.date.toISOString().split('T')[0];
            if (!stats.byDay[dateStr]) {
                stats.byDay[dateStr] = 0;
            }
            stats.byDay[dateStr]++;
        });

        await client.close();

        return new Response(
            JSON.stringify({
                success: true,
                filter,
                reports,
                statistics: stats,
                dateRange: {
                    from: daysAgo.toISOString(),
                    to: new Date().toISOString(),
                    days
                }
            }),
            { status: 200 }
        );

    } catch (error) {
        console.error("Error fetching reports:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500 }
        );
    }
}
