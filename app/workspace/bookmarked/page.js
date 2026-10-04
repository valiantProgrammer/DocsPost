"use client";

import Header from "@/app/components/Header";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import UserWorkspace from "@/app/components/UserWorkspace";
import "@/app/dashboard/dashboard.css";

export default function BookmarkedWorkspacePage() {
    const userEmail = typeof window === "undefined" ? "" : localStorage.getItem("docspost-email") || "";

    return (
        <div className="dashboard-container">
            <Header />
            <DashboardSidebar activeTab="bookmarked" />
            <main className="dashboard-main">
                <UserWorkspace
                    userEmail={userEmail}
                    initialTab="bookmarked"
                    pageTitle="Bookmarked Documents"
                    pageDescription="Quick access to your curated guides, references, and saved tutorials."
                />
            </main>
        </div>
    );
}
