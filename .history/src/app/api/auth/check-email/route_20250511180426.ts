import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ exists: false, error: "Email is required" }, { status: 400 });
    }
    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({ email });
    return NextResponse.json({ exists: !!user });
  } catch (error) {
    return NextResponse.json({ exists: false, error: "Internal Server Error" }, { status: 500 });
  }
} 