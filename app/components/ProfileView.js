"use client"
import { useState } from "react";
import { FiMail, FiMapPin, FiUser, FiFileText, FiBookmark, FiExternalLink, FiGithub, FiLinkedin } from "react-icons/fi";
import { FaTwitter, FaYoutube, FaInstagram, FaGlobe } from "react-icons/fa";
import ProfileEdit from "./ProfileEdit";
import "./ProfileView.css";

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

    const articles = [
        {
            id: 1,
            title: "Understanding Data Structures: Arrays vs Linked Lists",
            excerpt: "A comprehensive guide to choosing the right data structure for your use case.",
            date: "April 15, 2024",
            views: 2340,
            likes: 156,
            category: "DSA"
        },
        {
            id: 2,
            title: "React Hooks Deep Dive: useContext and useReducer",
            excerpt: "Learn advanced React patterns and optimize your component architecture.",
            date: "April 10, 2024",
            views: 1890,
            likes: 234,
            category: "React"
        },
        {
            id: 3,
            title: "Building Scalable APIs with Node.js and MongoDB",
            excerpt: "Best practices for creating production-ready backend applications.",
            date: "April 5, 2024",
            views: 3120,
            likes: 412,
            category: "Backend"
        },
        {
            id: 4,
            title: "CSS Grid vs Flexbox: When to Use Each",
            excerpt: "Master modern CSS layout techniques and responsive design patterns.",
            date: "March 28, 2024",
            views: 2680,
            likes: 389,
            category: "CSS"
        }
    ];

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
                        <div className="profile-avatar-wrapper">
                            {profileData.profilePicture ? (
                                <img
                                    src={profileData.profilePicture}
                                    alt={profileData.name}
                                    className="profile-avatar-image"
                                />
                            ) : (
                                <div className="profile-avatar-placeholder">
                                    {profileData.profileImage}
                                </div>
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