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
    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({ email, provider: "credentials" });
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

    // Gửi email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "YOUR_GMAIL@gmail.com", // Thay bằng email Gmail của bạn
        pass: "YOUR_APP_PASSWORD",    // Thay bằng app password 16 ký tự bạn vừa lấy
      },
    });

    await transporter.sendMail({
      from: '"AISH Support" <YOUR_GMAIL@gmail.com>',
      to: email,
      subject: "Mật khẩu mới cho tài khoản AISH",
      text: `Mật khẩu mới của bạn là: ${newPassword}\nVui lòng đăng nhập và đổi lại mật khẩu sau khi đăng nhập.`,
      html: `<p>Mật khẩu mới của bạn là: <b>${newPassword}</b></p><p>Vui lòng đăng nhập và đổi lại mật khẩu sau khi đăng nhập.</p>`,
    });

    return NextResponse.json({ message: "Nếu email tồn tại, mật khẩu mới đã được gửi." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}