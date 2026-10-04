import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";

export async function GET(request) {
    let client;
    try {
        const { searchParams } = new URL(request.url);
        const slug = (searchParams.get("slug") || "").trim().toLowerCase();
        const documentId = (searchParams.get("documentId") || "").trim();

        if (!slug) {
            return NextResponse.json({ available: false, error: "Slug is required" }, { status: 400 });
        }

        // Basic slug format check (lowercase alphanumeric and hyphens)
        const isValidFormat = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
        if (!isValidFormat) {
            return NextResponse.json({
                available: false,
                error: "Slug must contain only lowercase letters, numbers, and single hyphens",
            });
        }

        if (!process.env.MONGODB_URI) {
            return NextResponse.json({ error: "Database not configured" }, { status: 500 });
        }

        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("DocsPost");
        const docs = db.collection("user_documents");

        // First find if document exists with this slug
        const existing = await docs.findOne({ slug }, { projection: { _id: 1, userEmail: 1 } });

        if (!existing) {
            return NextResponse.json({
                available: true,
                slug,
                message: "Available",
            });
        }

        // If found, check if it's the user's current document
        const isCurrentDoc = Boolean(
            documentId &&
            (existing._id.toString() === documentId || (existing.documentId && existing.documentId === documentId))
        );

        if (isCurrentDoc) {
            return NextResponse.json({
                available: true,
                isCurrent: true,
                slug,
                message: "Current",
            });
        }

        return NextResponse.json({
            available: false,
            slug,
            message: "Already taken",
        });
    } catch (err) {
        console.error("Check slug error:", err);
        return NextResponse.json({ error: err.message || "Failed to check slug" }, { status: 500 });
    } finally {
        if (client) {
            await client.close();
        }
    }
}
