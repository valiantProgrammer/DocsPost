import { NextResponse } from "next/server";

export async function GET(request) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${request.nextUrl.origin}/api/auth/google/callback`;
    const nextPath = request.nextUrl.searchParams.get("next") || "/";

    console.log(" Google OAuth Start:");
    console.log("  Client ID:", clientId);
    console.log("  Redirect URI:", redirectUri);

    if (!clientId) {
        return NextResponse.json(
            { message: "Google auth is not configured. Set GOOGLE_CLIENT_ID." },
            { status: 500 }
        );
    }

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "openid email profile");
    authUrl.searchParams.set("prompt", "select_account");
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("state", nextPath);

    const fullAuthUrl = authUrl.toString();
    console.log("📍 Full Auth URL:", fullAuthUrl);
    console.log("🔗 Redirect URI (raw):", redirectUri);
    console.log("🔗 Redirect URI (length):", redirectUri.length);
    console.log("🔗 Redirect URI (chars):", redirectUri.split('').map(c => `${c}(${c.charCodeAt(0)})`).join(', '));

    return NextResponse.redirect(fullAuthUrl);
}
