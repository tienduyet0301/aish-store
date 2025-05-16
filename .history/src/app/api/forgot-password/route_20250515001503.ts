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
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #000000; font-size: 24px; margin-bottom: 10px; font-weight: 600;">🔐 Mật khẩu mới cho tài khoản AISH của bạn</h1>
        </div>

        <!-- Content -->
        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Chào bạn,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Bạn vừa yêu cầu khôi phục mật khẩu cho tài khoản tại AISH – cửa hàng thời trang trực tuyến của bạn.
          </p>

          <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 25px 0; border: 1px solid #e5e7eb;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 10px; font-weight: 500;">
              👉 Mật khẩu mới:
            </p>
            <div style="background-color: #ffffff; padding: 15px; border-radius: 4px; text-align: center; border: 1px dashed #d1d5db;">
              <code style="font-size: 20px; font-weight: 600; color: #000000; letter-spacing: 1px;">${newPassword}</code>
            </div>
          </div>

          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Vui lòng dùng mật khẩu này để đăng nhập và đổi lại mật khẩu ngay để bảo vệ tài khoản của bạn.
          </p>

          <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin: 25px 0; border: 1px solid #fee2e2;">
            <p style="color: #991b1b; font-size: 14px; margin: 0;">
              Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi qua:
              <br>
              <a href="mailto:support@aish.vn" style="color: #dc2626; text-decoration: none;">📩 
aish.aish.vn@gmail.com</a>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
            Trân trọng,
          </p>
          <p style="color: #000000; font-size: 16px; font-weight: 600; margin: 0;">
            Đội ngũ AISH
          </p>
          <div style="margin-top: 20px;">
            <a href="https://aish.vn" style="color: #6b7280; text-decoration: none; font-size: 14px;">
              aish.vn
            </a>
          </div>
        </div>
      </div>
    `;

    const emailText = `Chào bạn,

Bạn vừa yêu cầu khôi phục mật khẩu cho tài khoản tại AISH – cửa hàng thời trang trực tuyến của bạn.

👉 Mật khẩu mới: ${newPassword}

Vui lòng dùng mật khẩu này để đăng nhập và đổi lại mật khẩu ngay để bảo vệ tài khoản của bạn.

Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi qua:
📩 support@aish.vn

Trân trọng,
Đội ngũ AISH`;

    const emailSent = await sendMail(
      email,
      "🔐 Mật khẩu mới cho tài khoản AISH của bạn",
      emailText,
      emailHtml
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