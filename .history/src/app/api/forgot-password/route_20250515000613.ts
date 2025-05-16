import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { sendMail } from "@/lib/mail";
import bcrypt from "bcryptjs";

function generateRandomPassword(length: number = 8) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

export async function POST(request: Request) {
  try {
    console.log("Starting forgot password process...");
    
    const { email } = await request.json();
    console.log("Received email:", email);

    if (!email) {
      console.log("Email is missing");
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    console.log("Connecting to database...");
    const { db } = await connectToDatabase();
    
    console.log("Finding user in database...");
    const user = await db.collection("users").findOne({ email });
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      console.log("No user found with email:", email);
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    // Tạo mật khẩu mới
    console.log("Generating new password...");
    const newPassword = generateRandomPassword();
    console.log("New password generated");
    
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log("Password hashed successfully");

    // Cập nhật mật khẩu trong database
    console.log("Updating password in database...");
    await db.collection("users").updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );
    console.log("Password updated in database");

    // Gửi email với mật khẩu mới
    console.log("Preparing to send email...");
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; margin-bottom: 10px;">Password Reset</h1>
          <p style="color: #64748b; font-size: 16px;">Your new password has been generated</p>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
          <p style="color: #1e293b; margin-bottom: 15px;">Here is your new password:</p>
          <div style="background-color: #e2e8f0; padding: 15px; border-radius: 4px; text-align: center;">
            <code style="font-size: 18px; font-weight: bold; color: #4f46e5;">${newPassword}</code>
          </div>
        </div>

        <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin-bottom: 30px;">
          <p style="color: #991b1b; margin: 0;">
            <strong>Important:</strong> For security reasons, please change your password immediately after logging in.
          </p>
        </div>

        <div style="text-align: center; color: #64748b; font-size: 14px;">
          <p>If you didn't request this password reset, please contact our support team immediately.</p>
          <p style="margin-top: 20px;">© 2024 Your Company. All rights reserved.</p>
        </div>
      </div>
    `;

    const emailSent = await sendMail(
      email,
      "Your New Password - Password Reset",
      `Your new password is: ${newPassword}\n\nPlease login with this password and change it immediately for security reasons.\n\nIf you didn't request this password reset, please contact our support team immediately.`
    );

    if (!emailSent) {
      console.log("Failed to send email");
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    console.log("Email sent successfully");
    return NextResponse.json({
      message: "New password has been sent to your email"
    });
  } catch (error) {
    console.error("Detailed error in forgot password:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}