import { MongoClient, ObjectId } from "mongodb";
import { verifyAccessToken } from "./auth";

/**
 * Validates the user session from cookies or Authorization header.
 * Supports JWT access/refresh tokens and session cookies.
 * Returns { user, error, status }
 */
export async function getSessionUser(request) {
    try {
        let userId = null;
        let userEmail = null;

        // 1. Check Authorization Bearer header
        const authHeader = request.headers.get("authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.substring(7);
            const decoded = verifyAccessToken(token);
            if (decoded?.userId) {
                userId = decoded.userId;
            }
        }

        // 2. Check cookies
        const cookieHeader = request.headers.get("cookie") || "";
        const cookies = Object.fromEntries(
            cookieHeader.split("; ").filter(Boolean).map(c => {
                const [k, ...v] = c.split("=");
                return [k, decodeURIComponent(v.join("="))];
            })
        );

        if (!userId && cookies.accessToken) {
            const decoded = verifyAccessToken(cookies.accessToken);
            if (decoded?.userId) {
                userId = decoded.userId;
            }
        }

        // Check docspost-email cookie or docspost-auth
        if (!userId && cookies["docspost-email"]) {
            userEmail = cookies["docspost-email"].toLowerCase();
        }

        if (!process.env.MONGODB_URI) {
            return { error: "Database not configured", status: 500 };
        }

        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db("DocsPost");
        const users = db.collection("users");

        let user = null;
        if (userId) {
            try {
                user = await users.findOne({ _id: new ObjectId(userId) });
            } catch (e) {
                // invalid ObjectId, try email or string id
                user = await users.findOne({ email: userId });
            }
        } else if (userEmail) {
            user = await users.findOne({ email: userEmail });
        } else if (cookies.refreshToken) {
            user = await users.findOne({ refreshToken: cookies.refreshToken });
        }

        await client.close();

        if (!user) {
            return { error: "Unauthorized: Invalid or missing session", status: 401 };
        }

        return {
            user: {
                _id: user._id.toString(),
                email: user.email,
                username: user.username || user.email.split("@")[0],
                name: user.name || user.username || "Creator",
                role: user.role || "Creator",
                profilePicture: user.profilePicture || null,
            },
            status: 200,
        };
    } catch (err) {
        console.error("Session verification error:", err);
        return { error: "Internal authentication error", status: 500 };
    }
}
