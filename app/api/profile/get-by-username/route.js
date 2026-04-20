import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { MongoClient } from "mongodb";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get("username");

        if (!username) {
            return NextResponse.json(
                { error: "Username is required" },
                { status: 400 }
            );
        }

        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("DocsPost");
        const usersCollection = db.collection("users");

        const user = await usersCollection.findOne({
            username: { $regex: `^${username}$`, $options: "i" }
        });

        if (!user) {
            await client.close();
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Get user's documents
        const documentsCollection = db.collection("user_documents");
        const documents = await documentsCollection
            .find({ userEmail: user.email })
            .sort({ createdAt: -1 })
            .toArray();

        await client.close();

        return NextResponse.json({
            success: true,
            user: {
                _id: user._id.toString(),
                username: user.username,
                email: user.email,
                name: user.name || user.username,
                profilePicture: user.profilePicture || null,
                profilePicturePublicId: user.profilePicturePublicId || null,
                location: user.location || null,
                bio: user.bio || null,
                joinDate: user.joinDate || null,
            },
            documentsCount: documents.length,
            documents: documents.map(doc => ({
                _id: doc._id.toString(),
                title: doc.title,
                slug: doc.slug,
                description: doc.description,
                category: doc.category,
                views: doc.views || 0,
                createdAt: doc.createdAt,
            })),
        });
    } catch (error) {
        console.error("Get profile by username error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch profile" },
            { status: 500 }
        );
    }
}
