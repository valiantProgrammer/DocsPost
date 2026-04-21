import clientPromise from "../../../lib/db";
import { generateOTP } from "../../../lib/utils";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function POST(request) {
  const client = await clientPromise;
  const session = client.startSession();
  
  try {
    const { email } = await request.json();
    
    // Validate input
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    let userId;
    let newOTP;

    await session.withTransaction(async () => {
      const db = client.db();

      // Check if user exists (case-insensitive)
      const user = await db.collection("users").findOne(
        { email: { $regex: new RegExp(`^${email}$`, "i") } },
        { session }
      );

      if (!user) {
        throw new Error("User not found");
      }

      // Check if user is already verified
      if (user.verified) {
        throw new Error("Email already verified");
      }

      userId = user._id;

      // Check for existing active OTP and rate limit
      const existingOTP = await db.collection("otps").findOne(
        { 
          userId: user._id,
          expiresAt: { $gt: new Date() },
          used: { $ne: true }
        },
        { session }
      );

      const OTP_COOLDOWN = 1 * 60 * 1000; // 1 minute cooldown
      if (existingOTP) {
        if (new Date() - existingOTP.createdAt < OTP_COOLDOWN) {
          const retryAfter = Math.ceil((existingOTP.createdAt.getTime() + OTP_COOLDOWN - Date.now()) / 1000);
          throw new Error(`Please wait ${retryAfter} seconds before requesting a new OTP`);
        }
        
        // Remove existing OTP before creating new one
        await db.collection("otps").deleteOne(
          { _id: existingOTP._id },
          { session }
        );
      }

      // Generate new OTP
      newOTP = generateOTP();
      const otpExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes expiry

      // Create new OTP record (only one will exist per user)
      await db.collection("otps").insertOne({
        email: email.toLowerCase(),
        otp: newOTP,
        userId,
        expiresAt: otpExpiry,
        createdAt: new Date(),
        used: false
      }, { session });
    });

    // Send OTP email
    const mailOptions = {
      from: `"${process.env.APP_NAME || "Your App"}" <${process.env.EMAIL_FROM || process.env.SMTP_USERNAME}>`,
      to: email,
      subject: "Your Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Verification Code</h2>
          <p>Your one-time verification code is:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="margin: 0; color: #2563eb; letter-spacing: 5px; font-size: 2rem;">${newOTP}</h1>
          </div>
          <p>This code will expire in 30 minutes.</p>
          <p>If you didn"t request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { 
        success: true,
        message: "OTP sent successfully",
        userId
      },
      { status: 200 }
    );

  } catch (error) {
    // Handle transaction errors
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error("OTP generation error:", error);
    
    // Custom error responses
    const statusMap = {
      "User not found": 404,
      "Email already verified": 400,
      "Please wait": 429
    };

    const status = statusMap[error.message.split(" ")[0]] || 500;
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Failed to generate OTP",
        ...(error.message.includes("Please wait") && {
          retryAfter: parseInt(error.message.split(" ")[2])
        })
      },
      { status }
    );
  } finally {
    await session.endSession();
  }
}