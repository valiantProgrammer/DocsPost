import { MongoClient } from "mongodb";

export async function POST(req) {
    let client;
    try {
        const { userEmail } = await req.json();

        if (!userEmail) {
            return new Response(
                JSON.stringify({ error: "User email is required" }),
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

        const analyticsCollection = db.collection("analytics");
        const docsCollection = db.collection("user_documents");
        const viewsCollection = db.collection("doc_views");
        const upvotesCollection = db.collection("doc_upvotes");

        let migratedCount = 0;
        let errors = [];

        // Get all documents for this user
        const userDocs = await docsCollection
            .find({ userEmail })
            .toArray();

        console.log(`Found ${userDocs.length} documents for user ${userEmail}`);

        // For each document, migrate views
        for (const doc of userDocs) {
            try {
                const docSlug = doc.slug;
                const docTitle = doc.title || "Untitled";

                // Get all views for this document
                const views = await viewsCollection
                    .find({ docId: docSlug })
                    .toArray();

                console.log(`Found ${views.length} views for doc ${docSlug}`);

                // Insert each view into analytics
                for (const view of views) {
                    try {
                        await analyticsCollection.insertOne({
                            userEmail,
                            articleId: docSlug,
                            articleTitle: docTitle,
                            type: "view",
                            timestamp: view.timestamp || new Date(),
                            date: view.date || new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
                            month: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                            year: new Date().getFullYear(),
                        });
                        migratedCount++;
                    } catch (e) {
                        // Ignore duplicate key errors
                        if (!e.message.includes("duplicate")) {
                            errors.push(`Error migrating view: ${e.message}`);
                        }
                    }
                }

                // Get all upvotes for this document
                const upvotes = await upvotesCollection
                    .find({ docId: docSlug })
                    .toArray();

                console.log(`Found ${upvotes.length} upvotes for doc ${docSlug}`);

                // Insert each upvote into analytics
                for (const upvote of upvotes) {
                    try {
                        await analyticsCollection.insertOne({
                            userEmail,
                            articleId: docSlug,
                            articleTitle: docTitle,
                            type: "vote",
                            voteType: "like",
                            voterEmail: upvote.userEmail,
                            timestamp: upvote.timestamp || new Date(),
                            date: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
                            month: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                            year: new Date().getFullYear(),
                        });
                        migratedCount++;
                    } catch (e) {
                        // Ignore duplicate key errors
                        if (!e.message.includes("duplicate")) {
                            errors.push(`Error migrating upvote: ${e.message}`);
                        }
                    }
                }
            } catch (e) {
                errors.push(`Error processing document ${doc.slug}: ${e.message}`);
            }
        }

        await client.close();

        return new Response(
            JSON.stringify({
                success: true,
                message: `Migration completed. Migrated ${migratedCount} records`,
                migratedCount,
                errors: errors.length > 0 ? errors : undefined,
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error during migration:", error.message, error.stack);
        return new Response(
            JSON.stringify({ error: error.message || "Failed to complete migration" }),
            { status: 500 }
        );
    } finally {
        if (client) {
            await client.close();
        }
    }
}
