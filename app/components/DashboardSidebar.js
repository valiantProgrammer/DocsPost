"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IoLogoDribbble } from "react-icons/io";
import {
    FiHome,
    FiFileText,
    FiEdit3,
    FiBarChart2,
    FiBookmark,
    FiUser,
    FiSettings,
    FiHelpCircle,
    FiPlus,
    FiLogOut,
    FiMenu,
    FiX,
    FiFolder,
    FiClock,
    FiCheckCircle,
    FiShare2,
    FiTrash2,
    FiChevronDown,
    FiCloud
} from "react-icons/fi";
import { FaBookReader } from "react-icons/fa";
import { BiSolidDashboard } from "react-icons/bi";
import "./DashboardSidebar.css";

export default function DashboardSidebar({ activeTab, onTabChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [userName, setUserName] = useState("Rupayan Dey");
    const [userEmail, setUserEmail] = useState("rupayan@docspost.dev");
    const [profilePicture, setProfilePicture] = useState(null);
    const router = useRouter();

    const isWorkspaceTabActive =
        activeTab === "workspace" ||
        activeTab === "all" ||
        activeTab === "recent" ||
        activeTab === "drafts" ||
        activeTab === "published" ||
        activeTab === "bookmarked" ||
        activeTab === "shared" ||
        activeTab === "trash";

    // Keep dropdown open by default if activeTab is any workspace item
    const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);

    useEffect(() => {
        if (isWorkspaceTabActive) {
            setIsWorkspaceOpen(true);
        }
    }, [activeTab, isWorkspaceTabActive]);

    useEffect(() => {
        const storedName = localStorage.getItem("docspost-username");
        const storedEmail = localStorage.getItem("docspost-email");
        if (storedName) setUserName(storedName);
        if (storedEmail) setUserEmail(storedEmail);

        if (storedEmail) {
            fetch(`/api/profile/get-profile?email=${encodeURIComponent(storedEmail)}`)
                .then(r => r.ok ? r.json() : null)
                .then(data => {
                    if (data?.user?.profilePicture) {
                        setProfilePicture(data.user.profilePicture);
                    }
                })
                .catch(() => { });
        }
    }, []);

    // Workspace dropdown sub-items matching the exact items in user reference
    const workspaceSubmenu = [
        { id: "recent", label: "Recent", icon: FiClock, path: "/workspace/recent" },
        { id: "drafts", label: "Drafts", icon: FiEdit3, path: "/workspace/drafts" },
        { id: "published", label: "Published", icon: FiCheckCircle, path: "/workspace/published" },
        { id: "bookmarked", label: "Bookmarked", icon: FiBookmark, path: "/workspace/bookmarked" },
        { id: "shared", label: "Shared", icon: FiShare2, path: "/workspace/shared" },
        { id: "trash", label: "Trash", icon: FiTrash2, path: "/workspace/trash" },
    ];

    const goToTab = (tabId) => {
        const hash = (tabId === "bookmarked" || tabId === "bookmarks") ? "bookmark" : tabId;
        if (onTabChange) {
            onTabChange(tabId);
            if (typeof window !== "undefined") {
                window.location.hash = hash;
            }
        } else {
            router.push(`/dashboard#${hash}`);
        }
        setIsOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("docspost-auth");
        localStorage.removeItem("docspost-username");
        localStorage.removeItem("docspost-email");
        document.cookie = "docspost-auth=; path=/; max-age=0; samesite=lax";
        router.push("/Auth?mode=signin");
    };

    const isWorkspaceDirectlyActive = activeTab === "workspace" || activeTab === "all";

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                className="dashboard-sidebar-mobile-toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle navigation menu"
            >
                {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>

            {/* Sidebar backdrop */}
            {isOpen && (
                <div
                    className="dashboard-sidebar-backdrop"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`dashboard-sidebar-v2 ${isOpen ? "open" : ""}`}>
                {/* Brand Logo */}
                <div className="sidebar-brand-section">
                    <Link href="/" className="sidebar-brand-link">
                        <span className="sidebar-logo-icon">
                            <IoLogoDribbble size={28} />
                        </span>
                        <span className="sidebar-logo-text">DocsPost</span>
                    </Link>
                </div>

                {/* Primary Nav List */}
                <nav className="sidebar-navigation-v2">
                    {/* Overview */}
                    <button
                        className={`sidebar-nav-btn ${activeTab === "overview" || activeTab === "dashboard" ? "active" : ""}`}
                        onClick={() => goToTab("overview")}
                    >
                        <FiHome className="nav-icon" size={19} />
                        <span className="nav-label">Overview</span>
                    </button>

                    {/* Workspace Dropdown Section */}
                    <div className="sidebar-dropdown-group">
                        <div
                            className={`sidebar-nav-btn has-dropdown ${isWorkspaceDirectlyActive ? "active" : ""}`}
                        >
                            <div
                                className="sidebar-nav-main-action"
                                onClick={() => {
                                    goToTab("workspace");
                                    setIsWorkspaceOpen(true);
                                }}
                            >
                                <FiFolder className="nav-icon" size={19} />
                                <span className="nav-label">Workspace</span>
                            </div>
                            <button
                                type="button"
                                className={`sidebar-chevron-btn ${isWorkspaceOpen ? "open" : ""}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsWorkspaceOpen(!isWorkspaceOpen);
                                }}
                                aria-label="Toggle Workspace menu"
                            >
                                <FiChevronDown size={16} />
                            </button>
                        </div>

                        {/* Collapsible Submenu */}
                        {isWorkspaceOpen && (
                            <div className="sidebar-submenu">
                                {workspaceSubmenu.map((subItem) => {
                                    const SubIcon = subItem.icon;
                                    const isSubActive =
                                        activeTab === subItem.id ||
                                        (subItem.id === "bookmarked" && (activeTab === "bookmark" || activeTab === "bookmarks"));
                                    return (
                                        <button
                                            key={subItem.id}
                                            className={`sidebar-submenu-btn ${isSubActive ? "active" : ""}`}
                                            onClick={() => goToTab(subItem.id)}
                                        >
                                            <SubIcon className="nav-icon" size={17} />
                                            <span className="nav-label">{subItem.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Analytics */}
                    <button
                        className={`sidebar-nav-btn ${activeTab === "analytics" ? "active" : ""}`}
                        onClick={() => goToTab("analytics")}
                    >
                        <FiBarChart2 className="nav-icon" size={19} />
                        <span className="nav-label">Analytics</span>
                    </button>

                    {/* Bookmarks */}
                    <button
                        className={`sidebar-nav-btn ${activeTab === "bookmarks" || activeTab === "bookmark" || activeTab === "bookmarked" ? "active" : ""}`}
                        onClick={() => goToTab("bookmark")}
                    >
                        <FiBookmark className="nav-icon" size={19} />
                        <span className="nav-label">Bookmarks</span>
                    </button>
                    {/* Learning */}
                    <button
                        className={`sidebar-nav-btn ${activeTab === "learning" || activeTab === "learning" || activeTab === "learning" ? "active" : ""}`}
                        onClick={() => goToTab("learning")}
                    >
                        <FaBookReader className="nav-icon" size={19} />
                        <span className="nav-label">Learning</span>
                    </button>

                    {/* Profile */}
                    <button
                        className={`sidebar-nav-btn ${activeTab === "profile" ? "active" : ""}`}
                        onClick={() => goToTab("profile")}
                    >
                        <FiUser className="nav-icon" size={19} />
                        <span className="nav-label">Profile</span>
                    </button>

                    {/* Settings */}
                    <button
                        className={`sidebar-nav-btn ${activeTab === "settings" ? "active" : ""}`}
                        onClick={() => goToTab("settings")}
                    >
                        <FiSettings className="nav-icon" size={19} />
                        <span className="nav-label">Settings</span>
                    </button>
                </nav>

                {/* + New Document CTA */}
                <div className="sidebar-cta-section">
                    <button
                        className="sidebar-new-doc-btn"
                        onClick={() => router.push("/workspace/new")}
                    >
                        <FiPlus size={18} />
                        <span>+ New Document</span>
                    </button>
                </div>

                {/* Footer Section */}
                <div className="sidebar-footer-v2">
                    <button
                        className="sidebar-help-link"
                        onClick={() => router.push("/about")}
                    >
                        <FiHelpCircle size={17} />
                        <span>Help & Support</span>
                    </button>

                    <div className="sidebar-user-card">
                        <div className="sidebar-user-avatar">
                            {profilePicture ? (
                                <img src={profilePicture} alt={userName} />
                            ) : (
                                <span>{userName.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="sidebar-user-info">
                            <span className="user-card-name">{userName}</span>
                            <span className="user-card-email">{userEmail}</span>
                        </div>
                        <button
                            className="sidebar-logout-btn"
                            onClick={handleLogout}
                            title="Sign Out"
                            aria-label="Sign Out"
                        >
                            <FiLogOut size={16} />
                        </button>
                    </div>

                    {/* Storage Usage Widget matching screenshot */}
                    <div className="sidebar-storage-card">
                        <div className="storage-card-header">
                            <div className="storage-icon-label">
                                <FiCloud size={16} className="storage-icon" />
                                <span>Storage Usage</span>
                            </div>
                            <span className="storage-values">2.4 GB / 10 GB</span>
                        </div>
                        <div className="storage-progress-track">
                            <div className="storage-progress-fill" style={{ width: "24%" }}></div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
