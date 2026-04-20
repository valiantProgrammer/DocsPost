"use client"
import Header from "@/app/components/Header";
import { useTheme } from "@/app/providers/ThemeProvider";

export default function Settings() {
    const { isDark } = useTheme();

    return (
        <main className="learning-page" data-theme={isDark ? "dark" : "light"}>
            <Header />

            <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
                <h1>Settings</h1>
                <p>Your account settings will go here.</p>
            </div>
        </main>
    );
}
