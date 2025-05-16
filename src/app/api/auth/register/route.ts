import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

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
    const { email, password, name, firstName, lastName, day, month, year, receiveUpdates } = await request.json();

    // Validate required fields
    if (!email || !password || (!name && (!firstName || !lastName)) || !day || !month || !year) {
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

    // Tách firstName và lastName nếu chỉ có name
    let fName = firstName;
    let lName = lastName;
    if (!fName || !lName) {
      const nameParts = (name || '').trim().split(' ');
      fName = nameParts[0] || '';
      lName = nameParts.slice(1).join(' ') || '';
    }

    // Create user với các trường ở cấp cao nhất
    await db.collection("users").insertOne({
      email,
      password: hashedPassword,
      firstName: fName,
      lastName: lName,
      birthDay: day,
      birthMonth: month,
      birthYear: year,
      receiveUpdates: receiveUpdates || false,
      createdAt: new Date(),
      provider: "credentials"
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: "An error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
} 