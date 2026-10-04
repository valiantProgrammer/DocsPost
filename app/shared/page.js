"use client";

import Header from "@/app/components/Header";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import UserWorkspace from "@/app/components/UserWorkspace";
import "@/app/dashboard/dashboard.css";

export default function SharedPage() {
    const userEmail = typeof window === "undefined" ? "" : localStorage.getItem("docspost-email") || "";

    return (
        <div className="dashboard-container">
            <Header />
            <DashboardSidebar activeTab="shared" />
            <main className="dashboard-main">
                <UserWorkspace
                    userEmail={userEmail}
                    initialTab="shared"
                    pageTitle="Shared Documents"
                    pageDescription="Documents shared with you or your team members with active permissions."
                />
            </main>
        </div>
    );
}
