"use client";
import { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import "./AnalyticsDashboard.css";
import { FiTrendingUp, FiEye, FiThumbsUp, FiCalendar } from "react-icons/fi";

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

            {/* Stats Cards */}
            <div className="stats-cards">
                <div className="stat-card">
                    <div className="stat-icon views-icon">
                        <FiEye size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Views</p>
                        <h3 className="stat-value">{stats.totalViews}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon likes-icon">
                        <FiThumbsUp size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Likes</p>
                        <h3 className="stat-value">{stats.totalLikes}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon votes-icon">
                        <FiTrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Votes</p>
                        <h3 className="stat-value">{stats.totalVotes}</h3>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon days-icon">
                        <FiCalendar size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Active Days</p>
                        <h3 className="stat-value">{stats.activeDays}</h3>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-container">
                <div className="chart-section">
                    <h3>Views Over Time</h3>
                    <div className="chart-wrapper">
                        {isLoading ? (
                            <div className="chart-loading">Loading...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
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
                                            border: `1px solid var(--line)`,
                                            color: "var(--text-main)",
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="var(--brand)"
                                        name="Views"
                                        dot={{ fill: "var(--brand)", r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Article Stats Bar Chart */}
                <div className="chart-section">
                    <h3>Top Articles Performance</h3>
                    <div className="chart-wrapper">
                        {articleStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
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
                                            border: `1px solid var(--line)`,
                                            color: "var(--text-main)",
                                        }}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="views"
                                        fill="var(--brand)"
                                        name="Views"
                                    />
                                    <Bar
                                        dataKey="likes"
                                        fill="var(--brand-deep)"
                                        name="Likes"
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
        </div>
    );
}
