import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

export async function POST(request) {
    let client;
    try {
        const body = await request.json();
        const { userId, name, bio, city, country, location, educations, domains, socialLinks, profilePicture } = body;

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("DocsPost");
        const usersCollection = db.collection("users");

        // Build update object
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (city !== undefined) updateData.city = city;
        if (country !== undefined) updateData.country = country;
        if (location !== undefined) updateData.location = location;
        if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
        if (educations !== undefined) updateData.educations = educations;
        if (domains !== undefined) updateData.domains = domains;
        if (socialLinks !== undefined) {
            // Filter out empty strings to keep storage clean
            const cleanedSocialLinks = {};
            Object.entries(socialLinks).forEach(([key, value]) => {
                cleanedSocialLinks[key] = value || "";
            });
            updateData.socialLinks = cleanedSocialLinks;
        }
        updateData.updatedAt = new Date();

        // Update user document
        const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            await client.close();
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Fetch updated user
        const updatedUser = await usersCollection.findOne(
            { _id: new ObjectId(userId) }
        );

        await client.close();

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                _id: updatedUser._id.toString(),
                username: updatedUser.username,
                email: updatedUser.email,
                name: updatedUser.name || updatedUser.username,
                profilePicture: updatedUser.profilePicture || null,
                location: updatedUser.location || null,
                bio: updatedUser.bio || null,
                city: updatedUser.city || null,
                country: updatedUser.country || null,
                educations: updatedUser.educations || [],
                domains: updatedUser.domains || [],
                socialLinks: updatedUser.socialLinks || {
                    twitter: "",
                    linkedin: "",
                    github: "",
                    youtube: "",
                    instagram: "",
                    portfolio: "",
                },
                joinDate: updatedUser.joinDate || null,
            },
        });
    } catch (error) {
        console.error("Update profile error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update profile" },
            { status: 500 }
        );
    } finally {
        if (client) await client.close();
    }
}
