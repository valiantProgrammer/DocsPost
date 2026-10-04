"use client";

import Header from "@/app/components/Header";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import UserWorkspace from "@/app/components/UserWorkspace";
import "@/app/dashboard/dashboard.css";

export default function PublishedWorkspacePage() {
    const userEmail = typeof window === "undefined" ? "" : localStorage.getItem("docspost-email") || "";

    return (
        <div className="dashboard-container">
            <Header />
            <DashboardSidebar activeTab="published" />
            <main className="dashboard-main">
                <UserWorkspace
                    userEmail={userEmail}
                    initialTab="published"
                    pageTitle="Published Articles"
                    pageDescription="Live technical articles visible to your readers with metrics and sharing."
                />
            </main>
        </div>
    );
}
