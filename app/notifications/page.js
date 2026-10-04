"use client";

import { useState } from "react";
import Header from "@/app/components/Header";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import Footer from "@/app/components/Footer";
import { useTheme } from "@/app/providers/ThemeProvider";
import {
  FiThumbsUp,
  FiBookmark,
  FiEye,
  FiUserPlus,
  FiCheckCircle,
  FiClock,
  FiFilter,
} from "react-icons/fi";
import "./notifications.css";

const NOTIFICATIONS_DATA = [
  {
    id: "notif-1",
    group: "Today",
    type: "upvote",
    title: "Your document received 12 new upvotes",
    detail: "FastAPI Authentication with JWT",
    time: "2m ago",
    icon: FiThumbsUp,
    iconColor: "#2563eb",
    iconBg: "rgba(37, 99, 235, 0.12)",
    unread: true,
  },
  {
    id: "notif-2",
    group: "Today",
    type: "bookmark",
    title: "Someone bookmarked your document",
    detail: "System Design Notes",
    time: "1h ago",
    icon: FiBookmark,
    iconColor: "#8b5cf6",
    iconBg: "rgba(139, 92, 246, 0.12)",
    unread: true,
  },
  {
    id: "notif-3",
    group: "Today",
    type: "view",
    title: "Your document reached 1,000 views",
    detail: "ML Pipeline Guide",
    time: "3h ago",
    icon: FiEye,
    iconColor: "#06b6d4",
    iconBg: "rgba(6, 182, 212, 0.12)",
    unread: false,
  },
  {
    id: "notif-4",
    group: "Today",
    type: "follower",
    title: "New follower",
    detail: "Ananya Roy started following you",
    time: "5h ago",
    icon: FiUserPlus,
    iconColor: "#10b981",
    iconBg: "rgba(16, 185, 129, 0.12)",
    unread: false,
  },
  {
    id: "notif-5",
    group: "Today",
    type: "publish",
    title: "Document published successfully",
    detail: "Docker Complete Guide",
    time: "6h ago",
    icon: FiCheckCircle,
    iconColor: "#3b82f6",
    iconBg: "rgba(59, 130, 246, 0.12)",
    unread: false,
  },
  {
    id: "notif-6",
    group: "Yesterday",
    type: "upvote",
    title: "Your document received 6 new upvotes",
    detail: "React Hooks Guide",
    time: "1d ago",
    icon: FiThumbsUp,
    iconColor: "#2563eb",
    iconBg: "rgba(37, 99, 235, 0.12)",
    unread: false,
  },
];

export default function NotificationsPage() {
  const { isDark } = useTheme();
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Unread", "Mentions", "Upvotes", "Followers"];

  const filteredNotifs = NOTIFICATIONS_DATA.filter((item) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Unread") return item.unread;
    if (activeFilter === "Upvotes") return item.type === "upvote";
    if (activeFilter === "Followers") return item.type === "follower";
    return true;
  });

  const todayNotifs = filteredNotifs.filter((n) => n.group === "Today");
  const yesterdayNotifs = filteredNotifs.filter((n) => n.group === "Yesterday");

  return (
    <div className="dashboard-container" data-theme={isDark ? "dark" : "light"}>
      <Header />
      <DashboardSidebar activeTab="notifications" />

      <main className="dashboard-main">
        <div className="notifications-page-container">
          <div className="notifications-header">
            <div>
              <h1 className="notifications-title">Notifications</h1>
              <p className="notifications-subtitle">
                Stay updated with activity across your documents and community.
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="notifications-tabs-bar">
            {filters.map((f) => (
              <button
                key={f}
                className={`notif-tab-btn ${activeFilter === f ? "active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Notification Groups */}
          <div className="notifications-list-wrapper">
            {todayNotifs.length > 0 && (
              <div className="notif-group-section">
                <h3 className="notif-group-title">Today</h3>
                <div className="notif-cards-list">
                  {todayNotifs.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.id}
                        className={`notif-card-item ${item.unread ? "unread" : ""}`}
                      >
                        <div
                          className="notif-icon-box"
                          style={{ background: item.iconBg, color: item.iconColor }}
                        >
                          <Icon size={20} />
                        </div>

                        <div className="notif-content-info">
                          <div className="notif-title-row">
                            <span className="notif-main-title">{item.title}</span>
                            <span className="notif-timestamp">{item.time}</span>
                          </div>
                          <p className="notif-detail-text">{item.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {yesterdayNotifs.length > 0 && (
              <div className="notif-group-section">
                <h3 className="notif-group-title">Yesterday</h3>
                <div className="notif-cards-list">
                  {yesterdayNotifs.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.id}
                        className={`notif-card-item ${item.unread ? "unread" : ""}`}
                      >
                        <div
                          className="notif-icon-box"
                          style={{ background: item.iconBg, color: item.iconColor }}
                        >
                          <Icon size={20} />
                        </div>

                        <div className="notif-content-info">
                          <div className="notif-title-row">
                            <span className="notif-main-title">{item.title}</span>
                            <span className="notif-timestamp">{item.time}</span>
                          </div>
                          <p className="notif-detail-text">{item.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
