import { MongoClient } from "mongodb";

export async function POST(req) {
    let client;
    try {
        const { docId, userEmail, reason, description } = await req.json();

        if (!docId || !reason) {
            return new Response(
                JSON.stringify({ error: "Doc ID and reason are required" }),
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

        const reportsCollection = db.collection("doc_reports");

        // Check if user already reported this doc
        const existingReport = await reportsCollection.findOne({
            docId,
            userEmail: userEmail || "anonymous",
        });

        if (existingReport) {
            return new Response(
                JSON.stringify({
                    error: "You have already reported this document",
                }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Create report
        await reportsCollection.insertOne({
            docId,
            userEmail: userEmail || "anonymous",
            reason,
            description: description || "",
            timestamp: new Date(),
            status: "pending",
        });

        return new Response(
            JSON.stringify({
                success: true,
                message: "Report submitted successfully. Thank you for your feedback.",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error reporting doc:", error.message, error.stack);
        return new Response(
            JSON.stringify({ error: error.message || "Failed to submit report" }),
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

        const reportsCollection = db.collection("doc_reports");

        // Get report count for this doc
        const reportCount = await reportsCollection.countDocuments({ docId });

        return new Response(
            JSON.stringify({
                success: true,
                reportCount,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error fetching reports:", error.message, error.stack);
        return new Response(
            JSON.stringify({ error: error.message || "Failed to fetch reports" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    } finally {
        if (client) {
            await client.close();
        }
    }
}
