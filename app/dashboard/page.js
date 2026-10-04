"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/providers/ThemeProvider";
import Header from "@/app/components/Header";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import AnalyticsDashboard from "@/app/components/AnalyticsDashboard";
import ProfilePictureModal from "@/app/components/ProfilePictureModal";
import ProfileView from "@/app/components/ProfileView";
import UserWorkspace from "@/app/components/UserWorkspace";
import DashboardOverview from "@/app/components/DashboardOverview";
import BookmarksView from "@/app/components/BookmarksView";
import DashboardSettings from "@/app/components/DashboardSettings";
import LearningView from "@/app/components/LearningView";
import {
    FiUser, FiMail, FiMapPin, FiBookmark, FiEdit2, FiFileText,
    FiBarChart2, FiBriefcase, FiTrendingUp, FiEye, FiThumbsUp,
    FiUsers, FiClock, FiPlus, FiChevronDown, FiShare2, FiMessageCircle
} from "react-icons/fi";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from "recharts";
import "./dashboard.css";

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState("overview");
    const [userEmail, setUserEmail] = useState("");
    const [userName, setUserName] = useState("");
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { mounted } = useTheme();
    const router = useRouter();

    const normalizeTab = (raw) => {
        if (!raw) return "overview";
        const clean = raw.replace(/^#\/?/, "").toLowerCase().trim();
        if (clean === "bookmark" || clean === "bookmarks" || clean === "bookmarked") return "bookmarks";
        if (clean === "overview" || clean === "dashboard") return "overview";
        return clean;
    };

    const handleTabChange = (tabId) => {
        const normalized = normalizeTab(tabId);
        setActiveTab(normalized);
        if (typeof window !== "undefined") {
            const hash = (normalized === "bookmarks") ? "bookmark" : normalized;
            window.location.hash = hash;
        }
    };

    useEffect(() => {
        const syncTabFromLocation = () => {
            if (typeof window === "undefined") return;
            const hash = window.location.hash;
            if (hash) {
                setActiveTab(normalizeTab(hash));
                return;
            }
            const urlParams = new URLSearchParams(window.location.search);
            const tabParam = urlParams.get("tab");
            if (tabParam) {
                setActiveTab(normalizeTab(tabParam));
            }
        };

        syncTabFromLocation();
        window.addEventListener("hashchange", syncTabFromLocation);
        return () => window.removeEventListener("hashchange", syncTabFromLocation);
    }, []);

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
            case "overview":
            case "dashboard":
                return <DashboardOverview userName={userName || "rupayanDey"} userEmail={userEmail} router={router} />;
            case "analytics":
                return <AnalyticsDashboard userEmail={userEmail} />;
            case "profile":
                return <ProfileView userData={userData} userEmail={userEmail} userName={userName} />;
            case "bookmark":
            case "bookmarks":
                return <BookmarksView router={router} />;
            case "learning":
                return <LearningView router={router} />;
            case "documents":
            case "workspace":
            case "all":
                return <UserWorkspace userEmail={userEmail} initialTab="all" />;
            case "recent":
                return <UserWorkspace userEmail={userEmail} initialTab="recent" pageTitle="Recent" />;
            case "drafts":
                return <UserWorkspace userEmail={userEmail} initialTab="drafts" pageTitle="Drafts" />;
            case "published":
                return <UserWorkspace userEmail={userEmail} initialTab="published" pageTitle="Published" />;
            case "shared":
                return <UserWorkspace userEmail={userEmail} initialTab="shared" pageTitle="Shared" />;
            case "trash":
                return <UserWorkspace userEmail={userEmail} initialTab="trash" pageTitle="Trash" />;
            case "settings":
                return <DashboardSettings userEmail={userEmail} userName={userName} userData={userData} />;
            default:
                return <DashboardOverview userName={userName || "rupayanDey"} userEmail={userEmail} router={router} />;
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
            <DashboardSidebar activeTab={activeTab} onTabChange={handleTabChange} />
            <main className={`dashboard-main ${activeTab === "analytics" ? "analytics-mode" : ""}`}>
                {renderContent()}
            </main>
        </div>
    );
}

