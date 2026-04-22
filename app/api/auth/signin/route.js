// import { verifyPassword, generateAccessToken, generateRefreshToken } from "../../../lib/auth";
// import clientPromise from "../../../lib/db";
// import { sanitizeUser } from "../../../lib/utils";
// import { NextResponse } from "next/server";

// export async function POST(request) {
//   const client = await clientPromise;

//   try {
//     const { email, password } = await request.json();

//     // Validate input
//     if (!email || !password) {
//       return NextResponse.json(
//         { error: "Email and password are required" },
//         { status: 400 }
//       );
//     }

//     const db = client.db();

//     // Find user (case-insensitive)
//     const user = await db.collection("users").findOne({ 
//       email: { $regex: new RegExp(`^${email}$`, "i") }
//     });

//     if (!user) {
//       return NextResponse.json(
//         { error: "Invalid credentials" }, // Generic message for security
//         { status: 401 }
//       );
//     }

//     // Verify password
//     const isValidPassword = await verifyPassword(password, user.password);
//     if (!isValidPassword) {
//       return NextResponse.json(
//         { error: "Invalid credentials" }, // Same message as above
//         { status: 401 }
//       );
//     }

//     // Check if user is verified
//     if (!user.verified) {
//       return NextResponse.json(
//         { 
//           error: "Please verify your email first",
//           code: "EMAIL_NOT_VERIFIED" // Add error code for client-side handling
//         },
//         { status: 403 }
//       );
//     }

//     // Generate tokens
//     const accessToken = generateAccessToken(user._id.toString());
//     const refreshToken = generateRefreshToken(user._id.toString());

//     // Update user with refresh token
//     await db.collection("users").updateOne(
//       { _id: user._id },
//       { 
//         $set: { 
//           refreshToken, 
//           updatedAt: new Date(),
//           lastLoginAt: new Date() // Track last login time
//         } 
//       }
//     );

//     // Create response
//     const response = NextResponse.json(
//       { 
//         user: sanitizeUser(user),
//         accessToken
//         // Don"t return refreshToken in body - it"s in cookies
//       },
//       { status: 200 }
//     );

//     // Set refresh token as secure HTTP-only cookie
//     response.cookies.set("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       path: "/",
//       maxAge: 7 * 24 * 60 * 60, // 7 days
//       sameSite: "strict"
//     });

//     return response;

//   } catch (error) {
//     console.error("Sign-in error:", error);
//     return NextResponse.json(
//       { 
//         error: "Authentication failed",
//         details: process.env.NODE_ENV === "development" ? error.message : undefined
//       },
//       { status: 500 }
//     );
//   }
// }

import { verifyPassword, generateAccessToken, generateRefreshToken } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { sanitizeUser } from "@/lib/utils";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const client = await clientPromise;
    const db = client.db();

    // Find user by email or username
    const user = await db.collection("users").findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: { $regex: `^${email}$`, $options: "i" } }
      ]
    });
    if (!user) {
      return Response.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return Response.json(
        { message: "Invalid credentials" },
        { status: 402 }
      );
    }

    // Check if user is verified
    if (!user.verified) {
      return Response.json(
        { message: "Please verify your email first" },
        { status: 403 }
      );
    }

    // Generate tokens
    const accessToken = await generateAccessToken(user._id.toString());
    console.log("starting : " + accessToken + " : ending");
    const refreshToken = generateRefreshToken(user._id.toString());

    // Update user with refresh token
    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { refreshToken, updatedAt: new Date() } }
    );

    // Return user data without password
    const userData = sanitizeUser(user);

    return Response.json(
      {
        user: userData,
        accessToken,
        refreshToken
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}