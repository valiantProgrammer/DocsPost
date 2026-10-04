"use client";

import Header from "@/app/components/Header";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import UserWorkspace from "@/app/components/UserWorkspace";
import "@/app/dashboard/dashboard.css";

export default function DraftsWorkspacePage() {
    const userEmail = typeof window === "undefined" ? "" : localStorage.getItem("docspost-email") || "";

    return (
        <div className="dashboard-container">
            <Header />
            <DashboardSidebar activeTab="drafts" />
            <main className="dashboard-main">
                <UserWorkspace
                    userEmail={userEmail}
                    initialTab="drafts"
                    pageTitle="Draft Documents"
                    pageDescription="Work in progress documents ready to be edited, finalized, and published."
                />
            </main>
        </div>
    );
}
