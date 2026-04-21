"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/providers/ThemeProvider";
import {
    FiHome,
    FiUser,
    FiBriefcase,
    FiSettings,
    FiMenu,
    FiX,
    FiLogOut,
    FiChevronRight,
    FiBarChart2
} from "react-icons/fi";
import "./DashboardSidebar.css";

export default function DashboardSidebar({ activeTab, onTabChange }) {
    const [isOpen, setIsOpen] = useState(true);
    const { isDark } = useTheme(); // Subscribe to theme changes for re-renders
    const router = useRouter();

    const menuItems = [
        { id: "analytics", label: "Dashboard", icon: FiBarChart2 },
        { id: "profile", label: "Profile", icon: FiUser },
        { id: "workspace", label: "Workspace", icon: FiBriefcase },
        { id: "settings", label: "Settings", icon: FiSettings },
    ];

    const handleLogout = () => {
        localStorage.removeItem("docspost-auth");
        localStorage.removeItem("docspost-username");
        localStorage.removeItem("docspost-email");
        document.cookie = "docspost-auth=; path=/; max-age=0; samesite=lax";
        router.push("/Auth?mode=signin");
    };

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className="sidebar-toggle lg:hidden"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle sidebar"
            >
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${isOpen ? "open" : ""}`}>
                <nav className="sidebar-nav">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                                onClick={() => {
                                    if (onTabChange) {
                                        onTabChange(item.id);
                                    } else {
                                        const routeMap = {
                                            analytics: "/dashboard",
                                            profile: "/dashboard",
                                            workspace: "/workspace",
                                            settings: "/settings",
                                        };
                                        router.push(routeMap[item.id] || "/dashboard");
                                    }
                                    setIsOpen(false); // Close on mobile
                                }}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                                {activeTab === item.id && <FiChevronRight size={18} />}
                            </button>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <button
                        className="nav-item logout-item"
                        onClick={handleLogout}
                    >
                        <FiLogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="sidebar-overlay lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
