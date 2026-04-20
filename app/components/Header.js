"use client"
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { IoLogoDribbble } from "react-icons/io";
import { GoBell } from "react-icons/go";
import { PiSunBold } from "react-icons/pi";
import { FaMoon } from "react-icons/fa";
import { RiArrowDropDownLine } from "react-icons/ri";
import { CiSearch } from "react-icons/ci";
import { FiUser, FiBookmark, FiSettings, FiLogOut, FiAward, FiHome } from "react-icons/fi";
import { syncAuthDataFromCookies } from "@/lib/authUtils";

export default function Header({ isDark, toggleTheme }) {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);
    const dropdownRef = useRef(null);
    const router = useRouter();
    const topLinks = ["Courses", "Tutorials", "Practice", "Jobs"];

    useEffect(() => {
        // Sync auth data from cookies (important for OAuth callbacks like Google)
        syncAuthDataFromCookies();

        const savedAuthState = localStorage.getItem("docspost-auth");
        const hasSignedInCookie = document.cookie.includes("docspost-auth=signed-in");
        const savedUserName = localStorage.getItem("docspost-username");
        const savedUserEmail = localStorage.getItem("docspost-email");

        setIsSignedIn(savedAuthState === "signed-in" || hasSignedInCookie);

        if (savedUserName) {
            setUserName(savedUserName);
        }
        if (savedUserEmail) {
            setUserEmail(savedUserEmail);
        }

        // Fetch profile picture from API
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

    // Listen for profile picture updates
    useEffect(() => {
        const handleStorageChange = async () => {
            const savedUserEmail = localStorage.getItem("docspost-email");
            if (savedUserEmail) {
                try {
                    const response = await fetch(
                        `/api/profile/get-profile?email=${encodeURIComponent(savedUserEmail)}`
                    );
                    if (response.ok) {
                        const data = await response.json();
                        setProfilePicture(data.user.profilePicture);
                    }
                } catch (error) {
                    console.error("Error refreshing profile picture:", error);
                }
            }
        };

        // Listen for custom storage change event
        window.addEventListener("profilePictureUpdated", handleStorageChange);

        return () => {
            window.removeEventListener("profilePictureUpdated", handleStorageChange);
        };
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
        }
    };

    const handleSignIn = () => {
        router.push("/Auth?mode=signin");
    };

    const handleProfileClick = (path) => {
        // For profile, navigate to username route instead of /profile
        if (path === "/profile") {
            router.push(`/${userName}`);
        } else {
            router.push(path);
        }
        setIsDropdownOpen(false);
    };

    const handleSearchClick = () => {
        router.push("/search");
    };

    const handleSearchInput = (e) => {
        if (e.key === "Enter" && e.target.value.trim()) {
            router.push(`/search?q=${encodeURIComponent(e.target.value.trim())}`);
        }
    };

    return (
        <header className="main-header">
            <div className="main-header-inner">
                <div className="brand-and-search">
                    <a className="brand-mark" href="/" aria-label="DocsPost Home">
                        <IoLogoDribbble size={40} />
                        <span className="brand-word text-[1rem] xs:text-[20px]">DocsPost</span>
                    </a>

                    <label className="header-search hidden sm:inline-flex" aria-label="Search courses">
                        <svg viewBox="0 0 24 24" className="hidden sm:flex" aria-hidden="true">
                            <path d="M10.5 3.75a6.75 6.75 0 1 0 4.196 12.037l4.759 4.758a.75.75 0 1 0 1.06-1.06l-4.758-4.76A6.75 6.75 0 0 0 10.5 3.75Zm0 1.5a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5Z" />
                        </svg>
                        <input
                            type="search"
                            className="text-[12px] hidden sm:flex"
                            placeholder="Search docs..."
                            onKeyDown={handleSearchInput}
                        />
                    </label>
                </div>

                <nav className="primary-nav hidden sm:flex" aria-label="Primary">
                    {topLinks.map((item) => (
                        <a className="inline-flex" key={item} href="#">
                            {item}
                            <RiArrowDropDownLine size={30} />
                        </a>
                    ))}
                </nav>

                <div className="header-actions">
                    <button
                        type="button"
                        className="circle-action sm:hidden grid place-items-center"
                        aria-label="Search"
                        onClick={handleSearchClick}
                    >
                        <CiSearch />
                    </button>
                    <button type="button" className="circle-action grid place-items-center" aria-label="Theme" onClick={toggleTheme}>
                        {isDark ? <PiSunBold size={20} /> : <FaMoon size={18} />}
                    </button>
                    <button type="button" className="circle-action grid place-items-center" aria-label="Notifications">
                        <GoBell />
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
                                        userName.charAt(0).toUpperCase()
                                    )}
                                </div>
                            </button>

                            {isDropdownOpen && (
                                <div className="profile-dropdown">
                                    <div className="dropdown-header">
                                        <p className="user-name">{userName}</p>
                                        <p className="user-email">Profile</p>
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
                                            onClick={() => handleProfileClick("/profile")}
                                        >
                                            <FiUser size={18} />
                                            <span>My Profile</span>
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
                        <button
                            type="button"
                            className="sign-in hidden sm:flex"
                            onClick={handleSignIn}
                            aria-label="Sign in"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
