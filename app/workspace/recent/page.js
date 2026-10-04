"use client";

import Header from "@/app/components/Header";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import UserWorkspace from "@/app/components/UserWorkspace";
import "@/app/dashboard/dashboard.css";

export default function RecentWorkspacePage() {
    const userEmail = typeof window === "undefined" ? "" : localStorage.getItem("docspost-email") || "";

    return (
        <div className="dashboard-container">
            <Header />
            <DashboardSidebar activeTab="recent" />
            <main className="dashboard-main">
                <UserWorkspace
                    userEmail={userEmail}
                    initialTab="recent"
                    pageTitle="Recent Documents"
                    pageDescription="Pick up right where you left off. Documents sorted by recent activity."
                />
            </main>
        </div>
    );
}
