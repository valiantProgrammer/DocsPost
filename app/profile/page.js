"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import ProfileView from "@/app/components/ProfileView";
import "../dashboard/dashboard.css";

export default function ProfilePage() {
    const [userEmail, setUserEmail] = useState("");
    const [userName, setUserName] = useState("");
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const savedEmail = localStorage.getItem("docspost-email") || "";
        const savedName = localStorage.getItem("docspost-username") || "Rupayan Dey";
        setUserEmail(savedEmail);
        setUserName(savedName);

        if (savedEmail) {
            fetch(`/api/profile/get-profile?email=${encodeURIComponent(savedEmail)}`)
                .then(r => r.ok ? r.json() : null)
                .then(data => {
                    if (data?.user) setUserData(data.user);
                })
                .catch(err => console.error(err));
        }
    }, []);

    return (
        <div className="dashboard-container">
            <Header />
            <DashboardSidebar activeTab="profile" />
            <main className="dashboard-main">
                <ProfileView userData={userData} userEmail={userEmail} userName={userName} />
            </main>
        </div>
    );
}
