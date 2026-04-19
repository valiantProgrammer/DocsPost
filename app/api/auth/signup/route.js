import { hashPassword } from "@/lib/auth";
import clientPromise from "@/lib/db"; // Using your native MongoDB driver connection
import { generateOTP } from "@/lib/utils";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

// Nodemailer transporter setup remains the same
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function POST(request) {
  try {
    const { email, username, password } = await request.json();

    // --- 1. Input Validation ---
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: "Email, username, and password are required" },
        { status: 400 }
      );
    }

    // --- 2. Connect to Database using native driver ---
    const client = await clientPromise;
    const db = client.db();

    // --- 3. Check for Existing Verified User ---
    // Check if a user with this email is already in the "users" collection.
    const existingVerifiedUser = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (existingVerifiedUser) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 }
      );
    }

    // --- 4. Hash Password and Generate OTP ---
    const hashedPassword = await hashPassword(password);
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes expiry

    // --- 5. Create or Update Temporary User with OTP ---
    // Use updateOne with upsert:true to create or update the document in the "tempusers" collection.
    await db.collection("tempusers").updateOne(
      { email: email.toLowerCase() }, // Filter to find the document
      {
        $set: { // Fields to set or update
          username,
          password: hashedPassword,
          otp: otpCode,
          otpExpiresAt,
          otpAttempts: 0,
          verified: false,
        }
      },
      { upsert: true } // Option to create the document if it doesn"t exist
    );

    // --- 6. Send OTP Email ---
    const mailOptions = {
      from: `"${process.env.APP_NAME || "Your App"}" <${process.env.EMAIL_FROM || process.env.SMTP_USERNAME}>`,
      to: email,
      subject: "Verify Your Email Address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 2rem; border-radius: 0.5rem;">
          <h2 style="color: #1e293b; text-align: center;">Email Verification</h2>
          <p>Hello ${username},</p>
          <p>Thank you for registering. Please use the following verification code to complete your signup:</p>
          <div style="background: #f1f5f9; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="margin: 0; color: #2563eb; letter-spacing: 5px; font-size: 2.5rem;">${otpCode}</h1>
          </div>
          <p>This code is valid for 30 minutes.</p>
          <p style="color: #64748b; font-size: 0.9rem;">If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // --- 7. Send Success Response ---
    return NextResponse.json(
      {
        success: true,
        message: "A verification OTP has been sent to your email address.",
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      {
        error: "Registration failed. Please try again later.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}