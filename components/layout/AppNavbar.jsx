"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiSearch, FiMoon, FiSun, FiBell, FiChevronDown, FiUser, FiLogOut, FiSettings } from "react-icons/fi";
import { useTheme } from "@/app/providers/ThemeProvider";

export default function AppNavbar({ userEmail, onSearchClick }) {
    const { isDark, toggleTheme } = useTheme();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [userData, setUserData] = useState({
        name: "Rupayan Dey",
        role: "Creator",
        profilePicture: null,
        email: userEmail || "rupayandey134@gmail.com",
    });
    const router = useRouter();

    useEffect(() => {
        const storedEmail = userEmail || (typeof window !== "undefined" ? localStorage.getItem("docspost-email") : "");
        const storedName = typeof window !== "undefined" ? localStorage.getItem("docspost-username") : "";
        if (storedEmail) {
            setUserData((prev) => ({
                ...prev,
                email: storedEmail,
                name: storedName || prev.name,
            }));
            // Fetch profile picture if available
            fetch(`/api/profile/get-profile?email=${encodeURIComponent(storedEmail)}`)
                .then((res) => (res.ok ? res.json() : null))
                .then((data) => {
                    if (data?.user) {
                        setUserData({
                            name: data.user.name || data.user.username || "Rupayan Dey",
                            role: "Creator",
                            profilePicture: data.user.profilePicture || null,
                            email: data.user.email || storedEmail,
                        });
                    }
                })
                .catch(() => { });
        }
    }, [userEmail]);

    return (
        <header className="app-navbar" role="banner">
            {/* Left: Brand & Navigation */}
            <div className="app-navbar-left">
                <Link href="/workspace" className="brand-link" aria-label="DocsPost Workspace">
                    <img src="/favicon.ico" alt="Logo" className="h-6 w-6 mr-2" />
                    <span>DocsPost</span>
                </Link>

                <nav aria-label="Main Navigation">
                    <ul className="navbar-nav-links">
                        <li className="navbar-nav-item">
                            <Link href="/" className="navbar-nav-link">Explore</Link>
                            <span className="navbar-dot-sep">•</span>
                        </li>
                        <li className="navbar-nav-item">
                            <Link href="/categories" className="navbar-nav-link">Categories</Link>
                            <span className="navbar-dot-sep">•</span>
                        </li>
                        <li className="navbar-nav-item">
                            <Link href="/learning" className="navbar-nav-link">Learning</Link>
                            <span className="navbar-dot-sep">•</span>
                        </li>
                        <li className="navbar-nav-item">
                            <Link href="/community" className="navbar-nav-link">Community</Link>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* Center: Search Field */}
            <div className="app-navbar-center">
                <div className="navbar-search-wrapper" onClick={onSearchClick}>
                    <FiSearch className="navbar-search-icon" />
                    <input
                        type="text"
                        className="navbar-search-input"
                        placeholder="Search documentation, topics, or creators..."
                        readOnly={Boolean(onSearchClick)}
                        aria-label="Search documentation"
                    />
                    <kbd className="navbar-search-badge">⌘ K</kbd>
                </div>
            </div>

            {/* Right: Theme Toggle, Bell, User Profile */}
            <div className="app-navbar-right">
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="navbar-action-btn"
                    aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                    title={isDark ? "Light mode" : "Dark mode"}
                >
                    {isDark ? <FiSun /> : <FiMoon />}
                </button>

                <button
                    type="button"
                    className="navbar-action-btn"
                    aria-label="Notifications"
                    title="Notifications"
                >
                    <FiBell />
                </button>

                <div style={{ position: "relative" }}>
                    <button
                        type="button"
                        className="navbar-user-btn"
                        onClick={() => setUserMenuOpen((prev) => !prev)}
                        aria-expanded={userMenuOpen}
                        aria-label="User account menu"
                    >
                        <div className="user-avatar-wrap">
                            {userData.profilePicture ? (
                                <img
                                    src={userData.profilePicture}
                                    alt={userData.name}
                                    className="user-avatar-img"
                                />
                            ) : (
                                <div className="user-avatar-fallback">
                                    {userData.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="user-status-dot" title="Online" />
                        </div>
                        <div className="user-meta-text">
                            <span className="user-name-title">{userData.name}</span>
                            <span className="user-role-sub">{userData.role}</span>
                        </div>
                        <FiChevronDown style={{ fontSize: "14px", color: "var(--editor-muted)" }} />
                    </button>

                    {userMenuOpen && (
                        <div
                            style={{
                                position: "absolute",
                                right: 0,
                                top: "100%",
                                marginTop: "8px",
                                width: "190px",
                                background: "var(--editor-card)",
                                border: "1px solid var(--editor-border)",
                                borderRadius: "10px",
                                boxShadow: "var(--editor-shadow-md)",
                                padding: "6px",
                                zIndex: 100,
                            }}
                        >
                            <Link
                                href="/profile"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "8px 12px",
                                    fontSize: "13px",
                                    color: "var(--editor-text)",
                                    textDecoration: "none",
                                    borderRadius: "6px",
                                }}
                            >
                                <FiUser /> Profile
                            </Link>
                            <Link
                                href="/workspace"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "8px 12px",
                                    fontSize: "13px",
                                    color: "var(--editor-text)",
                                    textDecoration: "none",
                                    borderRadius: "6px",
                                }}
                            >
                                <FiSettings /> Workspace
                            </Link>
                            <div style={{ height: "1px", background: "var(--editor-border)", margin: "4px 0" }} />
                            <button
                                type="button"
                                onClick={() => {
                                    if (typeof window !== "undefined") {
                                        localStorage.removeItem("docspost-auth");
                                        localStorage.removeItem("docspost-email");
                                        document.cookie = "docspost-auth=; max-age=0; path=/";
                                        router.push("/auth/signin");
                                    }
                                }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    width: "100%",
                                    padding: "8px 12px",
                                    fontSize: "13px",
                                    color: "#DC2626",
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    borderRadius: "6px",
                                    textAlign: "left",
                                }}
                            >
                                <FiLogOut /> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
