"use client";

import React, { useState, useRef } from "react";
import { FiUploadCloud, FiX, FiRefreshCw, FiImage } from "react-icons/fi";

export default function CoverImageField({ imageUrl, onImageChange, onImageRemove }) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const fileInputRef = useRef(null);

    const handleUpload = async (file) => {
        if (!file) return;

        // Validation
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!validTypes.includes(file.type)) {
            setErrorMessage("Only JPG, PNG, and WebP images are allowed.");
            return;
        }

        const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
        if (file.size > MAX_SIZE) {
            setErrorMessage("File exceeds 5MB size limit.");
            return;
        }

        setErrorMessage("");
        setIsUploading(true);
        setUploadProgress(20);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("mediaType", "image");

            setUploadProgress(50);
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            setUploadProgress(85);
            const data = await res.json();

            if (!res.ok || !data.url) {
                throw new Error(data.error || "Upload failed");
            }

            setUploadProgress(100);
            onImageChange(data.url);
        } catch (err) {
            console.error("Cover image upload failed:", err);
            setErrorMessage(err.message || "Failed to upload image");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer?.files?.[0];
        if (file) handleUpload(file);
    };

    return (
        <div className="setting-field-group">
            <label className="setting-label">Cover Image</label>

            {imageUrl ? (
                <div className="cover-image-container">
                    <img src={imageUrl} alt="Document cover preview" className="cover-image-preview" />
                    <button
                        type="button"
                        onClick={onImageRemove}
                        className="cover-image-remove-btn"
                        aria-label="Remove cover image"
                        title="Remove cover image"
                    >
                        <FiX />
                    </button>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="cover-image-change-btn"
                    >
                        <FiImage />
                        <span>Change Image</span>
                    </button>
                </div>
            ) : (
                <div
                    className="cover-image-dropzone"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    {isUploading ? (
                        <>
                            <FiRefreshCw className="animate-spin" style={{ fontSize: "24px", color: "var(--editor-primary)" }} />
                            <span className="dropzone-label">Uploading image ({uploadProgress}%)...</span>
                        </>
                    ) : (
                        <>
                            <FiUploadCloud className="dropzone-icon" />
                            <span className="dropzone-label">Upload image</span>
                            <span className="dropzone-sub">Drag and drop, or browse (max 5 MB)</span>
                        </>
                    )}
                </div>
            )}

            {errorMessage && (
                <span style={{ fontSize: "11px", color: "var(--editor-danger)" }}>
                    {errorMessage}
                </span>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                style={{ display: "none" }}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                }}
            />
        </div>
    );
}
