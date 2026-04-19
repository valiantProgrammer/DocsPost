"use client"
import { useRef } from "react";
import { FiX, FiEye, FiTrash2, FiUpload } from "react-icons/fi";
import "./ProfilePictureModal.css";

export default function ProfilePictureModal({
    isOpen,
    onClose,
    profilePicture,
    userName,
    onUpload,
    onDelete,
    isLoading,
}) {
    const fileInputRef = useRef(null);

    const handleViewClick = () => {
        if (profilePicture) {
            window.open(profilePicture, "_blank");
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image file");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be less than 5MB");
            return;
        }

        // Read file as base64
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64String = event.target?.result;
            if (base64String) {
                await onUpload(base64String);
            }
        };
        reader.readAsDataURL(file);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    if (!isOpen) return null;

    return (
        <div className="profile-picture-modal-overlay" onClick={onClose}>
            <div
                className="profile-picture-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="modal-header">
                    <h2>Profile Picture</h2>
                    <button
                        className="close-btn"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Preview Section */}
                {profilePicture && (
                    <div className="modal-preview">
                        <img
                            src={profilePicture}
                            alt={userName}
                            className="preview-image"
                        />
                    </div>
                )}

                {/* Options */}
                <div className="modal-options">
                    {profilePicture && (
                        <button
                            className="option-btn view-btn"
                            onClick={handleViewClick}
                            disabled={isLoading}
                        >
                            <FiEye size={18} />
                            <span>View DP</span>
                        </button>
                    )}

                    <button
                        className="option-btn upload-btn"
                        onClick={handleUploadClick}
                        disabled={isLoading}
                    >
                        <FiUpload size={18} />
                        <span>{profilePicture ? "Update DP" : "Upload DP"}</span>
                    </button>

                    {profilePicture && (
                        <button
                            className="option-btn delete-btn"
                            onClick={onDelete}
                            disabled={isLoading}
                        >
                            <FiTrash2 size={18} />
                            <span>Delete DP</span>
                        </button>
                    )}
                </div>

                {/* Hidden File Input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                />

                {/* Loading State */}
                {isLoading && (
                    <div className="modal-loading">
                        <div className="spinner"></div>
                        <p>Processing...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
