import clientPromise from "@/lib/db";
import { generateAccessToken, generateRefreshToken } from "@/lib/auth";
import { sanitizeUser } from "@/lib/utils";
import { NextResponse } from "next/server";

async function exchangeCodeForTokens(code, redirectUri) {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
        }),
    });

    if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(`Google token exchange failed: ${errorText}`);
    }

    return tokenResponse.json();
}

async function fetchGoogleProfile(accessToken) {
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        throw new Error(`Google profile fetch failed: ${errorText}`);
    }

    return profileResponse.json();
}

export async function GET(request) {
    try {
        const code = request.nextUrl.searchParams.get("code");
        const nextPath = request.nextUrl.searchParams.get("state") || "/";
        const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${request.nextUrl.origin}/api/auth/google/callback`;

        if (!code) {
            return NextResponse.redirect(new URL("/Auth?mode=signin&error=google_missing_code", request.url));
        }

        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            return NextResponse.redirect(new URL("/Auth?mode=signin&error=google_not_configured", request.url));
        }

        const tokens = await exchangeCodeForTokens(code, redirectUri);
        const profile = await fetchGoogleProfile(tokens.access_token);

        const client = await clientPromise;
        const db = client.db();
        const users = db.collection("users");

        const email = (profile.email || "").toLowerCase();
        if (!email) {
            return NextResponse.redirect(new URL("/Auth?mode=signin&error=google_email_missing", request.url));
        }

        const now = new Date();
        const existingUser = await users.findOne({ email });

        // Generate a unique username from Google profile name
        let baseUsername = profile.name 
            ? profile.name.toLowerCase().replace(/[^a-z0-9]/g, "")
            : email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
        
        // Ensure username is 3-20 characters
        if (baseUsername.length < 3) {
            baseUsername = baseUsername + Math.random().toString(36).substring(2, 5);
        } else if (baseUsername.length > 20) {
            baseUsername = baseUsername.substring(0, 20);
        }

        let finalUsername = baseUsername;
        let counter = 1;

        // Check if username is unique, add numbers if needed
        if (!existingUser) {
            while (await users.findOne({ 
                username: { $regex: `^${finalUsername}$`, $options: "i" } 
            })) {
                finalUsername = baseUsername + counter;
                counter++;
            }
        } else {
            // For existing users, keep their current username
            finalUsername = existingUser.username || baseUsername;
        }

        const googleUserData = {
            email,
            username: finalUsername,
            name: profile.name || existingUser?.name || profile.given_name || "",
            googleId: profile.id,
            provider: "google",
            picture: profile.picture || "",
            verified: true,
            updatedAt: now,
            lastLoginAt: now,
        };

        let savedUser;

        if (existingUser) {
            await users.updateOne(
                { _id: existingUser._id },
                {
                    $set: googleUserData,
                    $unset: { password: "", otp: "", otpExpiresAt: "", otpAttempts: "" },
                }
            );
            savedUser = await users.findOne({ _id: existingUser._id });
        } else {
            const insertResult = await users.insertOne({
                ...googleUserData,
                createdAt: now,
            });
            savedUser = await users.findOne({ _id: insertResult.insertedId });
        }

        const userId = savedUser._id.toString();
        const accessToken = await generateAccessToken(userId);
        const refreshToken = generateRefreshToken(userId);

        await users.updateOne(
            { _id: savedUser._id },
            {
                $set: {
                    refreshToken,
                    updatedAt: now,
                    lastLoginAt: now,
                },
            }
        );

        // Redirect directly to destination - Header component will sync cookies to localStorage
        const response = NextResponse.redirect(new URL(nextPath, request.url));
        
        const cookieOptions = {
            path: "/",
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        };

        response.cookies.set("accessToken", `Bearer ${accessToken}`, cookieOptions);
        response.cookies.set("refreshToken", refreshToken, cookieOptions);
        response.cookies.set("docspost-auth", "signed-in", cookieOptions);
        // Store username and email in cookies for client to read
        response.cookies.set("docspost-username", savedUser.username || savedUser.email.split("@")[0], {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });
        response.cookies.set("docspost-email", savedUser.email, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return response;
    } catch (error) {
        console.error("Google auth callback error:", error);
        return NextResponse.redirect(new URL("/Auth?mode=signin&error=google_auth_failed", request.url));
    }
}
