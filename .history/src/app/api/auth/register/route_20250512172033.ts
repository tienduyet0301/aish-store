import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

const rateLimitMap = new Map<string, { count: number, last: number }>();
const RATE_LIMIT = 5; // 5 lần
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 phút

export async function POST(request: Request) {
  // Rate limit theo IP
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, last: now };
  if (now - entry.last > RATE_LIMIT_WINDOW) {
    entry.count = 0;
    entry.last = now;
  }
  entry.count++;
  entry.last = now;
  rateLimitMap.set(ip, entry);
  if (entry.count > RATE_LIMIT) {
    return NextResponse.json({ error: 'Too many requests, please try again later.' }, { status: 429 });
  }

  try {
    const { email, password, name, day, month, year, receiveUpdates } = await request.json();

    // Validate required fields
    if (!email || !password || !name || !day || !month || !year) {
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Validate date of birth
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (isNaN(birthDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date of birth" },
        { status: 400 }
      );
    }

    if (age < 13) {
      return NextResponse.json(
        { error: "You must be at least 13 years old to register" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Check if email already exists
    const existing = await db.collection("users").findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo token xác thực email
    const verifyToken = crypto.randomBytes(32).toString("hex");

    // Create user
    await db.collection("users").insertOne({
      email,
      password: hashedPassword,
      name,
      dateOfBirth: {
        day: parseInt(day),
        month: parseInt(month),
        year: parseInt(year)
      },
      receiveUpdates: receiveUpdates || false,
      createdAt: new Date(),
      provider: "credentials",
      emailVerified: false,
      verifyToken,
    });

    // Gửi email xác thực (cần cấu hình SMTP thực tế)
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      const verifyUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/verify-email?token=${verifyToken}`;
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'no-reply@aish.com',
        to: email,
        subject: "Verify your email",
        html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email for AISH.</p>`
      });
    } catch (e) {
      // Nếu gửi email lỗi, vẫn trả về thành công nhưng log lỗi
      console.error("Send verify email error", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: "An error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
} 