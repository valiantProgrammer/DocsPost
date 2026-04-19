import crypto from "crypto";
import jwt from "jsonwebtoken";

// Hash password using bcrypt-like approach with crypto
export async function hashPassword(password) {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16).toString("hex");
        crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
            if (err) reject(err);
            const hash = salt + ":" + derivedKey.toString("hex");
            resolve(hash);
        });
    });
}

// Verify password
export async function verifyPassword(password, hash) {
    return new Promise((resolve, reject) => {
        const parts = hash.split(":");
        const salt = parts[0];
        const key = parts[1];
        crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
            if (err) reject(err);
            resolve(key === derivedKey.toString("hex"));
        });
    });
}

// Generate access token (short-lived)
export async function generateAccessToken(userId) {
    const token = jwt.sign(
        { userId },
        process.env.ACCESS_TOKEN_SECRET || "default_access_secret",
        { expiresIn: "1h" }
    );
    return token;
}

// Generate refresh token (long-lived)
export function generateRefreshToken(userId) {
    const token = jwt.sign(
        { userId },
        process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret",
        { expiresIn: "7d" }
    );
    return token;
}

// Verify access token
export function verifyAccessToken(token) {
    try {
        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET || "default_access_secret"
        );
        return decoded;
    } catch (error) {
        return null;
    }
}

// Verify refresh token
export function verifyRefreshToken(token) {
    try {
        const decoded = jwt.verify(
            token,
            process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret"
        );
        return decoded;
    } catch (error) {
        return null;
    }
}
