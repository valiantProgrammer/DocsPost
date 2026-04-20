"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PostGoogleLogin() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const nextPath = searchParams.get("next") || "/";
    const [status, setStatus] = useState("Initializing...");

    useEffect(() => {
        const handlePostLogin = async () => {
            try {
                // Read cookies set by Google OAuth callback
                const getCookie = (name) => {
                    const value = `; ${document.cookie}`;
                    const parts = value.split(`; ${name}=`);
                    if (parts.length === 2) return parts.pop().split(";").shift();
                    return null;
                };

                const docspostAuth = getCookie("docspost-auth");
                const docspostUsername = getCookie("docspost-username");
                const docspostEmail = getCookie("docspost-email");
                const accessToken = getCookie("accessToken");

                console.log("🔍 Post-Login Debug Info:");
                console.log("  Auth Status:", docspostAuth);
                console.log("  Username:", docspostUsername);
                console.log("  Email:", docspostEmail);
                console.log("  AccessToken Present:", !!accessToken);
                console.log("  Next Path:", nextPath);

                if (docspostAuth === "signed-in") {
                    setStatus("Setting up your account...");

                    // Set localStorage from cookies
                    localStorage.setItem("docspost-auth", "signed-in");
                    
                    if (docspostUsername) {
                        try {
                            const decodedUsername = decodeURIComponent(docspostUsername);
                            localStorage.setItem("docspost-username", decodedUsername);
                            console.log("✓ Username saved:", decodedUsername);
                        } catch (err) {
                            localStorage.setItem("docspost-username", docspostUsername);
                            console.log("⚠ Username saved (no decode needed):", docspostUsername);
                        }
                    }
                    
                    if (docspostEmail) {
                        try {
                            const decodedEmail = decodeURIComponent(docspostEmail);
                            localStorage.setItem("docspost-email", decodedEmail);
                            console.log("✓ Email saved:", decodedEmail);
                        } catch (err) {
                            localStorage.setItem("docspost-email", docspostEmail);
                            console.log("⚠ Email saved (no decode needed):", docspostEmail);
                        }
                    }

                    console.log("✓ Google OAuth login successful!");
                    console.log("🎉 Redirecting to:", nextPath);

                    // Give a moment to ensure localStorage is written
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    setStatus("Redirecting...");
                    router.push(nextPath);
                } else {
                    console.error("❌ Authentication failed: docspost-auth cookie not set");
                    setStatus("Authentication failed. Please try again.");
                    
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    router.push("/Auth?mode=signin&error=google_auth_failed");
                }
            } catch (error) {
                console.error("❌ Post-login error:", error);
                setStatus("An error occurred. Please try again.");
                
                await new Promise(resolve => setTimeout(resolve, 2000));
                router.push("/Auth?mode=signin&error=google_auth_failed");
            }
        };

        handlePostLogin();
    }, [router, nextPath]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-6"></div>
                <p className="text-white text-lg font-medium">{status}</p>
                <p className="text-white/60 text-sm mt-2">This should only take a moment...</p>
            </div>
        </div>
    );
}
