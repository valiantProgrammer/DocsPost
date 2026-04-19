import { NextResponse } from "next/server";
import clientPromise from "@/lib/db";
import { ObjectId } from "mongodb";

const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
    try {
        const { imageBase64, userId } = await request.json();

        if (!imageBase64 || !userId) {
            return NextResponse.json(
                { error: "Missing image or user ID" },
                { status: 400 }
            );
        }

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(imageBase64, {
            folder: "docspost/profile-pictures",
            resource_type: "auto",
            quality: "auto",
            fetch_format: "auto",
        });

        // Update user in MongoDB
        const client = await clientPromise;
        const db = client.db();
        const users = db.collection("users");

        const updateResult = await users.updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    profilePicture: uploadResult.secure_url,
                    profilePicturePublicId: uploadResult.public_id,
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
            profilePicture: uploadResult.secure_url,
            message: "Profile picture updated successfully",
        });
    } catch (error) {
        console.error("Profile picture upload error:", error);
        return NextResponse.json(
            { error: error.message || "Upload failed" },
            { status: 500 }
        );
    }
}
