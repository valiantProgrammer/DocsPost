"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import AnalyticsDashboard from "@/app/components/AnalyticsDashboard";
import UserWorkspace from "@/app/components/UserWorkspace";
import { useTheme } from "@/app/providers/ThemeProvider";
import { FiUser, FiMail, FiMapPin, FiFileText, FiBarChart2, FiEye } from "react-icons/fi";
import Link from "next/link";

export default function UserProfile() {
    const { isDark } = useTheme();
    const params = useParams();
    const router = useRouter();
    const username = params?.username;

    const [activeTab, setActiveTab] = useState("overview");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userLocation, setUserLocation] = useState("Not specified");
    const [userBio, setUserBio] = useState("Welcome to my profile!");
    const [userJoinDate, setUserJoinDate] = useState("2024");
    const [profilePicture, setProfilePicture] = useState(null);
    const [userDocuments, setUserDocuments] = useState([]);

    // Fetch user profile and documents
    useEffect(() => {
        if (!username) return;

        const fetchUserProfile = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch(
                    `/api/profile/get-by-username?username=${encodeURIComponent(username)}`
                );

                if (!response.ok) {
                    if (response.status === 404) {
                        setError(`User "${username}" not found`);
                    } else {
                        setError("Failed to load profile");
                    }
                    setIsLoading(false);
                    return;
                }

                const data = await response.json();
                const user = data.user;

                setUserName(user.name || user.username);
                setUserEmail(user.email);
                setUserLocation(user.location || "Not specified");
                setUserBio(user.bio || "Welcome to my profile!");
                setUserJoinDate(user.joinDate ? new Date(user.joinDate).getFullYear() : "2024");
                setProfilePicture(user.profilePicture);
                setUserDocuments(data.documents || []);
            } catch (error) {
                console.error("Error fetching profile:", error);
                setError("Failed to load profile. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, [username]);

    // Construct user data from state
    const userData = {
        name: userName || "User",
        email: userEmail || "user@example.com",
        location: userLocation || "Not specified",
        bio: userBio || "Welcome to my profile!",
        joinDate: userJoinDate || "2024",
        profileImage: userName.charAt(0).toUpperCase(),
        profilePicture: profilePicture,
    };

    if (isLoading) {
        return (
            <div className="profile-page">
                <Header />
                <div className="profile-loading">
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-page">
                <Header />
                <div className="profile-error">
                    <p>{error}</p>
                    <Link href="/">← Go back home</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <Header />

            <div className="profile-container">
                {/* Profile Header */}
                <div className="profile-header">
                    <div className="profile-header-content">
                        <div className="profile-avatar-section">
                            <div className="profile-avatar">
                                {userData.profilePicture ? (
                                    <img
                                        src={userData.profilePicture}
                                        alt={userData.name}
                                        className="profile-avatar-img"
                                    />
                                ) : (
                                    <div className="profile-avatar-placeholder">
                                        {userData.profileImage}
                                    </div>
                                )}
                            </div>
                            <div className="profile-info">
                                <h1 className="profile-name">{userData.name}</h1>
                                <p className="profile-username">@{username}</p>
                                <p className="profile-bio">{userData.bio}</p>
                                <div className="profile-details">
                                    {userData.location !== "Not specified" && (
                                        <span className="detail">
                                            <FiMapPin size={16} />
                                            {userData.location}
                                        </span>
                                    )}
                                    <span className="detail">
                                        <FiUser size={16} />
                                        Joined {userData.joinDate}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Tabs */}
                <div className="profile-tabs">
                    <button
                        className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
                        onClick={() => setActiveTab("overview")}
                    >
                        <FiFileText size={18} />
                        Articles
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`}
                        onClick={() => setActiveTab("analytics")}
                    >
                        <FiBarChart2 size={18} />
                        Analytics
                    </button>
                </div>

                {/* Profile Content */}
                <div className="profile-content">
                    {/* Overview Tab - Articles List */}
                    {activeTab === "overview" && (
                        <div className="profile-tab-content">
                            {userDocuments.length > 0 ? (
                                <div className="articles-grid">
                                    {userDocuments.map((article) => (
                                        <Link
                                            href={`/doc/${article.slug}`}
                                            key={article._id}
                                            className="article-card"
                                        >
                                            <div className="article-header">
                                                <h3 className="article-title">{article.title}</h3>
                                            </div>
                                            <p className="article-excerpt">{article.description}</p>
                                            <div className="article-meta">
                                                <span className="category">{article.category}</span>
                                                <span className="views">
                                                    <FiEye size={14} />
                                                    {article.views || 0}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <p>No articles published yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === "analytics" && userEmail && (
                        <div className="profile-tab-content">
                            <AnalyticsDashboard userEmail={userEmail} />
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .profile-error {
                    padding: 40px 20px;
                    text-align: center;
                    max-width: 600px;
                    margin: 60px auto;
                }

                .profile-error p {
                    font-size: 1.1rem;
                    color: var(--text-muted);
                    margin-bottom: 20px;
                }

                .profile-error a {
                    color: var(--brand);
                    text-decoration: none;
                    font-weight: 500;
                }

                .profile-error a:hover {
                    text-decoration: underline;
                }

                .profile-loading {
                    padding: 60px 20px;
                    text-align: center;
                    color: var(--text-muted);
                }

                .articles-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                    margin-top: 20px;
                }

                .article-card {
                    background: var(--panel-bg);
                    border: 1px solid var(--line);
                    border-radius: 12px;
                    padding: 20px;
                    text-decoration: none;
                    color: var(--text-main);
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .article-card:hover {
                    border-color: var(--brand);
                    box-shadow: 0 4px 12px rgba(17, 138, 99, 0.1);
                    transform: translateY(-2px);
                }

                .article-title {
                    margin: 0 0 10px 0;
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--text-main);
                }

                .article-excerpt {
                    margin: 0 0 15px 0;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    line-height: 1.5;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .article-meta {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }

                .category {
                    background: var(--brand);
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .views {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    margin-left: auto;
                }

                .empty-state {
                    padding: 60px 20px;
                    text-align: center;
                    color: var(--text-muted);
                }
            `}</style>
        </div>
    );
}
