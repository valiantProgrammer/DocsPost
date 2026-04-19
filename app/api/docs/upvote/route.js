import { MongoClient } from "mongodb";

export async function POST(req) {
    let client;
    try {
        const { docId, userEmail } = await req.json();

        if (!docId || !userEmail) {
            return new Response(
                JSON.stringify({ error: "Doc ID and user email are required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        if (!process.env.MONGODB_URI) {
            console.error("MONGODB_URI is not set");
            return new Response(
                JSON.stringify({ error: "Database connection not configured" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("DocsPost");

        const upvotesCollection = db.collection("doc_upvotes");
        const statsCollection = db.collection("doc_stats");

        // Check if user already upvoted
        const existingUpvote = await upvotesCollection.findOne({
            docId,
            userEmail,
        });

        if (existingUpvote) {
            // Remove upvote (toggle off)
            await upvotesCollection.deleteOne({
                docId,
                userEmail,
            });

            await statsCollection.updateOne(
                { docId },
                { $inc: { upvotes: -1 } },
                { upsert: true }
            );

            return new Response(
                JSON.stringify({
                    success: true,
                    message: "Upvote removed",
                    isUpvoted: false,
                }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                }
            );
        } else {
            // Add upvote
            await upvotesCollection.insertOne({
                docId,
                userEmail,
                timestamp: new Date(),
            });

            await statsCollection.updateOne(
                { docId },
                {
                    $inc: { upvotes: 1 },
                    $set: { lastUpvoted: new Date() },
                },
                { upsert: true }
            );

            return new Response(
                JSON.stringify({
                    success: true,
                    message: "Upvoted successfully",
                    isUpvoted: true,
                }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                }
            );
        }
    } catch (error) {
        console.error("Error upvoting:", error.message, error.stack);
        return new Response(
            JSON.stringify({ error: error.message || "Failed to process upvote" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    } finally {
        if (client) {
            await client.close();
        }
    }
}

export async function GET(req) {
    let client;
    try {
        const { searchParams } = new URL(req.url);
        const docId = searchParams.get("docId");
        const userEmail = searchParams.get("userEmail");

        if (!docId) {
            return new Response(
                JSON.stringify({ error: "Doc ID is required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        if (!process.env.MONGODB_URI) {
            console.error("MONGODB_URI is not set");
            return new Response(
                JSON.stringify({ error: "Database connection not configured" }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("DocsPost");

        const upvotesCollection = db.collection("doc_upvotes");

        // Get total upvotes for this doc
        const upvoteCount = await upvotesCollection.countDocuments({ docId });

        // Check if current user has upvoted
        let isUpvoted = false;
        if (userEmail) {
            const userUpvote = await upvotesCollection.findOne({
                docId,
                userEmail,
            });
            isUpvoted = !!userUpvote;
        }

        return new Response(
            JSON.stringify({
                success: true,
                upvoteCount,
                isUpvoted,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error fetching upvotes:", error.message, error.stack);
        return new Response(
            JSON.stringify({ error: error.message || "Failed to fetch upvotes" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    } finally {
        if (client) {
            await client.close();
        }
    }
}
