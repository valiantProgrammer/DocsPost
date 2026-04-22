"use client"
import { useState, useEffect } from "react";
import { FiMail, FiMapPin, FiUser, FiFileText, FiBookmark, FiExternalLink, FiGithub, FiLinkedin } from "react-icons/fi";
import { FaTwitter, FaYoutube, FaInstagram, FaGlobe } from "react-icons/fa";
import ProfileEdit from "./ProfileEdit";
import "./ProfileView.css";
import ProfilePictureModal from "./ProfilePictureModal";

const SOCIAL_ICONS = {
    twitter: FaTwitter,
    linkedin: FiLinkedin,
    github: FiGithub,
    youtube: FaYoutube,
    instagram: FaInstagram,
    portfolio: FaGlobe,
    website: FaGlobe,
};

export default function ProfileView({ userData, userEmail, userName }) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        name: userData?.name || userData?.username || userName || "User",
        email: userEmail || userData?.email || "user@example.com",
        location: userData?.location || "Not specified",
        city: userData?.city || "",
        country: userData?.country || "",
        bio: userData?.bio || "Welcome to my profile!",
        educations: userData?.educations || [],
        domains: userData?.domains || [],
        socialLinks: userData?.socialLinks || {
            twitter: "",
            linkedin: "",
            github: "",
            youtube: "",
            instagram: "",
            portfolio: "",
        },
        joinDate: userData?.joinDate || "2024",
        followers: 128,
        following: 45,
        articlesCount: 4,
        profileImage: (userData?.name || userData?.username || userName)?.charAt(0).toUpperCase(),
        profilePicture: userData?.profilePicture,
        userId: userData?._id,
    });
    const [isUploadingPicture, setIsUploadingPicture] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);


    useEffect(() => {
        console.log(userData);
    }, [userData]);

    useEffect(() => {
        if (userData) {
            setProfileData(prev => ({
                ...prev,
                userId: userData._id,
                profilePicture: userData.profilePicture,
            }));
        }
    }, [userData]);

    useEffect(() => {
        const handleUpdate = async () => {
            // ...
        };

        window.addEventListener("profilePictureUpdated", handleUpdate);

        return () => {
            window.removeEventListener("profilePictureUpdated", handleUpdate);
        };
    }, [profileData.userId]);



    useEffect(() => {
        console.log(userData);
    }, []);
    useEffect(() => {
        const handleUpdate = async () => {
            try {
                const res = await fetch(`/api/user/${profileData.userId}`);
                const data = await res.json();

                setProfileData(prev => ({
                    ...prev,
                    profilePicture: data.profilePicture
                }));
            } catch (err) {
                console.error(err);
            }
        };

        window.addEventListener("profilePictureUpdated", handleUpdate);

        return () => {
            window.removeEventListener("profilePictureUpdated", handleUpdate);
        };
    }, [profileData.userId]);

    const handleProfilePictureUpload = async (base64String) => {
        if (!profileData.userId) {
            alert("User ID not found. Please refresh the page.");
            return;
        }

        setIsUploadingPicture(true);
        try {
            const response = await fetch("/api/profile/upload-picture", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    imageBase64: base64String,
                    userId: profileData.userId,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsModalOpen(false);
                alert("Profile picture updated successfully!");
                window.dispatchEvent(new Event("profilePictureUpdated"));
            } else {
                alert(data.error || "Failed to upload profile picture");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload profile picture");
        } finally {
            setIsUploadingPicture(false);
        }
    };

    const handleProfilePictureDelete = async () => {
        if (!profileData.userId) {
            alert("User ID not found. Please refresh the page.");
            return;
        }

        if (!confirm("Are you sure you want to delete your profile picture?")) {
            return;
        }

        setIsUploadingPicture(true);
        try {
            const response = await fetch("/api/profile/delete-picture", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: profileData.userId,
                    publicId: "",
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsModalOpen(false);
                alert("Profile picture deleted successfully!");
                window.dispatchEvent(new Event("profilePictureUpdated"));
            } else {
                alert(data.error || "Failed to delete profile picture");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to delete profile picture");
        } finally {
            setIsUploadingPicture(false);
        }
    };

    const handleEditClose = (updatedData) => {
        if (updatedData) {
            setProfileData(prev => ({
                ...prev,
                ...updatedData
            }));
        }
        setIsEditMode(false);
    };

    return (
        <div className="profile-view-container">
            {/* Profile Header Section - Form Style */}
            <section className="profile-header-section profile-header-form">
                {isEditMode ? (
                    <ProfileEdit
                        profileData={profileData}
                        onClose={handleEditClose}
                        userId={profileData.userId}
                        isInline={true}
                    />
                ) : (
                    <div className="profile-header-content">

                        <ProfilePictureModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            profilePicture={profileData?.profilePicture}
                            userName={profileData.name}
                            onUpload={handleProfilePictureUpload}
                            onDelete={handleProfilePictureDelete}
                            isLoading={isUploadingPicture}
                        />
                        <div
                            className="profile-avatar"
                            onClick={() => setIsModalOpen(true)}
                        >
                            {profileData.profilePicture ? (
                                <img src={profileData.profilePicture} alt="profile" />
                            ) : (
                                <span>{profileData.profileImage}</span>
                            )}
                        </div>
                        <div className="profile-header-info">
                            <h1 className="profile-name">{profileData.name}</h1>

                            {/* Bio Display */}
                            {profileData.bio && (
                                <p className="profile-bio">{profileData.bio}</p>
                            )}

                            <div className="profile-meta-info">
                                <div className="meta-item">
                                    <FiMail size={16} />
                                    <span>{profileData.email}</span>
                                </div>
                                {profileData.country && (
                                    <div className="meta-item">
                                        <FiMapPin size={16} />
                                        <span>{profileData.city && `${profileData.city}, `}{profileData.country}</span>
                                    </div>
                                )}
                            </div>

                            {/* Social Links */}
                            {Object.values(profileData.socialLinks || {}).some(link => link) && (
                                <div className="social-links-wrapper">
                                    <div className="social-links-label">Connect</div>
                                    <div className="social-links-container">
                                        {Object.entries(profileData.socialLinks || {}).map(([platform, url]) => {
                                            if (!url) return null;
                                            const IconComponent = SOCIAL_ICONS[platform];
                                            return (
                                                <a
                                                    key={platform}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`social-link social-link-${platform}`}
                                                    title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                                                >
                                                    {IconComponent && <IconComponent size={20} />}
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Domains/Expertise Badges */}
                            {profileData.domains && profileData.domains.length > 0 && (
                                <div className="badges-section">
                                    <div className="badges-label">Expertise</div>
                                    <div className="badges-container">
                                        {profileData.domains.map((domain, index) => (
                                            <span key={index} className="badge badge-domain">
                                                {domain}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Institutions/Education Badges */}
                            {profileData.educations && profileData.educations.length > 0 && (
                                <div className="badges-section">
                                    <div className="badges-label">Institutions</div>
                                    <div className="badges-container">
                                        {profileData.educations.map((edu, index) => (
                                            <span key={index} className="badge badge-education">
                                                {edu}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="profile-stats-row">
                                <div className="stat-item">
                                    <span className="stat-number">{profileData.followers}</span>
                                    <span className="stat-label">Followers</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">{profileData.following}</span>
                                    <span className="stat-label">Following</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">{profileData.articlesCount}</span>
                                    <span className="stat-label">Articles</span>
                                </div>
                            </div>

                            <button
                                className="btn-edit-profile"
                                onClick={() => setIsEditMode(true)}
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}