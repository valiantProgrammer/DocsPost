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
    const [timeframe, setTimeframe] = useState("daily"); // quarterly, daily, monthly, yearly
    const [viewStats, setViewStats] = useState([]);
    const [voteStats, setVoteStats] = useState([]);
    const [articleStats, setArticleStats] = useState([]);
    const [activityLog, setActivityLog] = useState([]);
    const [heatmapStats, setHeatmapStats] = useState([]);
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
        fetchHeatmapData();
    }, [userEmail, timeframe]);



    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            const url = `/api/analytics/get-stats-optimized?email=${encodeURIComponent(
                userEmail
            )}&timeframe=${timeframe}`;
            console.log(`[AnalyticsDashboard] Fetching: ${url}`);

            const response = await fetch(url);
            console.log(`[AnalyticsDashboard] Response status: ${response.status}`);

            if (response.ok) {
                const data = await response.json();
                console.log(`[AnalyticsDashboard] Response data:`, data);
                console.log(`[AnalyticsDashboard] viewStats array:`, data.viewStats);
                console.log(`[AnalyticsDashboard] viewStats length:`, data.viewStats?.length || 0);

                setViewStats(data.viewStats);
                setVoteStats(data.voteStats);
                setArticleStats(data.articleStats);

                // Calculate stats from optimized data for stat cards
                const summary = data.summary || {};
                const totalViews = summary.allTimeViews || 0;
                const totalVotes = summary.allTimeVotes || 0;

                // Count active days (intervals with views or votes)
                const activeDaysCount = (data.viewStats || []).filter(
                    interval => interval.views > 0
                ).length;

                // Get today's activity (first interval is typically the most recent)
                const todayActivity = data.viewStats && data.viewStats.length > 0
                    ? data.viewStats[0].views || 0
                    : 0;

                setStats({
                    totalViews,
                    totalVotes,
                    totalLikes: totalVotes,
                    activeDays: activeDaysCount,
                    todayActivity
                });

                console.log(`[AnalyticsDashboard] State updated - viewStats set to:`, data.viewStats);
                console.log(`[AnalyticsDashboard] Stats calculated:`, {
                    totalViews,
                    totalVotes,
                    activeDays: activeDaysCount,
                    todayActivity
                });
            } else {
                console.error(`[AnalyticsDashboard] Response not OK: ${response.status}`);
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchHeatmapData = async () => {
        try {
            // Fetch contribution activity (articles created) for the past year for heatmap
            const url = `/api/analytics/contribution-activity?email=${encodeURIComponent(
                userEmail
            )}&days=365`;

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();

                // Transform creationsByDay into daily heatmap data (articles created per day)
                const dailyActivityMap = {};
                (data.creationsByDay || []).forEach(day => {
                    const dateStr = day.date.toISOString ? day.date.toISOString().split("T")[0] : day.date.split("T")[0];
                    dailyActivityMap[dateStr] = {
                        count: day.articlesCreated || 0,
                        articlesCreated: day.articlesCreated || 0
                    };
                });

                setHeatmapStats(dailyActivityMap);
                console.log(`[AnalyticsDashboard] Contribution heatmap data updated:`, dailyActivityMap);
            }
        } catch (error) {
            console.error("Error fetching heatmap data:", error);
        }
    };

    // Get subtitle based on timeframe (with sliding window limits)
    const getTimeframeSubtitle = () => {
        switch (timeframe) {
            case "quarterly":
                return "Last 28 quarters (7 years, 15-min intervals)";
            case "daily":
                return "Last 30 days";
            case "monthly":
                return "Last 36 months (3 years)";
            case "yearly":
                return "Last 20 years";
            default:
                return "Last 30 days";
        }
    };

    // Fill missing data points with 0
    const fillMissingData = (data) => {
        if (!data || data.length === 0) return [];

        const filledData = [];
        const now = new Date();

        if (timeframe === "quarterly") {
            const now = new Date();
            const minutes = now.getMinutes();
            const alignedMinutes = Math.floor(minutes / 15) * 15;

            const alignedTime = new Date(now);
            alignedTime.setMinutes(alignedMinutes);
            alignedTime.setSeconds(0);
            alignedTime.setMilliseconds(0);

            const intervals = 28;
            for (let i = intervals - 1; i >= 0; i--) {
                const date = new Date(alignedTime.getTime() - i * 15 * 60 * 1000);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hour = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day} ${hour}:${minutes}`;
                const existing = data.find(item => item._id === dateStr);
                filledData.push({
                    _id: dateStr,
                    views: existing ? existing.views : 0,
                    articles: existing ? existing.articles : [],
                });
            }
        } else if (timeframe === "daily") {
            // Fill missing days in last 30 days
            const days = 30;
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const dateStr = date.toISOString().slice(0, 10);
                const existing = data.find(item => item._id === dateStr);
                filledData.push({
                    _id: dateStr,
                    views: existing ? existing.views : 0,
                    articles: existing ? existing.articles : [],
                });
            }
        } else if (timeframe === "monthly") {
            const months = 36;
            for (let i = months - 1; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const dateStr = date.toISOString().slice(0, 7);
                const existing = data.find(item => item._id === dateStr);
                filledData.push({
                    _id: dateStr,
                    views: existing ? existing.views : 0,
                    articles: existing ? existing.articles : [],
                });
            }
        } else if (timeframe === "yearly") {
            const years = 20;
            for (let i = years - 1; i >= 0; i--) {
                const year = now.getFullYear() - i;
                const dateStr = year.toString();
                const existing = data.find(item => item._id === dateStr);
                filledData.push({
                    _id: dateStr,
                    views: existing ? existing.views : 0,
                    articles: existing ? existing.articles : [],
                });
            }
        }

        return filledData.length > 0 ? filledData : data;
    };

    // Format data for display
    const filledViewStats = fillMissingData(viewStats);

    console.log(`[AnalyticsDashboard] Timeframe: ${timeframe}`);
    console.log(`[AnalyticsDashboard] Original viewStats length: ${viewStats?.length || 0}`);
    console.log(`[AnalyticsDashboard] Filled viewStats length: ${filledViewStats?.length || 0}`);
    console.log(`[AnalyticsDashboard] Filled viewStats:`, filledViewStats);

    if (timeframe === "quarterly") {
        console.log("[Debug] API viewStats:", viewStats);
        console.log("[Debug] Filled viewStats:", filledViewStats);
    }

    const formattedViewStats = filledViewStats.map((item) => ({
        ...item,
        name: item._id,
        value: item.views,
    }));

    console.log(`[AnalyticsDashboard] Formatted viewStats (with name/value):`, formattedViewStats);

    // Calculate smoothed trend line using Exponential Moving Average with trend projection
    // Adapts smoothing parameters based on timeframe and data point count
    const calculateSmoothedTrendLine = (data) => {
        const dataLength = data.length;

        // Dynamically adjust smoothing based on timeframe and data volume
        let alpha, trendWindow, lookAheadWeight;

        // Customize smoothing parameters for each timeframe
        if (timeframe === "quarterly") {
            alpha = 0.3;
            trendWindow = Math.min(8, dataLength);
            lookAheadWeight = 1.3;
        } else if (timeframe === "daily") {
            alpha = 0.25;      // Lighter smoothing
            trendWindow = Math.min(7, dataLength);
            lookAheadWeight = 1.2;
        } else if (timeframe === "monthly") {
            alpha = 0.2;       // Even lighter
            trendWindow = Math.min(6, dataLength);
            lookAheadWeight = 1.1;
        } else if (timeframe === "yearly") {
            alpha = 0.25;
            trendWindow = Math.min(5, dataLength);
            lookAheadWeight = 1.2;
        }

        // Step 1: Calculate Exponential Moving Average (EMA)
        const emaValues = [];
        let ema = data[0]?.value || 0;

        for (let i = 0; i < data.length; i++) {
            ema = alpha * (data[i]?.value || 0) + (1 - alpha) * ema;
            emaValues.push(ema);
        }

        // Step 2: Calculate trend direction (slope over recent points)
        const trendStartIdx = Math.max(0, dataLength - trendWindow);
        const recentEMA = emaValues.slice(trendStartIdx);

        let totalTrend = 0;
        for (let i = 1; i < recentEMA.length; i++) {
            totalTrend += (recentEMA[i] - recentEMA[i - 1]);
        }
        const avgTrend = totalTrend / Math.max(1, recentEMA.length - 1);

        // Step 3: Project trend forward to create "leading" effect
        return emaValues.map((emaVal) => {
            const projectedValue = emaVal + (avgTrend * lookAheadWeight);
            return Math.max(0, Math.round(projectedValue * 100) / 100);
        });
    };

    const smoothedTrendValues = calculateSmoothedTrendLine(formattedViewStats);

    console.log(`[AnalyticsDashboard] Smoothed trend values:`, smoothedTrendValues);

    const chartDataWithDeviation = formattedViewStats.map((item, index) => ({
        ...item,
        deviation: smoothedTrendValues[index] || 0,
    }));

    console.log(`[AnalyticsDashboard] Chart data with deviation (passed to ComposedChart):`, chartDataWithDeviation);

    // Get activity heatmap data (last 365 days) from optimized analytics
    const getActivityHeatmap = () => {
        const heatmapData = [];
        for (let i = 364; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split("T")[0];
            const activity = heatmapStats[dateStr];
            const count = activity?.count || 0;

            heatmapData.push({
                date: dateStr,
                dayOfWeek: date.getDay(),
                week: Math.floor(i / 7),
                count: count,
                level:
                    count === 0
                        ? 0
                        : count <= 1
                            ? 1
                            : count <= 3
                                ? 2
                                : count <= 5
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
                        className={`timeframe-btn ${timeframe === "quarterly" ? "active" : ""}`}
                        onClick={() => setTimeframe("quarterly")}
                    >
                        Quarterly
                    </button>
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
                    <p className="chart-subtitle">{getTimeframeSubtitle()}</p>
                    <div className="chart-wrapper">
                        {isLoading ? (
                            <div className="chart-loading">Loading...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={320}>
                                <ComposedChart data={chartDataWithDeviation} margin={{ top: 20, right: 30, bottom: 80, left: 0 }}>
                                    <defs>
                                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--chart-purple)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--chart-purple)" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="1 1"
                                        stroke="var(--chart-grid)"
                                    />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 12 }}
                                        stroke="var(--text-muted)"
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        width={60}
                                        stroke="var(--text-muted)"
                                        tick={{ fontSize: 12 }}
                                        domain={[0, 'auto']}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        width={60}
                                        type="number"
                                        stroke="var(--text-muted)"
                                        tick={{ fontSize: 12 }}
                                        domain={[0, 'auto']}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#0c0e12",
                                            border: `2px solid var(--chart-purple)`,
                                            color: "var(--text-main)",
                                            borderRadius: "8px",
                                            padding: "12px",
                                        }}
                                        wrapperStyle={{
                                            backgroundColor: "rgba(139, 92, 246, 0.15)",
                                            borderRadius: "8px",
                                        }}
                                        cursor={{ fill: 'rgba(139, 92, 246, 0.2)' }}
                                    />
                                    <Legend />
                                    <Bar
                                        yAxisId="left"
                                        dataKey="value"
                                        fill="var(--chart-purple)"
                                        name="Page Views"
                                        radius={[8, 8, 0, 0]}
                                        opacity={0.85}
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="natural"
                                        dataKey="deviation"
                                        stroke="var(--chart-green)"
                                        name="Trend (Deviation from Avg)"
                                        strokeWidth={3}
                                        dot={false}
                                        isAnimationActive={false}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className="chart-section-large">
                    <h3>Engagement Distribution</h3>
                    <p className="chart-subtitle">By top performing articles - votes and views</p>
                    <div className="chart-wrapper">
                        {isLoading ? (
                            <div className="chart-loading">Loading...</div>
                        ) : articleStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height={320}>
                                <PieChart margin={{ top: 20, right: 30, bottom: 80, left: 0 }}>
                                    <Pie
                                        data={articleStats.slice(0, 4)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={2}
                                        dataKey="votes"
                                        label={({ title, votes, percent }) => `${title?.substring(0, 15)}... ${(percent * 100).toFixed(1)}%`}
                                    >
                                        <Cell fill="var(--chart-red)" />
                                        <Cell fill="var(--chart-green)" />
                                        <Cell fill="var(--chart-blue)" />
                                        <Cell fill="var(--chart-pink)" />
                                        <Cell fill="var(--chart-purple)" />
                                        <Cell fill="var(--chart-orange)" />
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#0c0e12",
                                            border: `2px solid var(--chart-purple)`,
                                            color: "var(--text-main)",
                                            borderRadius: "8px",
                                            padding: "12px",
                                        }}
                                        wrapperStyle={{
                                            backgroundColor: "rgba(139, 92, 246, 0.15)",
                                            borderRadius: "8px",
                                        }}
                                        formatter={(value, name, props) => [
                                            value,
                                            `${props.payload.title}: ${value} votes`
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
                    <p className="chart-subtitle">Views and votes by article topic</p>
                    <div className="chart-wrapper">
                        {articleStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={articleStats.slice(0, 5)} margin={{ top: 20, right: 30, bottom: 80, left: 0 }}>
                                    <CartesianGrid
                                        strokeDasharray="1 1"
                                        stroke="var(--chart-grid)"
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
                                            backgroundColor: "#0c0e12",
                                            border: `2px solid var(--chart-purple)`,
                                            color: "var(--text-main)",
                                            borderRadius: "8px",
                                            padding: "12px",
                                        }}
                                        wrapperStyle={{
                                            backgroundColor: "rgba(139, 92, 246, 0.15)",
                                            borderRadius: "8px",
                                        }}
                                        shape={false}
                                        cursor={{ fill: 'rgba(139, 92, 246, 0.2)' }}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="views"
                                        fill="var(--chart-orange)"
                                        name="Views"
                                        radius={[8, 8, 0, 0]}
                                        activeBar={{ fill: 'rgba(249, 115, 22, 0.8)' }}
                                        isAnimationActive={false}
                                    />
                                    <Bar
                                        dataKey="votes"
                                        fill="var(--chart-pink)"
                                        name="Votes (Likes)"
                                        radius={[8, 8, 0, 0]}
                                        activeBar={{ fill: 'rgba(236, 72, 153, 0.8)' }}
                                        isAnimationActive={false}
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
                                <LineChart data={chartDataWithDeviation} margin={{ top: 20, right: 30, bottom: 80, left: 0 }}>
                                    <CartesianGrid
                                        strokeDasharray="1 1"
                                        stroke="var(--chart-grid)"
                                    />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 12 }}
                                        stroke="var(--text-muted)"
                                    />
                                    <YAxis
                                        width={60}
                                        type="number"
                                        stroke="var(--text-muted)"
                                        tick={{ fontSize: 12 }}
                                        domain={[0, 'auto']}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#0c0e12",
                                            border: `2px solid var(--chart-cyan)`,
                                            color: "var(--text-main)",
                                            borderRadius: "8px",
                                            padding: "12px",
                                        }}
                                        wrapperStyle={{
                                            backgroundColor: "rgba(6, 182, 212, 0.15)",
                                            borderRadius: "8px",
                                        }}
                                        cursor={{ fill: 'rgba(6, 182, 212, 0.2)' }}
                                    />
                                    <Legend />
                                    <Line
                                        type="natural"
                                        dataKey="deviation"
                                        stroke="var(--chart-blue)"
                                        name="Activity (Deviation from Avg)"
                                        dot={false}
                                        isAnimationActive={false}
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
                <p className="activity-subtitle">Articles created over the past year</p>
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
                                            ? "No articles"
                                            : `${level === 1
                                                ? "1"
                                                : level === 2
                                                    ? "2-3"
                                                    : level === 3
                                                        ? "4-5"
                                                        : "6+"
                                            } articles created`
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
                                                            ? `${cell.date}: ${cell.count} article${cell.count === 1
                                                                ? ""
                                                                : "s"
                                                            } created`
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
                                ? `${stats.todayActivity} article${stats.todayActivity === 1 ? "" : "s"
                                } created today`
                                : "No articles created today"}
                        </p>
                        <p>
                            {stats.activeDays} days with articles created in the last year
                        </p>
                    </div>
                </div>
            </div>

            {/* Article Performance Table */}
            <div className="articles-performance-section">
                <h3>Article Performance Breakdown - Votes by Topic</h3>
                <p className="section-subtitle">Track which topics your readers are voting on</p>

                {articleStats.length > 0 ? (
                    <div className="articles-table-wrapper">
                        <table className="articles-table">
                            <thead>
                                <tr>
                                    <th>Article Topic</th>
                                    <th className="numeric">Views</th>
                                    <th className="numeric">Votes (Likes)</th>
                                    <th className="numeric">Vote Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {articleStats.map((article, index) => {
                                    const voteRate = article.views > 0
                                        ? ((article.votes / article.views) * 100).toFixed(1)
                                        : 0;

                                    return (
                                        <tr key={index} className="article-row">
                                            <td className="article-title">
                                                <div className="title-content">
                                                    <span className="title-text">{article.title || "Untitled"}</span>
                                                    <span className="article-id">{article.articleId}</span>
                                                </div>
                                            </td>
                                            <td className="numeric">
                                                <span className="metric-badge views-badge">
                                                    {article.views || 0}
                                                </span>
                                            </td>
                                            <td className="numeric">
                                                <span className="metric-badge votes-badge">
                                                    {article.votes || 0}
                                                </span>
                                            </td>
                                            <td className="numeric">
                                                <span className="vote-rate">{voteRate}%</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No article data available yet. Your articles will appear here once they get views and votes.</p>
                    </div>
                )}
            </div>
        </div>
    );
}