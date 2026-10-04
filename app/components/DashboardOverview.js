"use client";

import React, { useState, useMemo } from "react";
import {
    FiFileText,
    FiEye,
    FiThumbsUp,
    FiUsers,
    FiTrendingUp,
    FiCalendar,
    FiChevronDown,
    FiAward,
    FiZap,
    FiBookmark,
    FiMessageSquare,
    FiMoreVertical,
    FiCode,
    FiCpu,
    FiBox,
    FiLayers
} from "react-icons/fi";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";
import "./DashboardOverview.css";

export default function DashboardOverview({ userName = "rupayanDey", userEmail = "", router }) {
    const [selectedRange, setSelectedRange] = useState("Last 30 Days");
    const [chartTimeframe, setChartTimeframe] = useState("Daily");
    const [activePoint, setActivePoint] = useState(null);

    // Dynamic greeting based on time of day
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    }, []);

    // Format current date nicely
    const formattedDate = useMemo(() => {
        const d = new Date();
        return d.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }, []);

    // 11 chart points matching user reference
    const performanceChartData = [
        { date: "Sep 26", views: 450, upvotes: 60, fullDate: "Sep 26, 2025" },
        { date: "Sep 29", views: 780, upvotes: 95, fullDate: "Sep 29, 2025" },
        { date: "Oct 2", views: 1120, upvotes: 140, fullDate: "Oct 2, 2025" },
        { date: "Oct 5", views: 950, upvotes: 110, fullDate: "Oct 5, 2025" },
        { date: "Oct 8", views: 1580, upvotes: 190, fullDate: "Oct 8, 2025" },
        { date: "Oct 11", views: 1320, upvotes: 175, fullDate: "Oct 11, 2025" },
        { date: "Oct 14", views: 2100, upvotes: 250, fullDate: "Oct 14, 2025" },
        { date: "Oct 17", views: 2840, upvotes: 324, fullDate: "Oct 16, 2025" }, // Peak marker
        { date: "Oct 20", views: 2250, upvotes: 270, fullDate: "Oct 20, 2025" },
        { date: "Oct 23", views: 2600, upvotes: 310, fullDate: "Oct 23, 2025" },
        { date: "Oct 26", views: 2420, upvotes: 290, fullDate: "Oct 26, 2025" },
    ];

    // Top Performing Documents matching screenshot
    const topDocuments = [
        {
            rank: 1,
            title: "Building FastAPI APIs",
            slug: "building-production-ready-apis-with-fastapi",
            tags: ["Python", "Backend", "API"],
            views: "8.2K",
            upvotes: "342",
            icon: <FiZap size={18} color="#ffffff" />,
            iconBg: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
        },
        {
            rank: 2,
            title: "System Design Basics",
            slug: "system-design-notes",
            tags: ["System Design", "Architecture"],
            views: "4.4K",
            upvotes: "286",
            icon: <FiCpu size={18} color="#ffffff" />,
            iconBg: "linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)",
        },
        {
            rank: 3,
            title: "Docker for Beginners",
            slug: "docker-complete-guide",
            tags: ["DevOps", "Docker"],
            views: "3.1K",
            upvotes: "218",
            icon: <FiBox size={18} color="#ffffff" />,
            iconBg: "linear-gradient(135deg, #0ea5e9 0%, #2dd4bf 100%)",
        },
        {
            rank: 4,
            title: "React Hooks in Depth",
            slug: "react-hooks-in-depth",
            tags: ["React", "JavaScript"],
            views: "2.8K",
            upvotes: "194",
            icon: <FiCode size={18} color="#ffffff" />,
            iconBg: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
        },
        {
            rank: 5,
            title: "Kubernetes Architecture",
            slug: "kubernetes-production-architecture",
            tags: ["DevOps", "Kubernetes"],
            views: "1.9K",
            upvotes: "162",
            icon: <FiLayers size={18} color="#ffffff" />,
            iconBg: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)",
        },
    ];

    // Recent Activity list matching screenshot
    const recentActivity = [
        {
            type: "upvote",
            action: "Your document received 12 new upvotes",
            target: "Building FastAPI APIs",
            time: "2m ago",
            icon: <FiThumbsUp size={16} />,
        },
        {
            type: "view",
            action: "Someone viewed your document",
            target: "System Design Basics",
            time: "1h ago",
            icon: <FiEye size={16} />,
        },
        {
            type: "bookmark",
            action: "Someone bookmarked your document",
            target: "Docker for Beginners",
            time: "3h ago",
            icon: <FiBookmark size={16} />,
        },
        {
            type: "follower",
            action: "New follower",
            target: "Ananya Roy started following you",
            time: "5h ago",
            icon: <FiUsers size={16} />,
        },
        {
            type: "publish",
            action: "Document published successfully",
            target: "React Hooks in Depth",
            time: "6h ago",
            icon: <FiFileText size={16} />,
        },
        {
            type: "comment",
            action: "New comment on your document",
            target: "Kubernetes Architecture",
            time: "8h ago",
            icon: <FiMessageSquare size={16} />,
        },
    ];

    // Custom Tooltip for Chart
    const CustomChartTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="chart-peak-floating-tooltip" style={{ position: "relative", transform: "none", left: "auto", top: "auto" }}>
                    <span className="peak-tooltip-date">{data.fullDate || data.date}</span>
                    <div className="peak-tooltip-row views">
                        <span>● Views</span>
                        <span>{data.views?.toLocaleString()}</span>
                    </div>
                    <div className="peak-tooltip-row upvotes">
                        <span>● Upvotes</span>
                        <span>{data.upvotes?.toLocaleString()}</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="overview-root-container">
            {/* ================= 1. TOP HEADER ================= */}
            <header className="overview-top-header">
                <div className="overview-greeting-col">
                    <span className="overview-date-label">Sunday, Oct 26, 2025</span>
                    <h1 className="overview-greeting-title">
                        {greeting}, {userName}! <span className="overview-waving-hand">👋</span>
                    </h1>
                    <p className="overview-greeting-sub">
                        Here&apos;s what&apos;s happening with your DocsPost account. Keep creating, keep sharing.
                    </p>
                </div>

                <div className="overview-header-right-group">
                    {/* Mountain Landscape Artwork Banner with Quote */}
                    <div className="overview-mountain-banner">
                        <svg className="mountain-stars-bg" viewBox="0 0 200 60" preserveAspectRatio="none">
                            <circle cx="20" cy="12" r="0.8" fill="#ffffff" opacity="0.8" />
                            <circle cx="55" cy="22" r="0.6" fill="#93c5fd" opacity="0.7" />
                            <circle cx="90" cy="8" r="0.9" fill="#ffffff" opacity="0.9" />
                            <circle cx="130" cy="18" r="0.7" fill="#60a5fa" opacity="0.6" />
                            <circle cx="170" cy="10" r="0.8" fill="#ffffff" opacity="0.8" />
                        </svg>
                        <svg className="mountain-ridge-svg" viewBox="0 0 220 70" preserveAspectRatio="none">
                            <polygon points="40,70 95,28 140,55 180,22 220,70" fill="rgba(30, 58, 138, 0.45)" />
                            <polygon points="10,70 65,36 110,60 160,18 200,45 220,70" fill="rgba(37, 99, 235, 0.35)" />
                            <polygon points="0,70 45,46 80,62 135,32 175,54 220,70" fill="rgba(15, 23, 42, 0.9)" />
                        </svg>
                        <p className="mountain-quote-text">
                            &ldquo;Good documentation<br />builds great developers.&rdquo;
                        </p>
                    </div>

                    {/* Date Range Dropdown Selector */}
                    <div className="overview-date-dropdown-btn">
                        <FiCalendar size={15} color="#94a3b8" />
                        <select
                            value={selectedRange}
                            onChange={(e) => setSelectedRange(e.target.value)}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "inherit",
                                font: "inherit",
                                cursor: "pointer",
                                outline: "none",
                            }}
                        >
                            <option value="Last 7 Days" style={{ background: "#0f172a" }}>Last 7 Days</option>
                            <option value="Last 30 Days" style={{ background: "#0f172a" }}>Last 30 Days</option>
                            <option value="Last 90 Days" style={{ background: "#0f172a" }}>Last 90 Days</option>
                            <option value="All Time" style={{ background: "#0f172a" }}>All Time</option>
                        </select>
                        <FiChevronDown size={14} color="#94a3b8" />
                    </div>
                </div>
            </header>

            {/* ================= 2. 4 STAT METRIC CARDS ================= */}
            <section className="overview-metrics-grid" aria-label="Account Overview Metrics">
                {/* 1. Documents */}
                <div className="overview-stat-card theme-docs">
                    <div className="overview-stat-left">
                        <div className="overview-stat-icon-wrap">
                            <FiFileText size={20} />
                        </div>
                        <span className="overview-stat-label">Documents</span>
                        <span className="overview-stat-value">24</span>
                        <div className="overview-stat-trend">
                            <span>↑ +3 this month</span>
                        </div>
                    </div>
                    <div className="overview-stat-sparkline">
                        <div className="sparkline-bars-group">
                            {[32, 50, 28, 65, 45, 80, 60, 95].map((h, i) => (
                                <span key={i} className="sparkline-bar" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. Views */}
                <div className="overview-stat-card theme-views">
                    <div className="overview-stat-left">
                        <div className="overview-stat-icon-wrap">
                            <FiEye size={20} />
                        </div>
                        <span className="overview-stat-label">Views</span>
                        <span className="overview-stat-value">18.4K</span>
                        <div className="overview-stat-trend">
                            <span>↑ +18%</span>
                        </div>
                    </div>
                    <div className="overview-stat-sparkline">
                        <svg className="sparkline-wave-svg" viewBox="0 0 80 40">
                            <path
                                d="M 0 30 Q 15 25, 30 28 T 50 15 T 70 8 T 80 5"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                            />
                            <path
                                d="M 0 30 Q 15 25, 30 28 T 50 15 T 70 8 T 80 5 L 80 40 L 0 40 Z"
                                fill="rgba(16, 185, 129, 0.12)"
                            />
                        </svg>
                    </div>
                </div>

                {/* 3. Upvotes */}
                <div className="overview-stat-card theme-upvotes">
                    <div className="overview-stat-left">
                        <div className="overview-stat-icon-wrap">
                            <FiThumbsUp size={20} />
                        </div>
                        <span className="overview-stat-label">Upvotes</span>
                        <span className="overview-stat-value">1,204</span>
                        <div className="overview-stat-trend">
                            <span>↑ +12%</span>
                        </div>
                    </div>
                    <div className="overview-stat-sparkline">
                        <div className="sparkline-bars-group">
                            {[35, 55, 40, 70, 50, 85, 68, 90].map((h, i) => (
                                <span key={i} className="sparkline-bar" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. Followers */}
                <div className="overview-stat-card theme-followers">
                    <div className="overview-stat-left">
                        <div className="overview-stat-icon-wrap">
                            <FiUsers size={20} />
                        </div>
                        <span className="overview-stat-label">Followers</span>
                        <span className="overview-stat-value">328</span>
                        <div className="overview-stat-trend">
                            <span>↑ +24%</span>
                        </div>
                    </div>
                    <div className="overview-stat-sparkline">
                        <svg className="sparkline-wave-svg" viewBox="0 0 80 40">
                            <path
                                d="M 0 32 Q 18 20, 32 26 T 52 14 T 70 18 T 80 8"
                                fill="none"
                                stroke="#f59e0b"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                            />
                            <path
                                d="M 0 32 Q 18 20, 32 26 T 52 14 T 70 18 T 80 8 L 80 40 L 0 40 Z"
                                fill="rgba(245, 158, 11, 0.12)"
                            />
                        </svg>
                    </div>
                </div>
            </section>

            {/* ================= 3. CONTENT PERFORMANCE MAIN CHART ================= */}
            <section className="overview-chart-card" aria-label="Content Performance Chart">
                <div className="overview-chart-header">
                    <div className="chart-header-left">
                        <div className="chart-title-icon-box">
                            <FiTrendingUp size={20} />
                        </div>
                        <div className="chart-title-text-group">
                            <h2>Content Performance</h2>
                            <p>Track how your documents are performing over time.</p>
                        </div>
                    </div>

                    <div className="chart-header-badges">
                        <div className="chart-metric-badge green">
                            <span>↑ +18%</span>
                            <span>Higher views than previous 30 days</span>
                        </div>
                        <div className="chart-metric-badge blue">
                            <span>👤 +24</span>
                            <span>New followers this month</span>
                        </div>
                    </div>

                    <div className="chart-header-right">
                        {/* Timeframe switcher */}
                        <div className="chart-timeframe-selector">
                            {["Daily", "Weekly", "Monthly"].map((tf) => (
                                <button
                                    key={tf}
                                    type="button"
                                    className={`chart-tf-btn ${chartTimeframe === tf ? "active" : ""}`}
                                    onClick={() => setChartTimeframe(tf)}
                                >
                                    {tf}
                                </button>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="chart-legend-row">
                            <div className="legend-dot-item views">
                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6" }} />
                                <span>Views</span>
                            </div>
                            <div className="legend-dot-item upvotes">
                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#a855f7" }} />
                                <span>Upvotes</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart Area */}
                <div className="chart-canvas-wrapper">
                    {/* Fixed Peak Tooltip badge shown at Oct 16 */}
                    <div className="chart-peak-floating-tooltip">
                        <span className="peak-tooltip-date">Oct 16, 2025</span>
                        <div className="peak-tooltip-row views">
                            <span>● Views</span>
                            <span>2,840</span>
                        </div>
                        <div className="peak-tooltip-row upvotes">
                            <span>● Upvotes</span>
                            <span>324</span>
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={290}>
                        <AreaChart data={performanceChartData} margin={{ top: 25, right: 15, left: -15, bottom: 0 }}>
                            <defs>
                                <linearGradient id="neonViewsGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.45} />
                                    <stop offset="90%" stopColor="#2563eb" stopOpacity={0.0} />
                                </linearGradient>
                                <linearGradient id="neonUpvotesGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.25} />
                                    <stop offset="90%" stopColor="#a855f7" stopOpacity={0.0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={{ stroke: "rgba(255, 255, 255, 0.08)" }}
                                dy={8}
                            />
                            <YAxis
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                ticks={[0, 750, 1500, 2250, 3000]}
                                tickFormatter={(val) => val.toLocaleString()}
                            />
                            <Tooltip content={<CustomChartTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="upvotes"
                                stroke="#a855f7"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#neonUpvotesGradient)"
                            />
                            <Area
                                type="monotone"
                                dataKey="views"
                                stroke="#3b82f6"
                                strokeWidth={3.5}
                                fillOpacity={1}
                                fill="url(#neonViewsGradient)"
                                dot={{ fill: "#3b82f6", r: 4, stroke: "#0d1322", strokeWidth: 2 }}
                                activeDot={{ fill: "#ffffff", r: 6, stroke: "#3b82f6", strokeWidth: 3 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* ================= 4. BOTTOM 2-COLUMN GRID ================= */}
            <div className="overview-bottom-grid">
                {/* 4A. Top Performing Documents */}
                <div className="overview-panel-card">
                    <div className="panel-header-row">
                        <div className="panel-title-with-icon">
                            <div className="panel-icon-badge trophy">
                                <FiAward size={20} />
                            </div>
                            <div className="panel-title-group">
                                <h3>Top Performing Documents</h3>
                                <p>Your most popular documents this month.</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="panel-view-all-link"
                            onClick={() => router?.push("/workspace/published")}
                            style={{ background: "transparent", border: "none" }}
                        >
                            View All →
                        </button>
                    </div>

                    <div className="top-docs-table">
                        <div className="top-docs-table-header">
                            <span>#</span>
                            <span>Document</span>
                            <span>Views</span>
                            <span>Upvotes</span>
                            <span></span>
                        </div>

                        {topDocuments.map((doc) => (
                            <div
                                key={doc.rank}
                                className="top-doc-table-row"
                                onClick={() => router?.push(`/doc/${doc.slug}`)}
                            >
                                <span className={`top-doc-rank-num rank-${doc.rank}`}>
                                    {doc.rank}
                                </span>

                                <div className="top-doc-main-col">
                                    <div className="top-doc-icon-avatar" style={{ background: doc.iconBg }}>
                                        {doc.icon}
                                    </div>
                                    <div className="top-doc-details">
                                        <span className="top-doc-title">{doc.title}</span>
                                        <div className="top-doc-tags-row">
                                            {doc.tags.map((tag) => (
                                                <span key={tag} className="top-doc-tag-pill">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="top-doc-stat-col">
                                    <FiEye size={14} color="#60a5fa" />
                                    <span>{doc.views}</span>
                                </div>

                                <div className="top-doc-stat-col upvotes-col">
                                    <FiThumbsUp size={14} color="#f59e0b" />
                                    <span>{doc.upvotes}</span>
                                </div>

                                <button
                                    type="button"
                                    className="top-doc-more-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router?.push(`/doc/${doc.slug}`);
                                    }}
                                    aria-label="More actions"
                                >
                                    <FiMoreVertical size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4B. Recent Activity */}
                <div className="overview-panel-card">
                    <div className="panel-header-row">
                        <div className="panel-title-with-icon">
                            <div className="panel-icon-badge lightning">
                                <FiZap size={20} />
                            </div>
                            <div className="panel-title-group">
                                <h3>Recent Activity</h3>
                                <p>Latest updates on your documents and community.</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="panel-view-all-link"
                            onClick={() => router?.push("/notifications")}
                            style={{ background: "transparent", border: "none" }}
                        >
                            View All →
                        </button>
                    </div>

                    <div className="recent-activity-list">
                        {recentActivity.map((item, idx) => (
                            <div
                                key={idx}
                                className="activity-item-row"
                                onClick={() => router?.push("/workspace/recent")}
                            >
                                <div className={`activity-icon-circle ${item.type}`}>
                                    {item.icon}
                                </div>
                                <div className="activity-text-col">
                                    <span className="activity-action-title">{item.action}</span>
                                    <span className="activity-target-desc">{item.target}</span>
                                </div>
                                <span className="activity-time-stamp">{item.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
