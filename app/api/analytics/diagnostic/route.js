import { MongoClient } from "mongodb";

/**
 * Comprehensive diagnostic endpoint
 */
export async function GET(req) {
    try {
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("DocsPost");

        // Check both collections
        const optimizedDocs = await db.collection("analytics_optimized").find().toArray();
        const oldDocs = await db.collection("analytics").countDocuments();

        console.log(`[Diagnostic] analytics_optimized collection has ${optimizedDocs.length} documents`);
        console.log(`[Diagnostic] analytics collection has ${oldDocs} documents`);

        // List all users in optimized collection
        const userEmails = optimizedDocs.map(doc => ({
            email: doc.userEmail,
            dailyIntervals: doc.daily?.intervals?.length || 0,
            monthlyIntervals: doc.monthly?.intervals?.length || 0,
            quarterlyIntervals: doc.quarterly?.intervals?.length || 0,
            yearlyIntervals: doc.yearly?.intervals?.length || 0,
            totalViews: doc.summary?.allTimeViews || 0
        }));

        await client.close();

        return new Response(
            JSON.stringify({
                success: true,
                analytics_optimized: {
                    totalDocuments: optimizedDocs.length,
                    users: userEmails
                },
                analytics_old: {
                    totalDocuments: oldDocs
                }
            }, null, 2),
            { status: 200 }
        );
    } catch (error) {
        console.error("Diagnostic error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500 }
        );
    }
}
