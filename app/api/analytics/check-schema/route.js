import { MongoClient } from "mongodb";

/**
 * Diagnostic endpoint to check analytics collection schema and data
 * GET /api/analytics/check-schema?email=user@example.com
 * Shows exactly what documents exist and their structure
 */
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userEmail = searchParams.get("email");

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

        // If email provided, show that user's document
        if (userEmail) {
            const userDoc = await collection.findOne({ userEmail });

            if (!userDoc) {
                await client.close();
                return new Response(
                    JSON.stringify({
                        userEmail,
                        found: false,
                        message: `No document found for ${userEmail} in analytics_optimized collection`
                    }),
                    { status: 200 }
                );
            }

            // Document exists - show structure
            const structure = {
                _id: userDoc._id,
                userEmail: userDoc.userEmail,
                createdAt: userDoc.createdAt,
                updatedAt: userDoc.updatedAt,
                schema: {
                    daily: {
                        exists: !!userDoc.daily,
                        totalViews: userDoc.daily?.totalViews || 0,
                        totalVotes: userDoc.daily?.totalVotes || 0,
                        intervalCount: userDoc.daily?.intervals?.length || 0,
                        lastUpdated: userDoc.daily?.lastUpdated,
                        sampleIntervals: userDoc.daily?.intervals?.slice(-2) || []
                    },
                    monthly: {
                        exists: !!userDoc.monthly,
                        totalViews: userDoc.monthly?.totalViews || 0,
                        totalVotes: userDoc.monthly?.totalVotes || 0,
                        intervalCount: userDoc.monthly?.intervals?.length || 0,
                        lastUpdated: userDoc.monthly?.lastUpdated,
                        sampleIntervals: userDoc.monthly?.intervals?.slice(-2) || []
                    },
                    quarterly: {
                        exists: !!userDoc.quarterly,
                        totalViews: userDoc.quarterly?.totalViews || 0,
                        totalVotes: userDoc.quarterly?.totalVotes || 0,
                        intervalCount: userDoc.quarterly?.intervals?.length || 0,
                        lastUpdated: userDoc.quarterly?.lastUpdated,
                        sampleIntervals: userDoc.quarterly?.intervals?.slice(-2) || []
                    },
                    yearly: {
                        exists: !!userDoc.yearly,
                        totalViews: userDoc.yearly?.totalViews || 0,
                        totalVotes: userDoc.yearly?.totalVotes || 0,
                        intervalCount: userDoc.yearly?.intervals?.length || 0,
                        lastUpdated: userDoc.yearly?.lastUpdated,
                        sampleIntervals: userDoc.yearly?.intervals?.slice(-2) || []
                    },
                    summary: {
                        exists: !!userDoc.summary,
                        allTimeViews: userDoc.summary?.allTimeViews || 0,
                        allTimeVotes: userDoc.summary?.allTimeVotes || 0,
                        lastViewTime: userDoc.summary?.lastViewTime,
                        topArticles: (userDoc.summary?.topArticles || []).length
                    }
                },
                status: "✓ Document exists with proper schema"
            };

            await client.close();
            return new Response(JSON.stringify(structure, null, 2), { status: 200 });
        }

        // No email - show collection statistics
        const count = await collection.countDocuments();
        const docs = await collection.find({}).limit(5).toArray();

        const collectionInfo = {
            collectionName: "analytics_optimized",
            totalDocuments: count,
            sampleDocuments: docs.map(doc => ({
                userEmail: doc.userEmail,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
                timeframes: {
                    daily: { intervals: doc.daily?.intervals?.length || 0, views: doc.daily?.totalViews || 0 },
                    monthly: { intervals: doc.monthly?.intervals?.length || 0, views: doc.monthly?.totalViews || 0 },
                    quarterly: { intervals: doc.quarterly?.intervals?.length || 0, views: doc.quarterly?.totalViews || 0 },
                    yearly: { intervals: doc.yearly?.intervals?.length || 0, views: doc.yearly?.totalViews || 0 }
                },
                summary: {
                    allTimeViews: doc.summary?.allTimeViews || 0,
                    lastViewTime: doc.summary?.lastViewTime
                }
            }))
        };

        await client.close();
        return new Response(JSON.stringify(collectionInfo, null, 2), { status: 200 });

    } catch (error) {
        console.error("Error checking schema:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500 }
        );
    }
}