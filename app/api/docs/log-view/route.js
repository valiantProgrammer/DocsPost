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
        const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

        console.log(`[View Logged] DocID: ${docId}, User: ${userEmail || "anonymous"}, Time: ${now.toISOString()}`);

        const docsCollection = db.collection("user_documents");
        const document = await docsCollection.findOne({ slug: docId });

        if (!document) {
            console.warn(`[View Warning] Document not found for slug: ${docId}`);
        } else {
            console.log(`[View Success] Document author: ${document.userEmail}`);
        }

        const viewsCollection = db.collection("doc_views");
        await viewsCollection.insertOne({
            docId,
            userEmail: userEmail || "anonymous",
            timestamp: now,
            date: utcDate,
        });

        const statsCollection = db.collection("doc_stats");
        await statsCollection.updateOne(
            { docId },
            {
                $inc: { views: 1 },
                $set: { lastViewed: now },
            },
            { upsert: true }
        );

        if (document && document.userEmail) {
            console.warn(`[Analytics Skip] Document not found or no author email. Doc: ${docId}`);
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
