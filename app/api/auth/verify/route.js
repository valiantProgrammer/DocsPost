import clientPromise from "../../../lib/db";
import { generateAccessToken, generateRefreshToken } from "../../../lib/auth";
import { sanitizeUser } from "../../../lib/utils";
import { NextResponse } from "next/server";

export async function POST(request) {
  const client = await clientPromise;
  const session = client.startSession();
  
  try {
    const { email, otp } = await request.json();
    
    // --- 1. Input Validation ---
    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const cleanOtp = otp.toString().trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      return NextResponse.json(
        { error: "OTP must be a 6-digit number" },
        { status: 400 }
      );
    }

    let newlyVerifiedUser;

    // --- 2. Start Transaction ---
    // This ensures that creating the new user and deleting the temp user happen together.
    await session.withTransaction(async () => {
      const db = client.db();

      // Find the temporary user with a valid, non-expired OTP
      const tempUser = await db.collection("tempusers").findOne({ 
        email: email.toLowerCase(),
        otp: cleanOtp,
        otpExpiresAt: { $gt: new Date() }
      }, { session });

      if (!tempUser) {
        // To prevent users from guessing if an email exists, we can check for other failure reasons.
        const existingTempUser = await db.collection("tempusers").findOne({ email: email.toLowerCase() });
        if (existingTempUser) {
            // Increment attempt counter if you want to implement rate limiting
            await db.collection("tempusers").updateOne({ _id: existingTempUser._id }, { $inc: { otpAttempts: 1 } });
        }
        throw new Error("Invalid or expired OTP");
      }

      // Check if user is already verified in the main "users" collection
      const alreadyExists = await db.collection("users").findOne({ email: tempUser.email }, { session });
      if (alreadyExists) {
        // Clean up the temp user record if the main user already exists
        await db.collection("tempusers").deleteOne({ _id: tempUser._id }, { session });
        throw new Error("User already verified");
      }

      // Create the final user object to be inserted
      const userToInsert = {
        email: tempUser.email,
        username: tempUser.username,
        password: tempUser.password, // The password is already hashed
        avatarUrl: tempUser.avatarUrl || null,
        verified: true,
        refreshToken: null,
        addresses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Insert the new user into the main "users" collection
      const insertResult = await db.collection("users").insertOne(userToInsert, { session });
      
      // The newly created user"s full document
      newlyVerifiedUser = { ...userToInsert, _id: insertResult.insertedId };

      // Delete the temporary user record
      await db.collection("tempusers").deleteOne({ _id: tempUser._id }, { session });
    });

    // --- 3. Generate Tokens (outside of transaction) ---
    if (!newlyVerifiedUser) {
      // This should not happen if the transaction is successful, but it"s a safe check
      throw new Error("User verification failed during finalization.");
    }

    const userId = newlyVerifiedUser._id.toString();
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    // Update the new user with their first refresh token
    await client.db().collection("users").updateOne(
      { _id: newlyVerifiedUser._id },
      { $set: { refreshToken, updatedAt: new Date() } }
    );
    
    // --- 4. Create Response and Set Cookie ---
    const response = NextResponse.json(
      { 
        success: true,
        user: sanitizeUser(newlyVerifiedUser),
        accessToken
      },
      { status: 200 }
    );

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: "strict"
    });

    return response;

  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error("Verification Error:", error);
    
    const statusMap = {
      "Invalid or expired OTP": 400,
      "User already verified": 409, // 409 Conflict
    };
    const status = statusMap[error.message] || 500;
    
    return NextResponse.json(
      { error: error.message || "Verification failed" },
      { status }
    );
  } finally {
    await session.endSession();
  }
}