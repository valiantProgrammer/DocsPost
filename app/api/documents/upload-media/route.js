import { NextResponse } from "next/server";

const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const toDataUri = (buffer, mimeType) => `data:${mimeType};base64,${buffer.toString("base64")}`;

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");
        const mediaType = formData.get("mediaType");

        if (!file || typeof file === "string") {
            return NextResponse.json({ error: "Missing file" }, { status: 400 });
        }

        if (mediaType !== "image" && mediaType !== "video") {
            return NextResponse.json({ error: "Invalid mediaType" }, { status: 400 });
        }

        const fileMimeType = file.type || "";
        if (mediaType === "image" && !fileMimeType.startsWith("image/")) {
            return NextResponse.json({ error: "Expected an image file" }, { status: 400 });
        }
        if (mediaType === "video" && !fileMimeType.startsWith("video/")) {
            return NextResponse.json({ error: "Expected a video file" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const dataUri = toDataUri(buffer, fileMimeType || "application/octet-stream");

        const uploadResult = await cloudinary.uploader.upload(dataUri, {
            folder: mediaType === "image" ? "docspost/documents/images" : "docspost/documents/videos",
            resource_type: mediaType === "image" ? "image" : "video",
            quality: "auto",
            fetch_format: "auto",
        });

        return NextResponse.json({
            success: true,
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            resourceType: uploadResult.resource_type,
        });
    } catch (error) {
        console.error("Document media upload error:", error);
        return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
    }
}
