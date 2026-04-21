import { MongoClient } from "mongodb";

/**
 * Maximum intervals to keep per timeframe (sliding window)
 * When exceeded, oldest data is discarded during migration
 */
const MAX_INTERVALS = {
    daily: 30,      // Keep last 30 days
    monthly: 36,    // Keep last 36 months (3 years)
    quarterly: 28,  // Keep last 28 quarters (7 years)
    yearly: 20      // Keep last 20 years
};

/**
 * Migration API to convert old flat analytics structure to optimized per-user document structure
 * GET /api/analytics/migrate-to-optimized?action=status|migrate|cleanup
 */
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const action = searchParams.get("action") || "status"; // status, migrate, cleanup

        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("DocsPost");

        if (action === "status") {
            // Check migration status
            const oldCount = await db.collection("analytics").countDocuments();
            const newCount = await db.collection("analytics_optimized").countDocuments();

            return new Response(
                JSON.stringify({
                    status: "OK",
                    oldAnalyticsCount: oldCount,
                    newOptimizedCount: newCount,
                    message: `Old collection: ${oldCount} docs | New collection: ${newCount} docs`
                }),
                { status: 200 }
            );
        }

        if (action === "migrate") {
            // Get all records from old analytics collection
            const allRecords = await db.collection("analytics").find({}).toArray();
            console.log(`[Migration] Found ${allRecords.length} records to migrate`);

            // Group by userEmail
            const groupedByUser = {};
            allRecords.forEach(record => {
                const email = record.userEmail;
                if (!groupedByUser[email]) {
                    groupedByUser[email] = [];
                }
                groupedByUser[email].push(record);
            });

            console.log(`[Migration] Found ${Object.keys(groupedByUser).length} unique users`);

            // Migrate each user's data
            const migratedUsers = [];
            for (const [userEmail, userRecords] of Object.entries(groupedByUser)) {
                const analyticsDoc = createOptimizedDocument(userEmail, userRecords);

                // Insert or update in new optimized collection
                await db.collection("analytics_optimized").updateOne(
                    { userEmail },
                    { $set: analyticsDoc },
                    { upsert: true }
                );

                migratedUsers.push(userEmail);
                console.log(`[Migration] Migrated user: ${userEmail} (${userRecords.length} records)`);
            }

            await client.close();

            return new Response(
                JSON.stringify({
                    status: "SUCCESS",
                    message: `Migrated ${migratedUsers.length} users`,
                    migratedUsers,
                    totalRecordsMigrated: allRecords.length
                }),
                { status: 200 }
            );
        }

        if (action === "cleanup") {
            // Backup old collection and delete it
            const oldCount = await db.collection("analytics").countDocuments();

            // Create backup
            const backup = await db.collection("analytics_backup").deleteMany({});
            const allRecords = await db.collection("analytics").find({}).toArray();
            if (allRecords.length > 0) {
                await db.collection("analytics_backup").insertMany(allRecords);
            }

            // Delete old collection
            await db.collection("analytics").deleteMany({});

            await client.close();

            return new Response(
                JSON.stringify({
                    status: "SUCCESS",
                    message: `Deleted ${oldCount} old records. Backup created in analytics_backup`,
                    backupCount: allRecords.length
                }),
                { status: 200 }
            );
        }

        await client.close();
        return new Response(
            JSON.stringify({ error: "Invalid action. Use: status, migrate, or cleanup" }),
            { status: 400 }
        );

    } catch (error) {
        console.error("Migration error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500 }
        );
    }
}

/**
 * Create optimized analytics document from raw records
 * Applies sliding window: keeps only the last N intervals per timeframe
 */
