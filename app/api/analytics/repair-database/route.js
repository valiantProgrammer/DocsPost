import { MongoClient } from "mongodb";

/**
 * Repair corrupted analytics documents
 * POST /api/analytics/repair-database
 * Fixes documents with malformed timeframe structures
 */
export async function POST(req) {
    try {
        if (!process.env.MONGODB_URI) {
            return new Response(
                JSON.stringify({ error: "Database connection not configured" }),
                { status: 500 }
            );
        }

        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("DocsPost");
        const collection = db.collection("analytics_optimized");

        // Delete ALL documents - they'll be recreated properly from the source data
        // This is the most reliable way to ensure clean data
        const allDocs = await collection.find({}).toArray();
        console.log(`[Repair] Found ${allDocs.length} documents to check`);

        const results = {
            total: allDocs.length,
            deleted: 0,
            fixed: 0,
            details: []
        };

        for (const doc of allDocs) {
            try {
                let hasIssues = false;

                // Check if any timeframe has corrupted intervals
                for (const timeframe of ['daily', 'monthly', 'quarterly', 'yearly']) {
                    const intervals = doc[timeframe]?.intervals;

                    // If intervals is an object with $ keys (MongoDB operator), it's corrupted
                    if (intervals && typeof intervals === 'object' && !Array.isArray(intervals)) {
                        if ('$slice' in intervals || '$push' in intervals || '$set' in intervals) {
                            hasIssues = true;
                            console.log(`[Repair] Document has corrupted ${timeframe}.intervals: ${JSON.stringify(intervals)}`);
                        }
                    }

                    // If intervals exists but isn't an array, it's corrupted
                    if (intervals && !Array.isArray(intervals) && typeof intervals === 'object') {
                        hasIssues = true;
                    }
                }

                if (hasIssues) {
                    // Delete the corrupted document
                    await collection.deleteOne({ _id: doc._id });
                    results.deleted++;
                    results.details.push({
                        userEmail: doc.userEmail,
                        action: "deleted",
                        reason: "Contains corrupted timeframe structures with operator syntax"
                    });
                }
            } catch (err) {
                results.details.push({
                    userEmail: doc.userEmail,
                    action: "error",
                    error: err.message
                });
            }
        }

        // Also check for documents missing proper timeframe fields
        const missingCount = await collection.countDocuments({
            $or: [
                { daily: { $exists: false } },
                { monthly: { $exists: false } },
                { quarterly: { $exists: false } },
                { yearly: { $exists: false } },
                { summary: { $exists: false } }
            ]
        });

        console.log(`[Repair] Found ${missingCount} documents missing timeframe fields`);
        results.missing = missingCount;

        if (missingCount > 0) {
            const missing = await collection.find({
                $or: [
                    { daily: { $exists: false } },
                    { monthly: { $exists: false } },
                    { quarterly: { $exists: false } },
                    { yearly: { $exists: false } },
                    { summary: { $exists: false } }
                ]
            }).toArray();

            for (const doc of missing) {
                try {
                    const defaultTimeframe = {
                        intervals: [],
                        totalViews: 0,
                        totalVotes: 0,
                        lastUpdated: new Date()
                    };

                    await collection.updateOne(
                        { _id: doc._id },
                        {
                            $set: {
                                daily: doc.daily || defaultTimeframe,
                                monthly: doc.monthly || defaultTimeframe,
                                quarterly: doc.quarterly || defaultTimeframe,
                                yearly: doc.yearly || defaultTimeframe,
                                summary: doc.summary || {
                                    allTimeViews: 0,
                                    allTimeVotes: 0,
                                    avgViewsPerDay: 0,
                                    topArticles: [],
                                    lastViewTime: new Date(),
                                    activeArticles: 0
                                }
                            }
                        }
                    );
                    results.fixed++;
                } catch (err) {
                    results.details.push({
                        userEmail: doc.userEmail,
                        action: "error",
                        error: err.message
                    });
                }
            }
        }

        await client.close();

        return new Response(
            JSON.stringify({
                success: true,
                message: `Repair complete: ${results.deleted} deleted, ${results.fixed} fixed`,
                results
            }),
            { status: 200 }
        );

    } catch (error) {
        console.error("Error repairing database:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500 }
        );
    }
}