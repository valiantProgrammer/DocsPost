"use client"
import Header from "@/app/components/Header";
import { useTheme } from "@/app/providers/ThemeProvider";

export default function Bookmarks() {
    const { isDark } = useTheme();

    return (
        <main className="learning-page" data-theme={isDark ? "dark" : "light"}>
            <Header />

            <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
                <h1>Saved Items</h1>
                <p>Your saved and bookmarked items will go here.</p>
            </div>
        </main>
    );
}