// Layout 6: User Dashboard (Overview) Component
function DashboardView({ userName, router }) {
    const [chartTimeframe, setChartTimeframe] = useState("Daily");
    const [selectedRange, setSelectedRange] = useState("Last 30 Days");

    const chartData = [
        { date: "Sep 26", views: 420 },
        { date: "Oct 1", views: 680 },
        { date: "Oct 5", views: 1100 },
        { date: "Oct 9", views: 1450 },
        { date: "Oct 12", views: 1980 },
        { date: "Oct 16", views: 2420 },
        { date: "Oct 19", views: 2840 },
        { date: "Oct 22", views: 2310 },
        { date: "Oct 26", views: 2150 },
    ];

    const topDocs = [
        { id: "fastapi-auth-jwt", title: "FastAPI Guide", views: "8.2K", engagement: "23.4%" },
        { id: "react-hooks-guide", title: "React Hooks", views: "4.9K", engagement: "18.2%" },
        { id: "dsa-patterns", title: "DSA Patterns", views: "3.1K", engagement: "12.8%" },
    ];

    const donutData = [
        { name: "Views", value: 45, color: "#2563eb" },
        { name: "Upvotes", value: 30, color: "#38bdf8" },
        { name: "Comments", value: 15, color: "#818cf8" },
        { name: "Shares", value: 10, color: "#10b981" },
    ];

    return (
        <div className="dashboard-overview-container">
            {/* Top Greeting Header */}
            <div className="dashboard-overview-header">
                <div>
                    <h1 className="dashboard-greeting-title">
                        Good morning, {userName} 👋
                    </h1>
                    <p className="dashboard-greeting-subtitle">
                        Here&apos;s what&apos;s happening with your DocsPost account.
                    </p>
                </div>

                <div className="dashboard-range-selector">
                    <select
                        value={selectedRange}
                        onChange={(e) => setSelectedRange(e.target.value)}
                        className="range-dropdown"
                    >
                        <option value="Last 7 Days">Last 7 Days</option>
                        <option value="Last 30 Days">Last 30 Days</option>
                        <option value="Last 90 Days">Last 90 Days</option>
                        <option value="All Time">All Time</option>
                    </select>
                    <FiChevronDown className="range-dropdown-arrow" size={15} />
                </div>
            </div>

            {/* 4 Metric Cards */}
            <div className="dashboard-metric-cards-grid">
                <div className="dash-metric-card">
                    <div className="dash-metric-label">Documents</div>
                    <div className="dash-metric-value">24</div>
                    <div className="dash-metric-change positive">
                        <span>+3 this month</span>
                    </div>
                </div>

                <div className="dash-metric-card">
                    <div className="dash-metric-label">Views</div>
                    <div className="dash-metric-value">18.4K</div>
                    <div className="dash-metric-change positive">
                        <span>+18%</span>
                    </div>
                </div>

                <div className="dash-metric-card">
                    <div className="dash-metric-label">Upvotes</div>
                    <div className="dash-metric-value">1,204</div>
                    <div className="dash-metric-change positive">
                        <span>+12%</span>
                    </div>
                </div>

                <div className="dash-metric-card">
                    <div className="dash-metric-label">Followers</div>
                    <div className="dash-metric-value">328</div>
                    <div className="dash-metric-change positive">
                        <span>+24%</span>
                    </div>
                </div>
            </div>

            {/* Content Performance Chart Card */}
            <div className="dash-chart-card">
                <div className="dash-chart-card-header">
                    <div>
                        <h2 className="dash-card-title">Content Performance</h2>
                    </div>

                    <div className="chart-timeframe-pills">
                        {["Daily", "Weekly", "Monthly"].map((tf) => (
                            <button
                                key={tf}
                                type="button"
                                className={`timeframe-pill-btn ${chartTimeframe === tf ? "active" : ""}`}
                                onClick={() => setChartTimeframe(tf)}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="dash-chart-wrapper">
                    <div className="chart-peak-badge">
                        <span>2,840 views</span>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1e293b",
                                    borderRadius: "8px",
                                    border: "none",
                                    color: "#fff",
                                    fontSize: "12px",
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="views"
                                stroke="#2563eb"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#viewsGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom 2 Columns: Top Documents & Engagement */}
            <div className="dash-bottom-grid">
                {/* Top Documents */}
                <div className="dash-subcard">
                    <div className="dash-subcard-header">
                        <h3 className="dash-card-title">Top Documents</h3>
                    </div>
                    <div className="top-docs-list">
                        {topDocs.map((doc, idx) => (
                            <div
                                key={doc.id}
                                className="top-doc-row"
                                onClick={() => router?.push(`/doc/${doc.id}`)}
                            >
                                <div className="top-doc-info">
                                    <span className="top-doc-num">{idx + 1}.</span>
                                    <span className="top-doc-name">{doc.title}</span>
                                </div>
                                <div className="top-doc-metrics">
                                    <span className="top-doc-views">{doc.views}</span>
                                    <span className="top-doc-engagement">{doc.engagement}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Engagement Donut */}
                <div className="dash-subcard">
                    <div className="dash-subcard-header">
                        <h3 className="dash-card-title">Engagement</h3>
                    </div>
                    <div className="engagement-donut-container">
                        <div className="donut-chart-box">
                            <ResponsiveContainer width={170} height={170}>
                                <PieChart>
                                    <Pie
                                        data={donutData}
                                        innerRadius={52}
                                        outerRadius={74}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {donutData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="donut-center-metric">
                                <span className="donut-center-pct">14.8%</span>
                            </div>
                        </div>

                        <div className="donut-legend-list">
                            {donutData.map((item) => (
                                <div key={item.name} className="donut-legend-item">
                                    <span
                                        className="legend-color-dot"
                                        style={{ backgroundColor: item.color }}
                                    ></span>
                                    <span className="legend-label">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Analytics View Component
function AnalyticsView({ userEmail }) {
    return <AnalyticsDashboard userEmail={userEmail} />;
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
