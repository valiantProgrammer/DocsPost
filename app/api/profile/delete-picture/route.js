import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request) {
    try {
        const { userId, publicId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: "Missing user ID" },
                { status: 400 }
            );
        }

        // Delete from Cloudinary if public ID is provided
        if (publicId) {
            try {
                await cloudinary.uploader.destroy(publicId);
            } catch (error) {
                console.error("Cloudinary deletion error:", error);
                // Continue even if Cloudinary deletion fails
            }
        }

        // Update user in MongoDB
        const client = await clientPromise;
        const db = client.db();
        const users = db.collection("users");

        const updateResult = await users.updateOne(
            { _id: new ObjectId(userId) },
            {
                $unset: {
                    profilePicture: "",
                    profilePicturePublicId: "",
                },
                $set: {
                    updatedAt: new Date(),
                },
            }
        );

        if (updateResult.modifiedCount === 0) {
            return NextResponse.json(
                { error: "Failed to update user profile" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Profile picture deleted successfully",
        });
    } catch (error) {
        console.error("Profile picture deletion error:", error);
        return NextResponse.json(
            { error: error.message || "Deletion failed" },
            { status: 500 }
        );
    }
}
