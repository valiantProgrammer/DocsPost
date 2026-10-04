"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import AnalyticsDashboard from "@/app/components/AnalyticsDashboard";
import "../dashboard/dashboard.css";

export default function AnalyticsPage() {
    const [userEmail, setUserEmail] = useState("");

    useEffect(() => {
        const savedEmail = localStorage.getItem("docspost-email") || "";
        setUserEmail(savedEmail);
    }, []);

    return (
        <div className="dashboard-container">
            <Header />
            <DashboardSidebar activeTab="analytics" />
            <main className="dashboard-main analytics-mode">
                <AnalyticsDashboard userEmail={userEmail} />
            </main>
        </div>
    );
}
