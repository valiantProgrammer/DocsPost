import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * Initialize database indexes for data integrity
 * This should be called once during application setup
 * Ensures username uniqueness at the database level
 */
export async function POST(request) {
  try {
    // Verify this is an internal call or has proper authorization
    const authHeader = request.headers.get("authorization");
    const secretKey = process.env.DB_INIT_SECRET || "dev-secret";

    if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db("DocsPost");

    // Create unique index on username in users collection (case-insensitive)
    const usersCollection = db.collection("users");
    await usersCollection.createIndex(
      { username: 1 },
      {
        unique: true,
        sparse: true, // Allow null values
        collation: { locale: "en", strength: 2 } // Case-insensitive
      }
    );

    // Create unique index on email in users collection (case-insensitive)
    await usersCollection.createIndex(
      { email: 1 },
      {
        unique: true,
        sparse: true,
        collation: { locale: "en", strength: 2 }
      }
    );

    // Create index on username in tempusers collection (case-insensitive)
    const tempUsersCollection = db.collection("tempusers");
    await tempUsersCollection.createIndex(
      { username: 1 },
      {
        unique: true,
        sparse: true,
        collation: { locale: "en", strength: 2 }
      }
    );

    // Create index on email in tempusers collection
    await tempUsersCollection.createIndex(
      { email: 1 },
      {
        unique: true,
        sparse: true,
        collation: { locale: "en", strength: 2 }
      }
    );

    // Create TTL index on otpExpiresAt to auto-delete expired temp users after 1 hour
    await tempUsersCollection.createIndex(
      { otpExpiresAt: 1 },
      { expireAfterSeconds: 0 }
    );

    // Create indexes for analytics_optimized collection (sliding window analytics)
    const analyticsCollection = db.collection("analytics_optimized");

    // Primary index: lookup by user email
    await analyticsCollection.createIndex({ userEmail: 1 });

    // Secondary index: for checking recent activity
    await analyticsCollection.createIndex({ updatedAt: -1 });

    // Optional: for analytics reports by views
    await analyticsCollection.createIndex({ "summary.allTimeViews": -1 });

    console.log("✓ Database indexes created successfully");

    return NextResponse.json(
      {
        success: true,
        message: "Database indexes initialized successfully",
        indexes: [
          "users.username (unique, case-insensitive)",
          "users.email (unique, case-insensitive)",
          "tempusers.username (unique, case-insensitive)",
          "tempusers.email (unique, case-insensitive)",
          "tempusers.otpExpiresAt (TTL index)",
          "analytics_optimized.userEmail (lookup)",
          "analytics_optimized.updatedAt (recent activity)",
          "analytics_optimized.summary.allTimeViews (reports)"
        ]
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Database initialization error:", error);

    // Check if error is about duplicate key (index already exists or constraint violation)
    if (error.code === 48 || error.message?.includes("already exists")) {
      return NextResponse.json(
        {
          success: true,
          message: "Indexes already exist or were created previously",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to initialize database indexes",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check current indexes
 */
export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("DocsPost");

    const usersIndexes = await db.collection("users").listIndexes().toArray();
    const tempUsersIndexes = await db.collection("tempusers").listIndexes().toArray();

    return NextResponse.json(
      {
        success: true,
        users: {
          indexes: usersIndexes.map(idx => ({
            name: idx.name,
            keys: idx.key,
            unique: idx.unique || false,
            sparse: idx.sparse || false
          }))
        },
        tempusers: {
          indexes: tempUsersIndexes.map(idx => ({
            name: idx.name,
            keys: idx.key,
            unique: idx.unique || false,
            sparse: idx.sparse || false
          }))
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching indexes:", error);
    return NextResponse.json(
      { error: "Failed to fetch indexes" },
      { status: 500 }
    );
  }
}
