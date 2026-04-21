import { MongoClient } from "mongodb";

/**
 * Debug endpoint to dump raw analytics data from the database
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

        // Fetch the raw document
        const analyticsDoc = await db.collection("analytics_optimized").findOne(
            { userEmail }
        );

        await client.close();

        if (!analyticsDoc) {
            return new Response(
                JSON.stringify({ message: "No analytics document found for this user" }),
                { status: 404 }
            );
        }

        // Return the full document
        return new Response(
            JSON.stringify({
                success: true,
                userEmail,
                documentFound: true,
                _id: analyticsDoc._id,
                createdAt: analyticsDoc.createdAt,
                updatedAt: analyticsDoc.updatedAt,
                // Check each timeframe
                daily: {
                    intervalCount: analyticsDoc.daily?.intervals?.length || 0,
                    isArray: Array.isArray(analyticsDoc.daily?.intervals),
                    sampleInterval: analyticsDoc.daily?.intervals?.[0] || null,
                    totalViews: analyticsDoc.daily?.totalViews || 0
                },
                monthly: {
                    intervalCount: analyticsDoc.monthly?.intervals?.length || 0,
                    isArray: Array.isArray(analyticsDoc.monthly?.intervals),
                    sampleInterval: analyticsDoc.monthly?.intervals?.[0] || null,
                    totalViews: analyticsDoc.monthly?.totalViews || 0
                },
                quarterly: {
                    intervalCount: analyticsDoc.quarterly?.intervals?.length || 0,
                    isArray: Array.isArray(analyticsDoc.quarterly?.intervals),
                    sampleInterval: analyticsDoc.quarterly?.intervals?.[0] || null,
                    totalViews: analyticsDoc.quarterly?.totalViews || 0
                },
                yearly: {
                    intervalCount: analyticsDoc.yearly?.intervals?.length || 0,
                    isArray: Array.isArray(analyticsDoc.yearly?.intervals),
                    sampleInterval: analyticsDoc.yearly?.intervals?.[0] || null,
                    totalViews: analyticsDoc.yearly?.totalViews || 0
                },
                summary: {
                    allTimeViews: analyticsDoc.summary?.allTimeViews || 0,
                    topArticlesCount: analyticsDoc.summary?.topArticles?.length || 0,
                    activeArticles: analyticsDoc.summary?.activeArticles || 0
                }
            }, null, 2),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error dumping analytics:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500 }
        );
    }
}
