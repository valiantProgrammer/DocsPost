"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/providers/ThemeProvider";
import Header from "@/app/components/Header";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import AnalyticsDashboard from "@/app/components/AnalyticsDashboard";
import ProfilePictureModal from "@/app/components/ProfilePictureModal";
import UserWorkspace from "@/app/components/UserWorkspace";
import { FiUser, FiMail, FiMapPin, FiBookmark, FiEdit2, FiFileText, FiBarChart2, FiBriefcase } from "react-icons/fi";
import "./dashboard.css";

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState("analytics");
    const [userEmail, setUserEmail] = useState("");
    const [userName, setUserName] = useState("");
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { mounted } = useTheme();
    const router = useRouter();

    useEffect(() => {
        const savedAuth = localStorage.getItem("docspost-auth");
        const savedEmail = localStorage.getItem("docspost-email");
        const savedUsername = localStorage.getItem("docspost-username");

        if (savedAuth !== "signed-in") {
            router.push("/Auth?mode=signin");
            return;
        }

        setUserEmail(savedEmail || "");
        setUserName(savedUsername || "");

        // Fetch user profile data
        const fetchUserData = async () => {
            try {
                if (savedEmail) {
                    const response = await fetch(
                        `/api/profile/get-profile?email=${encodeURIComponent(savedEmail)}`
                    );
                    if (response.ok) {
                        const data = await response.json();
                        setUserData(data.user);
                    }
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (savedEmail) {
            fetchUserData();
        }
    }, [router]);

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return <DashboardView userName={userName} />;
            case "analytics":
                return <AnalyticsView userEmail={userEmail} />;
            case "profile":
                return <ProfileView userData={userData} userEmail={userEmail} userName={userName} />;
            case "workspace":
            case "workplace":
                return <WorkplaceView />;
            case "settings":
                return <SettingsView />;
            default:
                return <DashboardView userName={userName} />;
        }
    };

    if (loading || !mounted) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Header />
            <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
            <main className="dashboard-main">
                {renderContent()}
            </main>
        </div>
    );
}

// Dashboard View Component
function DashboardView({ userName }) {
    return (
        <div className="dashboard-view">
            <div className="view-header">
                <h1>Welcome, {userName}! 👋</h1>
                <p>Here's your dashboard overview</p>
            </div>

            {/* Top Metrics */}
            <div className="metrics-grid">
                <MetricCard
                    title="Total Documents"
                    value="12"
                    change="+2"
                    changeType="positive"
                    color="#ec4899"
                />
                <MetricCard
                    title="Total Views"
                    value="2,340"
                    change="+15%"
                    changeType="positive"
                    color="#06b6d4"
                />
                <MetricCard
                    title="Total Likes"
                    value="456"
                    change="+8%"
                    changeType="positive"
                    color="#8b5cf6"
                />
                <MetricCard
                    title="Engagement Rate"
                    value="19.5%"
                    change="+3.2%"
                    changeType="positive"
                    color="#f59e0b"
                />
            </div>

            {/* Featured Cards */}
            <div className="featured-section">
                <div className="featured-card featured-primary">
                    <div className="card-content">
                        <h3>Start Creating Documents</h3>
                        <p>Build your knowledge base by creating and sharing documents with the community.</p>
                        <a href="/docs/create" className="card-link">Create Now →</a>
                    </div>
                    <div className="card-icon">🚀</div>
                </div>

                <div className="featured-card featured-secondary">
                    <div className="card-content">
                        <h3>Explore Community</h3>
                        <p>Discover amazing documents from other creators and boost your learning.</p>
                        <a href="/search" className="card-link">Explore →</a>
                    </div>
                    <div className="card-icon">🌟</div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="quick-stats">
                <h2>Quick Statistics</h2>
                <div className="stats-grid">
                    <StatItem label="Documents" value="12" icon="📄" />
                    <StatItem label="Total Views" value="2.3K" icon="👁️" />
                    <StatItem label="Likes Received" value="456" icon="❤️" />
                    <StatItem label="Followers" value="23" icon="👥" />
                </div>
            </div>
        </div>
    );
}

// Analytics View Component
function AnalyticsView({ userEmail }) {
    return (
        <div className="analytics-view">
            <div className="view-header">
                <h1>Analytics Dashboard</h1>
                <p>Track your content performance</p>
            </div>
            <AnalyticsDashboard userEmail={userEmail} />
        </div>
    );
}

