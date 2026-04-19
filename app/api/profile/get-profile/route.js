import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db();
        const users = db.collection("users");

        const user = await users.findOne({ email: email.toLowerCase() });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                _id: user._id.toString(),
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture || null,
                profilePicturePublicId: user.profilePicturePublicId || null,
                location: user.location || null,
                bio: user.bio || null,
                joinDate: user.joinDate || null,
            },
        });
    } catch (error) {
        console.error("Get profile error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch profile" },
            { status: 500 }
        );
    }
}
