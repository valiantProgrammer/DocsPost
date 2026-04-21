"use client";

import Header from "@/app/components/Header";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import UserWorkspace from "@/app/components/UserWorkspace";
import "../dashboard/dashboard.css";

export default function WorkspacePage() {
    const userEmail = typeof window === "undefined" ? "" : localStorage.getItem("docspost-email") || "";

    return (
        <div className="dashboard-container">
            <Header />
            <DashboardSidebar activeTab="workspace" />
            <main className="dashboard-main">
                <UserWorkspace userEmail={userEmail} />
            </main>
        </div>
    );
}
