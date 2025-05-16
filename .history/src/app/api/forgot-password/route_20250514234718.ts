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
    const emailSent = await sendMail(
      email,
      "Your New Password",
      `Your new password is: ${newPassword}\n\nPlease login with this password and change it immediately for security reasons.`
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
    // Log stack trace if available
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}