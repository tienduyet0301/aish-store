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
    const { email } = await request.json();
    console.log("Received email:", email);

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({ email });
    console.log("Found user:", user ? "Yes" : "No");

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    // Tạo mật khẩu mới
    const newPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log("Generated new password");

    // Cập nhật mật khẩu trong database
    await db.collection("users").updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );
    console.log("Password updated in database");

    // Gửi email với mật khẩu mới
    const emailSent = await sendMail(
      email,
      "Your New Password",
      `Your new password is: ${newPassword}\n\nPlease login with this password and change it immediately for security reasons.`
    );

    if (!emailSent) {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "New password has been sent to your email"
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}