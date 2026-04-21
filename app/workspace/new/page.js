"use client";

import Header from "@/app/components/Header";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import WorkspaceEditor from "@/app/components/WorkspaceEditor";
import "../../dashboard/dashboard.css";

export default function NewWorkspaceDocumentPage() {
    const userEmail = typeof window === "undefined" ? "" : localStorage.getItem("docspost-email") || "";

    return (
        <div className="dashboard-container">
            <Header />
            <DashboardSidebar activeTab="workspace" />
            <main className="dashboard-main">
                <WorkspaceEditor userEmail={userEmail} />
            </main>
        </div>
    );
}