// Profile View Component
function ProfileView({ userData, userEmail, userName }) {
    const [profileTabActive, setProfileTabActive] = useState("overview");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploadingPicture, setIsUploadingPicture] = useState(false);

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

    const profileData = {
        name: userData?.name || userName || "User",
        email: userEmail || userData?.email || "user@example.com",
        location: userData?.location || "Not specified",
        bio: userData?.bio || "Welcome to my profile!",
        joinDate: userData?.joinDate || "2024",
        followers: 128,
        following: 45,
        articlesCount: articles.length,
        profileImage: (userData?.name || userName)?.charAt(0).toUpperCase(),
        profilePicture: userData?.profilePicture,
        userId: userData?._id,
    };

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

    return (
        <div className="profile-view">
            <ProfilePictureModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                profilePicture={profileData.profilePicture}
                userName={profileData.name}
                onUpload={handleProfilePictureUpload}
                onDelete={handleProfilePictureDelete}
                isLoading={isUploadingPicture}
            />

            {/* Profile Header Section */}
            <section className="profile-header">
                <div className="profile-container">
                    <div className="profile-card-main">
                        <div
                            className="profile-avatar-large"
                            onClick={() => setIsModalOpen(true)}
                            style={{ cursor: "pointer" }}
                            title="Click to manage profile picture"
                        >
                            {profileData.profilePicture ? (
                                <img
                                    src={profileData.profilePicture}
                                    alt={profileData.name}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                    }}
                                />
                            ) : (
                                profileData.profileImage
                            )}
                        </div>

                        <div className="profile-info">
                            <h1 className="profile-name">{profileData.name}</h1>
                            <p className="profile-bio">{profileData.bio}</p>

                            <div className="profile-meta">
                                <div className="meta-item">
                                    <FiMail size={16} />
                                    <span>{profileData.email}</span>
                                </div>
                                <div className="meta-item">
                                    <FiMapPin size={16} />
                                    <span>{profileData.location}</span>
                                </div>
                            </div>

                            <div className="profile-stats">
                                <div className="stat">
                                    <span className="stat-number">{profileData.followers}</span>
                                    <span className="stat-label">Followers</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-number">{profileData.following}</span>
                                    <span className="stat-label">Following</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-number">{profileData.articlesCount}</span>
                                    <span className="stat-label">Articles</span>
                                </div>
                            </div>

                            <div className="profile-actions">
                                <button className="btn btn-primary">
                                    <FiEdit2 size={18} />
                                    Edit Profile
                                </button>
                                <button className="btn btn-secondary">
                                    <FiBookmark size={18} />
                                    Saved Items
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tabs Section */}
            <section className="profile-content">
                <div className="profile-container">
                    <div className="profile-tabs">
                        <button
                            className={`tab-button ${profileTabActive === "overview" ? "active" : ""}`}
                            onClick={() => setProfileTabActive("overview")}
                        >
                            Overview
                        </button>
                        <button
                            className={`tab-button ${profileTabActive === "workspace" ? "active" : ""}`}
                            onClick={() => setProfileTabActive("workspace")}
                        >
                            <FiBriefcase size={18} />
                            Workspace
                        </button>
                        <button
                            className={`tab-button ${profileTabActive === "analytics" ? "active" : ""}`}
                            onClick={() => setProfileTabActive("analytics")}
                        >
                            <FiBarChart2 size={18} />
                            Analytics
                        </button>
                        <button
                            className={`tab-button ${profileTabActive === "articles" ? "active" : ""}`}
                            onClick={() => setProfileTabActive("articles")}
                        >
                            <FiFileText size={18} />
                            Your Articles ({profileData.articlesCount})
                        </button>
                    </div>

                    {/* Overview Tab */}
                    {profileTabActive === "overview" && (
                        <div className="profile-tab-content">
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-card-icon">
                                        <FiFileText size={24} />
                                    </div>
                                    <h3>Articles Written</h3>
                                    <p className="stat-card-value">{profileData.articlesCount}</p>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-icon">
                                        <FiBookmark size={24} />
                                    </div>
                                    <h3>Total Views</h3>
                                    <p className="stat-card-value">9,030</p>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card-icon">
                                        <FiUser size={24} />
                                    </div>
                                    <h3>Followers</h3>
                                    <p className="stat-card-value">{profileData.followers}</p>
                                </div>
                            </div>

                            <div className="recent-section">
                                <h2>Recent Articles</h2>
                                <div className="articles-grid">
                                    {articles.slice(0, 2).map((article) => (
                                        <div key={article.id} className="article-card-mini">
                                            <span className="article-category">{article.category}</span>
                                            <h3>{article.title}</h3>
                                            <p>{article.excerpt}</p>
                                            <div className="article-meta-mini">
                                                <span>{article.date}</span>
                                                <span>{article.views} views</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {profileTabActive === "analytics" && (
                        <div className="profile-tab-content">
                            <AnalyticsDashboard userEmail={userEmail} />
                        </div>
                    )}

                    {/* Workspace Tab */}
                    {profileTabActive === "workspace" && (
                        <div className="profile-tab-content">
                            <UserWorkspace userEmail={userEmail} />
                        </div>
                    )}

                    {/* Articles Tab */}
                    {profileTabActive === "articles" && (
                        <div className="profile-tab-content">
                            <div className="articles-header">
                                <h2>Your Published Articles</h2>
                                <button className="btn btn-primary">
                                    <FiFileText size={18} />
                                    Write New Article
                                </button>
                            </div>

                            <div className="articles-list">
                                {articles.map((article) => (
                                    <div key={article.id} className="article-card">
                                        <div className="article-content">
                                            <span className="article-category">{article.category}</span>
                                            <h3>{article.title}</h3>
                                            <p>{article.excerpt}</p>
                                            <div className="article-footer">
                                                <span className="article-date">{article.date}</span>
                                                <div className="article-stats">
                                                    <span>{article.views} views</span>
                                                    <span>{article.likes} likes</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="article-actions">
                                            <button className="icon-btn">
                                                <FiEdit2 size={18} />
                                            </button>
                                            <button className="icon-btn">
                                                ⋮
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

// Workplace View Component
function WorkplaceView() {
    return (
        <div className="workplace-view">
            <div className="view-header">
                <h1>Workplace</h1>
                <p>Manage your documents and workspace</p>
            </div>

            <div className="workplace-grid">
                <div className="workplace-section">
                    <h3>📝 My Documents</h3>
                    <p>You have not created any documents yet.</p>
                    <a href="/docs/create" className="btn-create">Create First Document</a>
                </div>

                <div className="workplace-section">
                    <h3>⭐ Saved Documents</h3>
                    <p>No saved documents yet.</p>
                </div>

                <div className="workplace-section">
                    <h3>👥 Followers</h3>
                    <p>Start gaining followers by creating amazing content.</p>
                </div>
            </div>
        </div>
    );
}

// Settings View Component
function SettingsView() {
    return (
        <div className="settings-view">
            <div className="view-header">
                <h1>Settings</h1>
                <p>Configure your preferences</p>
            </div>

            <div className="settings-sections">
                <div className="settings-section">
                    <h3>🎨 Theme Settings</h3>
                    <div className="setting-item">
                        <label>Dark Mode</label>
                        <input type="checkbox" defaultChecked />
                    </div>
                </div>

                <div className="settings-section">
                    <h3>🔔 Notifications</h3>
                    <div className="setting-item">
                        <label>Email Notifications</label>
                        <input type="checkbox" defaultChecked />
                    </div>
                </div>

                <div className="settings-section">
                    <h3>🔐 Privacy & Security</h3>
                    <p>Your profile is public. Others can find you by your username.</p>
                </div>
            </div>
        </div>
    );
}

// Metric Card Component
function MetricCard({ title, value, change, changeType, color }) {
    return (
        <div className="metric-card" style={{ borderLeftColor: color }}>
            <div className="metric-header">
                <h3>{title}</h3>
                <span className={`change ${changeType}`}>{change}</span>
            </div>
            <div className="metric-value">{value}</div>
        </div>
    );
}

// Stat Item Component
function StatItem({ label, value, icon }) {
    return (
        <div className="stat-item">
            <div className="stat-icon">{icon}</div>
            <div className="stat-info">
                <p className="stat-label">{label}</p>
                <p className="stat-value">{value}</p>
            </div>
        </div>
    );
}
