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
    console.log("Received email:", email); // Debug log

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({ email, provider: "credentials" });
    console.log("Found user:", user ? "Yes" : "No"); // Debug log

    if (!user) {
      // Trả về thành công để tránh lộ thông tin user tồn tại hay không
      return NextResponse.json({ message: "Nếu email tồn tại, mật khẩu mới đã được gửi." });
    }

    // Tạo mật khẩu mới
    const newPassword = generateRandomPassword(10);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu mới vào database
    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    );
    console.log("Password updated in database"); // Debug log

    // Gửi email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "Dlicht03@gmail.com",
        pass: "dgyg wgrr fiap lnuk"
      },
    });

    // Verify transporter
    try {
      await transporter.verify();
      console.log("SMTP connection verified"); // Debug log
    } catch (error) {
      console.error("SMTP verification failed:", error);
      throw error;
    }

    // Send email
    try {
      const info = await transporter.sendMail({
        from: '"AISH Support" <Dlicht03@gmail.com>',
        to: email,
        subject: "Mật khẩu mới cho tài khoản AISH",
        text: `Mật khẩu mới của bạn là: ${newPassword}\nVui lòng đăng nhập và đổi lại mật khẩu sau khi đăng nhập.`,
        html: `<p>Mật khẩu mới của bạn là: <b>${newPassword}</b></p><p>Vui lòng đăng nhập và đổi lại mật khẩu sau khi đăng nhập.</p>`,
      });
      console.log("Email sent:", info.messageId); // Debug log
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