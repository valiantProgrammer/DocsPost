"use client";
import { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    ComposedChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import "./AnalyticsDashboard.css";
import { FiTrendingUp, FiEye, FiThumbsUp, FiCalendar, FiActivity, FiZap } from "react-icons/fi";

export default function AnalyticsDashboard({ userEmail }) {
    const [timeframe, setTimeframe] = useState("daily"); // daily, monthly, yearly
    const [viewStats, setViewStats] = useState([]);
    const [voteStats, setVoteStats] = useState([]);
    const [articleStats, setArticleStats] = useState([]);
    const [activityLog, setActivityLog] = useState([]);
    const [stats, setStats] = useState({
        totalViews: 0,
        totalVotes: 0,
        totalLikes: 0,
        activeDays: 0,
        todayActivity: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isMigrating, setIsMigrating] = useState(false);
    const [showMigrationButton, setShowMigrationButton] = useState(false);

    // Fetch analytics data
    useEffect(() => {
        fetchAnalytics();
        fetchActivityLog();
    }, [userEmail, timeframe]);

    const handleMigration = async () => {
        if (!userEmail) {
            alert("User email is required");
            return;
        }

        setIsMigrating(true);
        try {
            const response = await fetch("/api/analytics/migrate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userEmail }),
            });

            if (response.ok) {
                const data = await response.json();
                alert(`Migration completed! Migrated ${data.migratedCount} records.`);
                setShowMigrationButton(false);
                // Refresh the analytics
                fetchAnalytics();
                fetchActivityLog();
            } else {
                const error = await response.json();
                alert(`Migration failed: ${error.error}`);
            }
        } catch (error) {
            console.error("Error during migration:", error);
            alert("Failed to migrate data. Please try again.");
        } finally {
            setIsMigrating(false);
        }
    };

    // Fetch analytics data
    useEffect(() => {
        fetchAnalytics();
        fetchActivityLog();
    }, [userEmail, timeframe]);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `/api/analytics/get-stats?email=${encodeURIComponent(
                    userEmail
                )}&timeframe=${timeframe}`
            );
            if (response.ok) {
                const data = await response.json();
                setViewStats(data.viewStats);
                setVoteStats(data.voteStats);
                setArticleStats(data.articleStats);
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchActivityLog = async () => {
        try {
            const response = await fetch(
                `/api/analytics/activity-log?email=${encodeURIComponent(userEmail)}`
            );
            if (response.ok) {
                const data = await response.json();
                setActivityLog(data.activityLog);
                setStats(data.stats);

                // Show migration button if no data exists but user has documents
                if (data.stats.totalViews === 0 && data.stats.totalLikes === 0) {
                    setShowMigrationButton(true);
                }
            }
        } catch (error) {
            console.error("Error fetching activity log:", error);
        }
    };

    // Format data for display
    const formattedViewStats = viewStats.map((item) => ({
        ...item,
        name: item._id,
        value: item.views,
    }));

    // Get activity heatmap data (last 365 days)
    const getActivityHeatmap = () => {
        const heatmapData = [];
        for (let i = 364; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split("T")[0];
            const activity = activityLog.find((log) => log._id === dateStr);
            heatmapData.push({
                date: dateStr,
                dayOfWeek: date.getDay(),
                week: Math.floor(i / 7),
                count: activity?.count || 0,
                level:
                    (activity?.count || 0) === 0
                        ? 0
                        : (activity?.count || 0) <= 1
                            ? 1
                            : (activity?.count || 0) <= 3
                                ? 2
                                : (activity?.count || 0) <= 5
                                    ? 3
                                    : 4,
            });
        }
        return heatmapData;
    };

    const heatmapData = getActivityHeatmap();

    return (
        <div className="analytics-dashboard">
            {/* Header */}
            <div className="analytics-header">
                <h2>Analytics & Performance</h2>
                <div className="timeframe-selector">
                    <button
                        className={`timeframe-btn ${timeframe === "daily" ? "active" : ""}`}
                        onClick={() => setTimeframe("daily")}
                    >
                        Daily
                    </button>
                    <button
                        className={`timeframe-btn ${timeframe === "monthly" ? "active" : ""}`}
                        onClick={() => setTimeframe("monthly")}
                    >
                        Monthly
                    </button>
                    <button
                        className={`timeframe-btn ${timeframe === "yearly" ? "active" : ""}`}
                        onClick={() => setTimeframe("yearly")}
                    >
                        Yearly
                    </button>
                </div>
            </div>

            {/* Migration Notification */}
            {showMigrationButton && (
                <div className="migration-banner">
                    <p>We found your existing views and likes! Click below to load them into your analytics dashboard.</p>
                    <button
                        className="btn-migrate"
                        onClick={handleMigration}
                        disabled={isMigrating}
                    >
                        {isMigrating ? "Loading..." : "Load My Analytics"}
                    </button>
                </div>
            )}

            {/* Stats Cards - Multiple columns with better organization */}
            <div className="stats-cards-grid">
                {/* Top Row */}
                <div className="stat-card-large">
                    <div className="stat-icon views-icon">
                        <FiEye size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Page Views</p>
                        <h3 className="stat-value">{stats.totalViews.toLocaleString()}</h3>
                        <p className="stat-change">+12.5% from last week</p>
                    </div>
                </div>

                <div className="stat-card-large">
                    <div className="stat-icon likes-icon">
                        <FiThumbsUp size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Engagement Rate</p>
                        <h3 className="stat-value">{stats.totalLikes || 0}%</h3>
                        <p className="stat-change">+3.2% from last week</p>
                    </div>
                </div>

                <div className="stat-card-large">
                    <div className="stat-icon votes-icon">
                        <FiActivity size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Session Time</p>
                        <h3 className="stat-value">{stats.totalVotes || 0}m</h3>
                        <p className="stat-change">Avg duration</p>
                    </div>
                </div>

                <div className="stat-card-large">
                    <div className="stat-icon days-icon">
                        <FiZap size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Active Days</p>
                        <h3 className="stat-value">{stats.activeDays}</h3>
                        <p className="stat-change">Days with activity</p>
                    </div>
                </div>

                <div className="stat-card-large">
                    <div className="stat-icon trending-icon">
                        <FiTrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Avg Session</p>
                        <h3 className="stat-value">2.4 pages</h3>
                        <p className="stat-change">Per session</p>
                    </div>
                </div>

                <div className="stat-card-large">
                    <div className="stat-icon revenue-icon">
                        <FiZap size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Bounce Rate</p>
                        <h3 className="stat-value">32%</h3>
                        <p className="stat-change">-5% from last week</p>
                    </div>
                </div>
            </div>

            {/* Charts - Dual layout with combination charts */}
            <div className="charts-grid-dual">
                <div className="chart-section-large">
                    <h3>Views & Engagement Trend</h3>
                    <p className="chart-subtitle">Last 7 days</p>
                    <div className="chart-wrapper">
                        {isLoading ? (
                            <div className="chart-loading">Loading...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={320}>
                                <ComposedChart data={formattedViewStats}>
                                    <defs>
                                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="var(--line)"
                                    />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 12 }}
                                        stroke="var(--text-muted)"
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        stroke="var(--text-muted)"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        stroke="var(--text-muted)"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "var(--panel-bg)",
                                            border: `2px solid #8b5cf6`,
                                            color: "var(--text-main)",
                                            borderRadius: "8px",
                                        }}
                                    />
                                    <Legend />
                                    <Bar
                                        yAxisId="left"
                                        dataKey="value"
                                        fill="#8b5cf6"
                                        name="Page Views"
                                        radius={[8, 8, 0, 0]}
                                        opacity={0.85}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#10b981"
                                        name="Trend"
                                        strokeWidth={3}
                                        dot={{ fill: "#10b981", r: 5 }}
                                        activeDot={{ r: 7 }}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="chart-section-large">
                    <h3>Engagement Distribution</h3>
                    <p className="chart-subtitle">By top performing articles</p>
                    <div className="chart-wrapper">
                        {isLoading ? (
                            <div className="chart-loading">Loading...</div>
                        ) : articleStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height={320}>
                                <PieChart>
                                    <Pie
                                        data={articleStats.slice(0, 4)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={2}
                                        dataKey="likes"
                                        label={({ title, likes, percent }) => `${title?.substring(0, 15)}... ${(percent * 100).toFixed(1)}%`}
                                    >
                                        <Cell fill="#8b5cf6" />
                                        <Cell fill="#10b981" />
                                        <Cell fill="#f97316" />
                                        <Cell fill="#ec4899" />
                                        <Cell fill="#3b82f6" />
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "var(--panel-bg)",
                                            border: `2px solid #8b5cf6`,
                                            color: "var(--text-main)",
                                            borderRadius: "8px",
                                        }}
                                        formatter={(value, name, props) => [
                                            value,
                                            `${props.payload.title}: ${value} engagement`
                                        ]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="chart-loading">No engagement data yet</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Additional Charts Row */}
            <div className="charts-row">
                <div className="chart-section-medium">
                    <h3>Top Articles Performance</h3>
                    <div className="chart-wrapper">
                        {articleStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={articleStats.slice(0, 5)}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="var(--line)"
                                    />
                                    <XAxis
                                        dataKey="title"
                                        tick={{ fontSize: 10 }}
                                        stroke="var(--text-muted)"
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis
                                        stroke="var(--text-muted)"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "var(--panel-bg)",
                                            border: `2px solid #8b5cf6`,
                                            color: "var(--text-main)",
                                            borderRadius: "8px",
                                        }}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="views"
                                        fill="#f97316"
                                        name="Views"
                                        radius={[8, 8, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="likes"
                                        fill="#ec4899"
                                        name="Likes"
                                        radius={[8, 8, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="chart-loading">
                                No article data yet
                            </div>
                        )}
                    </div>
                </div>

                <div className="chart-section-medium">
                    <h3>Monthly Activity Trends</h3>
                    <div className="chart-wrapper">
                        {isLoading ? (
                            <div className="chart-loading">Loading...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={formattedViewStats}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="var(--line)"
                                    />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 12 }}
                                        stroke="var(--text-muted)"
                                    />
                                    <YAxis
                                        stroke="var(--text-muted)"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "var(--panel-bg)",
                                            border: `2px solid #06b6d4`,
                                            color: "var(--text-main)",
                                            borderRadius: "8px",
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#3b82f6"
                                        name="Activity"
                                        dot={{ fill: "#3b82f6", r: 5 }}
                                        activeDot={{ r: 7 }}
                                        strokeWidth={3}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Activity Heatmap (GitHub style) */}
            <div className="activity-section">
                <h3>Contribution Activity</h3>
                <p className="activity-subtitle">Your activity over the past year</p>
                <div className="github-heatmap">
                    {/* Legend */}
                    <div className="heatmap-legend-github">
                        <span className="legend-label">Less</span>
                        <div className="legend-squares">
                            {[0, 1, 2, 3, 4].map((level) => (
                                <div
                                    key={level}
                                    className={`legend-square level-${level}`}
                                    title={
                                        level === 0
                                            ? "No activity"
                                            : `${level === 1
                                                ? "1-2"
                                                : level === 2
                                                    ? "3-5"
                                                    : level === 3
                                                        ? "6-10"
                                                        : "11+"
                                            } contributions`
                                    }
                                />
                            ))}
                        </div>
                        <span className="legend-label">More</span>
                    </div>

                    {/* Heatmap Grid */}
                    <div className="heatmap-wrapper">
                        {/* Month labels */}
                        <div className="month-labels">
                            {Array.from({ length: 12 }).map((_, monthIdx) => {
                                const date = new Date();
                                date.setMonth(date.getMonth() - (11 - monthIdx));
                                return (
                                    <div
                                        key={monthIdx}
                                        className="month-label"
                                        style={{
                                            gridColumn: `${monthIdx * 4 + 1} / span 4`,
                                        }}
                                    >
                                        {date.toLocaleString("default", {
                                            month: "short",
                                        })}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Days and heatmap */}
                        <div className="heatmap-grid-github">
                            {/* Day labels */}
                            <div className="day-labels">
                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                                    (day, idx) => (
                                        <div key={idx} className="day-label">
                                            {day.substring(0, 1)}
                                        </div>
                                    )
                                )}
                            </div>

                            {/* Heatmap cells */}
                            <div className="heatmap-cells-grid">
                                {Array.from({ length: 53 }).map((_, weekIdx) => (
                                    <div key={weekIdx} className="week-column">
                                        {Array.from({ length: 7 }).map((_, dayIdx) => {
                                            const cellIndex = weekIdx * 7 + dayIdx;
                                            const cell = heatmapData[cellIndex];
                                            return (
                                                <div
                                                    key={`${weekIdx}-${dayIdx}`}
                                                    className={`heatmap-cell-github level-${cell?.level || 0
                                                        }`}
                                                    title={
                                                        cell
                                                            ? `${cell.date}: ${cell.count} ${cell.count === 1
                                                                ? "contribution"
                                                                : "contributions"
                                                            }`
                                                            : "No data"
                                                    }
                                                    data-date={cell?.date}
                                                    data-count={cell?.count}
                                                />
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Stats text */}
                    <div className="heatmap-stats">
                        <p>
                            {stats.todayActivity > 0
                                ? `${stats.todayActivity} contribution${stats.todayActivity === 1 ? "" : "s"
                                } today`
                                : "No contributions today"}
                        </p>
                        <p>
                            {stats.activeDays} active days in the last year
                        </p>
                    </div>
                </div>
            </div>

            {/* Article Performance Table */}
            <div className="articles-performance-section">
                <h3>Article Performance Breakdown</h3>
                <p className="section-subtitle">Detailed view of each article's performance</p>

                {articleStats.length > 0 ? (
                    <div className="articles-table-wrapper">
                        <table className="articles-table">
                            <thead>
                                <tr>
                                    <th>Article Title</th>
                                    <th className="numeric">Views</th>
                                    <th className="numeric">Likes</th>
                                    <th className="numeric">Dislikes</th>
                                    <th className="numeric">Engagement</th>
                                </tr>
                            </thead>
                            <tbody>
                                {articleStats.map((article, index) => {
                                    const totalEngagement = (article.likes || 0) + (article.dislikes || 0);
                                    const engagementRate = article.views > 0
                                        ? ((totalEngagement / article.views) * 100).toFixed(1)
                                        : 0;

                                    return (
                                        <tr key={index} className="article-row">
                                            <td className="article-title">
                                                <div className="title-content">
                                                    <span className="title-text">{article.title || "Untitled"}</span>
                                                </div>
                                            </td>
                                            <td className="numeric">
                                                <span className="metric-badge views-badge">
                                                    {article.views || 0}
                                                </span>
                                            </td>
                                            <td className="numeric">
                                                <span className="metric-badge likes-badge">
                                                    {article.likes || 0}
                                                </span>
                                            </td>
                                            <td className="numeric">
                                                <span className="metric-badge dislikes-badge">
                                                    {article.dislikes || 0}
                                                </span>
                                            </td>
                                            <td className="numeric">
                                                <span className="engagement-percent">{engagementRate}%</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No article data available yet. Your articles will appear here once they get views.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