function createOptimizedDocument(userEmail, records) {
    // Group records by timeframe
    const quarterly = groupByTimeframe(records, "quarterly");
    const daily = groupByTimeframe(records, "daily");
    const monthly = groupByTimeframe(records, "monthly");
    const yearly = groupByTimeframe(records, "yearly");

    // Apply sliding window: keep only the last N intervals
    const quarterlySliced = quarterly.slice(-MAX_INTERVALS.quarterly);
    const dailySliced = daily.slice(-MAX_INTERVALS.daily);
    const monthlySliced = monthly.slice(-MAX_INTERVALS.monthly);
    const yearlySliced = yearly.slice(-MAX_INTERVALS.yearly);

    // Calculate summary stats (using sliced data for consistency)
    const viewRecords = records.filter(r => r.type === "view");
    const voteRecords = records.filter(r => r.type === "vote");

    const topArticles = getTopArticles(records);

    return {
        userEmail,
        createdAt: new Date(Math.min(...records.map(r => new Date(r.timestamp || r.date).getTime()))),
        updatedAt: new Date(),

        quarterly: {
            intervals: quarterlySliced,
            lastUpdated: new Date(),
            totalViews: quarterlySliced.reduce((sum, q) => sum + q.views, 0),
            totalVotes: quarterlySliced.reduce((sum, q) => sum + q.votes.likes + q.votes.dislikes, 0)
        },

        daily: {
            intervals: dailySliced,
            lastUpdated: new Date(),
            totalViews: dailySliced.reduce((sum, d) => sum + d.views, 0),
            totalVotes: dailySliced.reduce((sum, d) => sum + d.votes.likes + d.votes.dislikes, 0)
        },

        monthly: {
            intervals: monthlySliced,
            lastUpdated: new Date(),
            totalViews: monthlySliced.reduce((sum, m) => sum + m.views, 0),
            totalVotes: monthlySliced.reduce((sum, m) => sum + m.votes.likes + m.votes.dislikes, 0)
        },

        yearly: {
            intervals: yearlySliced,
            lastUpdated: new Date(),
            totalViews: yearlySliced.reduce((sum, y) => sum + y.views, 0),
            totalVotes: yearlySliced.reduce((sum, y) => sum + y.votes.likes + y.votes.dislikes, 0)
        },

        summary: {
            allTimeViews: viewRecords.length,
            allTimeVotes: voteRecords.length,
            avgViewsPerDay: Math.round((viewRecords.length / Math.max(1, dailySliced.length)) * 100) / 100,
            topArticles,
            lastViewTime: new Date(Math.max(...viewRecords.map(r => new Date(r.timestamp || r.date).getTime()))),
            activeArticles: new Set(records.map(r => r.articleId)).size
        }
    };
}

/**
 * Group records by timeframe
 */
function groupByTimeframe(records, timeframe) {
    const grouped = {};

    records.forEach(record => {
        const date = new Date(record.timestamp);
        const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000); // Convert to IST

        let key, intervalId;

        if (timeframe === "quarterly") {
            const hours = istDate.getUTCHours();
            const minutes = Math.floor(istDate.getUTCMinutes() / 15) * 15;
            const dateStr = istDate.toISOString().split('T')[0];
            intervalId = `${dateStr} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            key = intervalId;
        } else if (timeframe === "daily") {
            key = istDate.toISOString().split('T')[0];
            intervalId = key;
        } else if (timeframe === "monthly") {
            key = istDate.toISOString().substring(0, 7);
            intervalId = key;
        } else if (timeframe === "yearly") {
            key = istDate.getUTCFullYear().toString();
            intervalId = key;
        }

        if (!grouped[key]) {
            grouped[key] = {
                intervalId,
                timestamp: date,
                views: 0,
                articles: [],
                votes: { likes: 0, dislikes: 0 }
            };
        }

        if (record.type === "view") {
            grouped[key].views += 1;
            if (record.articleId && !grouped[key].articles.includes(record.articleId)) {
                grouped[key].articles.push(record.articleId);
            }
        } else if (record.type === "vote") {
            if (record.voteType === "like") {
                grouped[key].votes.likes += 1;
            } else if (record.voteType === "dislike") {
                grouped[key].votes.dislikes += 1;
            }
        }
    });

    return Object.values(grouped).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

/**
 * Get top 5 articles by view count
 */
function getTopArticles(records) {
    const articleStats = {};

    records.forEach(record => {
        if (!articleStats[record.articleId]) {
            articleStats[record.articleId] = {
                articleId: record.articleId,
                title: record.articleTitle || "Untitled",
                views: 0,
                votes: 0
            };
        }

        if (record.type === "view") {
            articleStats[record.articleId].views += 1;
        } else if (record.type === "vote") {
            articleStats[record.articleId].votes += 1;
        }
    });

    return Object.values(articleStats)
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);
}

function isInYearly(record, yearly) {
    const year = new Date(record.timestamp).getFullYear().toString();
    return yearly.some(y => y.intervalId === year);
}
