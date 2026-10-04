import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";

const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const toDataUri = (buffer, mimeType) => `data:${mimeType};base64,${buffer.toString("base64")}`;

export async function POST(request) {
    try {
        // Authenticate request
        const session = await getSessionUser(request);
        if (!session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file");
        const mediaType = formData.get("mediaType") || "image";

        if (!file || typeof file === "string") {
            return NextResponse.json({ error: "Missing file" }, { status: 400 });
        }

        const fileMimeType = file.type || "";
        const fileSize = file.size || 0;

        // Size limit: 5MB for images, 50MB for videos
        const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
        const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

        if (mediaType === "image") {
            if (!fileMimeType.startsWith("image/")) {
                return NextResponse.json({ error: "Only image files (JPEG, PNG, WebP, GIF) are allowed" }, { status: 400 });
            }
            if (fileSize > MAX_IMAGE_SIZE) {
                return NextResponse.json({ error: "Image size must not exceed 5MB" }, { status: 400 });
            }
        } else if (mediaType === "video") {
            if (!fileMimeType.startsWith("video/")) {
                return NextResponse.json({ error: "Expected a video file" }, { status: 400 });
            }
            if (fileSize > MAX_VIDEO_SIZE) {
                return NextResponse.json({ error: "Video size must not exceed 50MB" }, { status: 400 });
            }
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
        console.error("Upload error:", error);
        return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
    }
}
