import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password, name, phone, address } = await request.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const { db } = await connectToDatabase();
    const existing = await db.collection("users").findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection("users").insertOne({
      email,
      password: hashedPassword,
      name,
      phone: phone || "",
      address: address || "",
      createdAt: new Date(),
      provider: "credentials"
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 