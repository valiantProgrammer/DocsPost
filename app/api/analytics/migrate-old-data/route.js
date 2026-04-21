import { MongoClient } from "mongodb";

/**
 * Migrate data from old analytics collection to analytics_optimized
 * Aggregates old data into the new timeframe structure
 */
export async function POST(req) {
    try {
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("DocsPost");

        const oldCollection = db.collection("analytics");
        const newCollection = db.collection("analytics_optimized");

        // Get all unique users from old analytics
        const uniqueUsers = await oldCollection.distinct("userEmail");
        console.log(`[Migrate] Found ${uniqueUsers.length} unique users in old analytics`);

        const IST_OFFSET = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
        let migratedCount = 0;

        for (const userEmail of uniqueUsers) {
            // Fetch all records for this user
            const records = await oldCollection.find({ userEmail }).sort({ timestamp: 1 }).toArray();

            if (records.length === 0) continue;

            const maxIntervals = {
                daily: 30,
                monthly: 36,
                quarterly: 28,
                yearly: 20
            };

            // Build intervals for each timeframe
            const intervals = {
                daily: new Map(),
                monthly: new Map(),
                quarterly: new Map(),
                yearly: new Map()
            };

            let totalViews = 0;
            let topArticles = new Map();

            for (const record of records) {
                if (record.type !== 'view' && record.type !== 'engagement') continue;

                const date = new Date(record.timestamp || record.date);
                const istDate = new Date(date.getTime() + IST_OFFSET);

                // Build interval IDs
                const dailyId = istDate.toISOString().split('T')[0];
                const hours = istDate.getUTCHours();
                const minutes = Math.floor(istDate.getUTCMinutes() / 15) * 15;
                const quarterlyId = `${dailyId} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                const monthlyId = istDate.toISOString().substring(0, 7);
                const yearlyId = istDate.getUTCFullYear().toString();

                // Add to intervals
                const article = record.articleId;
                const articleTitle = record.articleTitle || 'Untitled';

                [
                    ['daily', dailyId],
                    ['quarterly', quarterlyId],
                    ['monthly', monthlyId],
                    ['yearly', yearlyId]
                ].forEach(([timeframe, intervalId]) => {
                    if (!intervals[timeframe].has(intervalId)) {
                        intervals[timeframe].set(intervalId, {
                            intervalId,
                            timestamp: date,
                            views: 0,
                            articles: new Set(),
                            votes: { likes: 0, dislikes: 0 }
                        });
                    }
                    const interval = intervals[timeframe].get(intervalId);
                    interval.views += 1;
                    interval.articles.add(article);
                });

                // Track top articles
                if (!topArticles.has(article)) {
                    topArticles.set(article, { articleId: article, title: articleTitle, views: 0, votes: 0 });
                }
                topArticles.get(article).views += 1;
                totalViews += 1;
            }

            // Convert Sets to Arrays
            const finalIntervals = {};
            for (const [timeframe, intervalMap] of Object.entries(intervals)) {
                finalIntervals[timeframe] = {
                    intervals: Array.from(intervalMap.values())
                        .map(int => ({
                            ...int,
                            articles: Array.from(int.articles)
                        }))
                        .slice(-maxIntervals[timeframe]),
                    totalViews: Array.from(intervalMap.values()).reduce((sum, int) => sum + int.views, 0),
                    totalVotes: 0,
                    lastUpdated: new Date()
                };
            }

            // Create document
            const topArticlesList = Array.from(topArticles.values())
                .sort((a, b) => b.views - a.views)
                .slice(0, 10);

            const doc = {
                userEmail,
                createdAt: new Date(records[0].timestamp || records[0].date),
                updatedAt: new Date(records[records.length - 1].timestamp || records[records.length - 1].date),
                daily: finalIntervals.daily,
                monthly: finalIntervals.monthly,
                quarterly: finalIntervals.quarterly,
                yearly: finalIntervals.yearly,
                summary: {
                    allTimeViews: totalViews,
                    allTimeVotes: 0,
                    avgViewsPerDay: 0,
                    topArticles: topArticlesList,
                    lastViewTime: new Date(records[records.length - 1].timestamp || records[records.length - 1].date),
                    activeArticles: topArticles.size
                }
            };

            // Upsert
            await newCollection.updateOne(
                { userEmail },
                { $set: doc },
                { upsert: true }
            );

            migratedCount++;
            console.log(`[Migrate] Migrated user ${migratedCount}/${uniqueUsers.length}: ${userEmail} (${records.length} records)`);
        }

        await client.close();

        return new Response(
            JSON.stringify({
                success: true,
                message: `Successfully migrated ${migratedCount} users from old analytics to optimized collection`,
                migratedCount
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Migration error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500 }
        );
    }
}
