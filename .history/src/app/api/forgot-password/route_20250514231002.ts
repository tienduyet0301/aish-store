import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

function generateRandomPassword(length = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pass = "";
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    console.log("Received email:", email);

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({ email, provider: "credentials" });
    console.log("Found user:", user ? "Yes" : "No");

    if (!user) {
      return NextResponse.json({ message: "Nếu email tồn tại, mật khẩu mới đã được gửi." });
    }

    // Tạo mật khẩu mới
    const newPassword = generateRandomPassword(10);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log("Generated new password");

    // Cập nhật mật khẩu mới vào database
    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );
    console.log("Password updated in database");

    // Cấu hình nodemailer với debug mode
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "Dlicht03@gmail.com",
        pass: "dgyg wgrr fiap lnuk"
      },
      debug: true, // Enable debug mode
      logger: true // Enable logger
    });

    // Verify transporter
    try {
      console.log("Verifying SMTP connection...");
      await transporter.verify();
      console.log("SMTP connection verified successfully");
    } catch (error) {
      console.error("SMTP verification failed:", error);
      throw error;
    }

    // Send email
    try {
      console.log("Preparing to send email...");
      const mailOptions = {
        from: '"AISH Support" <Dlicht03@gmail.com>',
        to: email,
        subject: "Mật khẩu mới cho tài khoản AISH",
        text: `Mật khẩu mới của bạn là: ${newPassword}\nVui lòng đăng nhập và đổi lại mật khẩu sau khi đăng nhập.`,
        html: `<p>Mật khẩu mới của bạn là: <b>${newPassword}</b></p><p>Vui lòng đăng nhập và đổi lại mật khẩu sau khi đăng nhập.</p>`,
      };
      console.log("Mail options:", mailOptions);

      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);
      console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    } catch (error) {
      console.error("Failed to send email:", error);
      throw error;
    }

    return NextResponse.json({ message: "Nếu email tồn tại, mật khẩu mới đã được gửi." });
  } catch (error) {
    console.error("Error in forgot-password API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}