"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IoLogoDribbble } from "react-icons/io";
import { GoBell } from "react-icons/go";
import { PiSunBold } from "react-icons/pi";
import { FaMoon } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import {
    FiUser,
    FiBookmark,
    FiSettings,
    FiLogOut,
    FiAward,
    FiHome,
    FiMenu,
    FiX,
    FiCompass,
    FiGrid,
    FiBookOpen,
    FiUsers,
    FiPlus
} from "react-icons/fi";
import { syncAuthDataFromCookies } from "@/lib/authUtils";
import { useTheme } from "@/app/providers/ThemeProvider";

export default function Header() {
    const { isDark, toggleTheme } = useTheme();
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);
    const dropdownRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        syncAuthDataFromCookies();

        const savedAuthState = localStorage.getItem("docspost-auth");
        const hasSignedInCookie = document.cookie.includes("docspost-auth=signed-in");
        const savedUserName = localStorage.getItem("docspost-username");
        const savedUserEmail = localStorage.getItem("docspost-email");

        setIsSignedIn(savedAuthState === "signed-in" || hasSignedInCookie);

        if (savedUserName) setUserName(savedUserName);
        if (savedUserEmail) setUserEmail(savedUserEmail);

        const fetchProfilePicture = async () => {
            try {
                if (savedUserEmail) {
                    const response = await fetch(
                        `/api/profile/get-profile?email=${encodeURIComponent(savedUserEmail)}`
                    );
                    if (response.ok) {
                        const data = await response.json();
                        setProfilePicture(data.user.profilePicture);
                    }
                }
            } catch (error) {
                console.error("Error fetching profile picture:", error);
            }
        };

        if (savedUserEmail) {
            fetchProfilePicture();
        }
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } finally {
            localStorage.removeItem("docspost-auth");
            localStorage.removeItem("docspost-username");
            localStorage.removeItem("docspost-email");
            document.cookie = "docspost-auth=; path=/; max-age=0; samesite=lax";
            document.cookie = "docspost-username=; path=/; max-age=0; samesite=lax";
            document.cookie = "docspost-email=; path=/; max-age=0; samesite=lax";
            setIsSignedIn(false);
            setUserName("");
            setIsDropdownOpen(false);
            setMobileMenuOpen(false);
        }
    };

    const handleSignIn = () => {
        router.push("/Auth?mode=signin");
        setMobileMenuOpen(false);
    };

    const handleProfileClick = (path) => {
        if (path === "/profile") {
            router.push(`/${userName || "alexrivera"}`);
        } else {
            router.push(path);
        }
        setIsDropdownOpen(false);
        setMobileMenuOpen(false);
    };

    const handleSearchClick = () => {
        router.push("/search");
        setMobileMenuOpen(false);
    };

    const handleSearchInput = (e) => {
        if (e.key === "Enter" && e.target.value.trim()) {
            router.push(`/search?q=${encodeURIComponent(e.target.value.trim())}`);
            setMobileMenuOpen(false);
        }
    };

    const navLinks = [
        { label: "Explore", href: "/explore", icon: FiCompass },
        { label: "Categories", href: "/categories", icon: FiGrid },
        { label: "Learning", href: "/learning", icon: FiBookOpen },
        { label: "Community", href: "/explore", icon: FiUsers },
    ];

    return (
        <header className="main-header">
            <div className="main-header-inner">
                <div className="brand-and-search">
                    <Link className="brand-mark" href="/" aria-label="DocsPost Home" onClick={() => setMobileMenuOpen(false)}>
                        <span className="brand-icon-wrap">
                            <IoLogoDribbble size={32} />
                        </span>
                        <span className="brand-word font-bold tracking-tight text-[1.25rem]">DocsPost</span>
                    </Link>

                    <label className="header-search hidden sm:inline-flex" aria-label="Search documentation">
                        <svg viewBox="0 0 24 24" className="hidden sm:flex" aria-hidden="true">
                            <path d="M10.5 3.75a6.75 6.75 0 1 0 4.196 12.037l4.759 4.758a.75.75 0 1 0 1.06-1.06l-4.758-4.76A6.75 6.75 0 0 0 10.5 3.75Zm0 1.5a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5Z" />
                        </svg>
                        <input
                            type="search"
                            className="text-[13px] hidden sm:flex"
                            placeholder="Search docs, tutorials, guides..."
                            onKeyDown={handleSearchInput}
                        />
                    </label>
                </div>

                <nav className="primary-nav hidden md:flex items-center gap-6" aria-label="Primary">
                    {navLinks.map((item) => (
                        <Link
                            className="text-[14px] font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
                            key={item.label}
                            href={item.href}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="header-actions">
                    <button
                        type="button"
                        className="circle-action sm:hidden grid place-items-center"
                        aria-label="Search"
                        onClick={handleSearchClick}
                    >
                        <CiSearch size={20} />
                    </button>
                    <button
                        type="button"
                        className="circle-action grid place-items-center"
                        aria-label="Theme"
                        onClick={toggleTheme}
                    >
                        {isDark ? <PiSunBold size={20} /> : <FaMoon size={18} />}
                    </button>
                    <button
                        type="button"
                        className="circle-action grid place-items-center"
                        aria-label="Notifications"
                        onClick={() => router.push("/notifications")}
                    >
                        <GoBell size={20} />

                    </button>

                    {isSignedIn ? (
                        <div className="profile-dropdown-container" ref={dropdownRef}>
                            <button
                                type="button"
                                className="profile-button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                aria-label="User profile menu"
                            >
                                <div className="profile-avatar">
                                    {profilePicture ? (
                                        <img
                                            src={profilePicture}
                                            alt={userName}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                borderRadius: "50%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    ) : (
                                        userName ? userName.charAt(0).toUpperCase() : "U"
                                    )}
                                </div>
                            </button>

                            {isDropdownOpen && (
                                <div className="profile-dropdown">
                                    <div className="dropdown-header">
                                        <p className="user-name">{userName || "User"}</p>
                                        <p className="user-email">{userEmail || "Creator"}</p>
                                    </div>

                                    <div className="dropdown-divider"></div>

                                    <div className="dropdown-menu">
                                        <button
                                            className="dropdown-item"
                                            onClick={() => handleProfileClick("/dashboard")}
                                        >
                                            <FiHome size={18} />
                                            <span>Dashboard</span>
                                        </button>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => handleProfileClick("/workspace")}
                                        >
                                            <FiUser size={18} />
                                            <span>Workspace</span>
                                        </button>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => handleProfileClick(userName ? `/${userName}` : "/alexrivera")}
                                        >
                                            <FiUser size={18} />
                                            <span>Public Profile</span>
                                        </button>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => handleProfileClick("/learning")}
                                        >
                                            <FiAward size={18} />
                                            <span>My Learning</span>
                                        </button>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => handleProfileClick("/bookmarks")}
                                        >
                                            <FiBookmark size={18} />
                                            <span>Saved Items</span>
                                        </button>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => handleProfileClick("/settings")}
                                        >
                                            <FiSettings size={18} />
                                            <span>Settings</span>
                                        </button>
                                    </div>

                                    <div className="dropdown-divider"></div>

                                    <button
                                        className="dropdown-item signout-item"
                                        onClick={handleSignOut}
                                    >
                                        <FiLogOut size={18} />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="header-auth-buttons hidden sm:flex items-center gap-2">
                            <button
                                type="button"
                                className="sign-in-btn text-sm font-semibold px-3 py-1.5 rounded-lg text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 transition"
                                onClick={handleSignIn}
                                aria-label="Sign in"
                            >
                                Sign In
                            </button>
                            <button
                                type="button"
                                className="get-started-btn text-sm font-semibold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition transform active:scale-95"
                                onClick={() => router.push("/Auth?mode=signup")}
                                aria-label="Get Started"
                            >
                                Get Started
                            </button>
                        </div>
                    )}

                    {/* Mobile Menu Toggle Button (Layout 15) */}
                    <button
                        type="button"
                        className="circle-action md:hidden grid place-items-center"
                        aria-label="Toggle navigation menu"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer (Layout 15) */}
            {mobileMenuOpen && (
                <div className="mobile-nav-drawer md:hidden">
                    <div className="mobile-nav-search">
                        <label className="header-search" style={{ display: "flex", width: "100%" }}>
                            <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 18, height: 18 }}>
                                <path d="M10.5 3.75a6.75 6.75 0 1 0 4.196 12.037l4.759 4.758a.75.75 0 1 0 1.06-1.06l-4.758-4.76A6.75 6.75 0 0 0 10.5 3.75Zm0 1.5a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5Z" />
                            </svg>
                            <input
                                type="search"
                                placeholder="Search documentation..."
                                onKeyDown={handleSearchInput}
                                autoFocus
                            />
                        </label>
                    </div>

                    <div className="mobile-nav-links">
                        {navLinks.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="mobile-nav-item"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <IconComponent size={18} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="mobile-nav-divider"></div>

                    {isSignedIn ? (
                        <div className="mobile-user-section">
                            <div className="mobile-user-info">
                                <div className="profile-avatar" style={{ width: 36, height: 36, fontSize: 16 }}>
                                    {userName ? userName.charAt(0).toUpperCase() : "U"}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>{userName || "User"}</div>
                                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{userEmail}</div>
                                </div>
                            </div>
                            <div className="mobile-nav-links" style={{ marginTop: 10 }}>
                                <Link href="/dashboard" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>
                                    <FiHome size={18} /> <span>Dashboard</span>
                                </Link>
                                <Link href="/workspace" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>
                                    <FiPlus size={18} /> <span>My Documents</span>
                                </Link>
                                <Link href={`/${userName || "alexrivera"}`} className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>
                                    <FiUser size={18} /> <span>Public Profile</span>
                                </Link>
                                <button className="mobile-nav-item" style={{ color: "#ef4444", width: "100%", textAlign: "left", background: "none", border: "none" }} onClick={handleSignOut}>
                                    <FiLogOut size={18} /> <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mobile-auth-actions">
                            <button
                                className="mobile-auth-btn signin"
                                onClick={handleSignIn}
                            >
                                Sign In
                            </button>
                            <button
                                className="mobile-auth-btn signup"
                                onClick={() => { router.push("/Auth?mode=signup"); setMobileMenuOpen(false); }}
                            >
                                Get Started Free
                            </button>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
