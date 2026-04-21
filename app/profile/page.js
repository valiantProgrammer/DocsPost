"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import ProfilePictureModal from "@/app/components/ProfilePictureModal";
import AnalyticsDashboard from "@/app/components/AnalyticsDashboard";
import UserWorkspace from "@/app/components/UserWorkspace";
import { useTheme } from "@/app/providers/ThemeProvider";
import { FiUser, FiMail, FiMapPin, FiBookmark, FiEdit2, FiFileText, FiBarChart2, FiBriefcase } from "react-icons/fi";

export default function Profile() {
    const { isDark } = useTheme();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("overview");
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userLocation, setUserLocation] = useState("Not specified");
    const [userBio, setUserBio] = useState("Welcome to my profile!");
    const [userJoinDate, setUserJoinDate] = useState("2024");
    const [userId, setUserId] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploadingPicture, setIsUploadingPicture] = useState(false);

    // Sample articles data - in future this will come from database
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

    useEffect(() => {
        // Get user data from localStorage (set during login)
        const savedUserName = localStorage.getItem("docspost-username");
        const savedUserEmail = localStorage.getItem("docspost-email");
        const isSignedIn = localStorage.getItem("docspost-auth");

        if (!isSignedIn) {
            // Redirect to sign in if not authenticated
            router.push("/Auth?mode=signin");
            return;
        }

        // Redirect to user dashboard (username-based URL)
        if (savedUserName) {
            router.push(`/${savedUserName}`);
        } else {
            router.push("/Auth?mode=signin");
        }
    }, [router]);

    useEffect(() => {
        // Get user data from localStorage and populate state
        const savedUserName = localStorage.getItem("docspost-username");
        const savedUserEmail = localStorage.getItem("docspost-email");
        const savedLocation = localStorage.getItem("docspost-location");
        const savedBio = localStorage.getItem("docspost-bio");
        const savedJoinDate = localStorage.getItem("docspost-joinDate");

        if (savedUserName) {
            setUserName(savedUserName);
        }
        if (savedUserEmail) {
            setUserEmail(savedUserEmail);
        }
        if (savedLocation) {
            setUserLocation(savedLocation);
        }
        if (savedBio) {
            setUserBio(savedBio);
        }
        if (savedJoinDate) {
            setUserJoinDate(savedJoinDate);
        }

        // Fetch full profile including profile picture from API
        const fetchProfileData = async () => {
            try {
                if (savedUserEmail) {
                    const response = await fetch(
                        `/api/profile/get-profile?email=${encodeURIComponent(savedUserEmail)}`
                    );
                    if (response.ok) {
                        const data = await response.json();
                        setUserId(data.user._id);
                        setProfilePicture(data.user.profilePicture);
                    }
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    // Construct user data from state
    const userData = {
        name: userName || "User",
        email: userEmail || "user@example.com",
        location: userLocation || "Not specified",
        bio: userBio || "Welcome to my profile!",
        joinDate: userJoinDate || "2024",
        followers: 128,
        following: 45,
        articlesCount: articles.length,
        profileImage: userName.charAt(0).toUpperCase(),
        profilePicture: profilePicture,
    };

    const handleProfilePictureUpload = async (base64String) => {
        if (!userId) {
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
                    userId: userId,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setProfilePicture(data.profilePicture);
                setIsModalOpen(false);
                alert("Profile picture updated successfully!");
                // Notify Header component to refresh profile picture
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
        if (!userId) {
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
                    userId: userId,
                    publicId: "", // Will be fetched from DB if needed
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setProfilePicture(null);
                setIsModalOpen(false);
                alert("Profile picture deleted successfully!");
                // Notify Header component to refresh profile picture
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

    if (isLoading) {
        return (
            <main className="learning-page" data-theme={isDark ? "dark" : "light"}>
                <Header />
                <div style={{ padding: "40px 20px", textAlign: "center", minHeight: "100vh" }}>
                    <p>Loading profile...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="learning-page" data-theme={isDark ? "dark" : "light"}>
            <Header />

            {/* Profile Picture Modal */}
            <ProfilePictureModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                profilePicture={userData.profilePicture}
                userName={userData.name}
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
                            {userData.profilePicture ? (
                                <img
                                    src={userData.profilePicture}
                                    alt={userData.name}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                    }}
                                />
                            ) : (
                                userData.profileImage
                            )}
                        </div>

                        <div className="profile-info">
                            <h1 className="profile-name">{userData.name}</h1>
                            <p className="profile-bio">{userData.bio}</p>

                            <div className="profile-meta">
                                <div className="meta-item">
                                    <FiMail size={16} />
                                    <span>{userData.email}</span>
                                </div>
                                <div className="meta-item">
                                    <FiMapPin size={16} />
                                    <span>{userData.location}</span>
                                </div>
                            </div>

                            <div className="profile-stats">
                                <div className="stat">
                                    <span className="stat-number">{userData.followers}</span>
                                    <span className="stat-label">Followers</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-number">{userData.following}</span>
                                    <span className="stat-label">Following</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-number">{userData.articlesCount}</span>
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
                            className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
                            onClick={() => setActiveTab("overview")}
                        >
                            Overview
                        </button>
                        <button
                            className={`tab-button ${activeTab === "workspace" ? "active" : ""}`}
                            onClick={() => setActiveTab("workspace")}
                        >
                            <FiBriefcase size={18} />
                            Workspace
                        </button>
                        <button
                            className={`tab-button ${activeTab === "analytics" ? "active" : ""}`}
                            onClick={() => setActiveTab("analytics")}
                        >
                            <FiBarChart2 size={18} />
                            Analytics
                        </button>
                        <button
                            className={`tab-button ${activeTab === "articles" ? "active" : ""}`}
                            onClick={() => setActiveTab("articles")}
                        >
                            <FiFileText size={18} />
                            Your Articles ({userData.articlesCount})
                        </button>
                    </div>

                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                        <div className="profile-tab-content">
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-card-icon">
                                        <FiFileText size={24} />
                                    </div>
                                    <h3>Articles Written</h3>
                                    <p className="stat-card-value">{userData.articlesCount}</p>
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
                                    <p className="stat-card-value">{userData.followers}</p>
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
                    {activeTab === "analytics" && (
                        <div className="profile-tab-content">
                            <AnalyticsDashboard userEmail={userData.email} />
                        </div>
                    )}

                    {/* Workspace Tab */}
                    {activeTab === "workspace" && (
                        <div className="profile-tab-content">
                            <UserWorkspace userEmail={userData.email} />
                        </div>
                    )}

                    {/* Articles Tab */}
                    {activeTab === "articles" && (
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
        </main>
    );
}
