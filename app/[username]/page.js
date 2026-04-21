"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/providers/ThemeProvider";
import Header from "@/app/components/Header";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import AnalyticsDashboard from "@/app/components/AnalyticsDashboard";
import ProfileView from "@/app/components/ProfileView";
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
