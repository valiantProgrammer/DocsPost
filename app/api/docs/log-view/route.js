import { MongoClient } from "mongodb";

export async function POST(req) {
    let client;
    try {
        const { docId, userEmail } = await req.json();

        if (!docId) {
            return new Response(
                JSON.stringify({ error: "Doc ID is required" }),
                { status: 400 }
            );
        }

        if (!process.env.MONGODB_URI) {
            console.error("MONGODB_URI is not set");
            return new Response(
                JSON.stringify({ error: "Database connection not configured" }),
                { status: 500 }
            );
        }

        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("DocsPost");

        const now = new Date();

        // Get document info to retrieve the author's email (docId is actually the slug)
        const docsCollection = db.collection("user_documents");
        const document = await docsCollection.findOne({ slug: docId });

        // Log the view
        const viewsCollection = db.collection("doc_views");
        await viewsCollection.insertOne({
            docId,
            userEmail: userEmail || "anonymous",
            timestamp: now,
            date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        });

        // Update doc stats
        const statsCollection = db.collection("doc_stats");
        await statsCollection.updateOne(
            { docId },
            {
                $inc: { views: 1 },
                $set: { lastViewed: now },
            },
            { upsert: true }
        );

        // Also log to analytics collection (for the document author's analytics dashboard)
        if (document && document.userEmail) {
            const analyticsCollection = db.collection("analytics");
            await analyticsCollection.insertOne({
                userEmail: document.userEmail, // Author of the document
                articleId: docId,
                articleTitle: document.title || "Untitled",
                type: "view",
                timestamp: now,
                date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                month: new Date(now.getFullYear(), now.getMonth(), 1),
                year: now.getFullYear(),
            });
        }

        return new Response(
            JSON.stringify({ success: true, message: "View logged" }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error logging view:", error.message, error.stack);
        return new Response(
            JSON.stringify({ error: error.message || "Failed to log view" }),
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.close();
        }
    }
}
