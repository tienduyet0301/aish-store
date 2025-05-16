import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const { db } = await connectToDatabase();

    // Tìm kiếm email không phân biệt chữ hoa chữ thường
    const user = await db.collection("users").findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") }
    });

    return NextResponse.json({ exists: !!user });
  } catch (error) {
    console.error("Error checking email:", error);
    return NextResponse.json(
      { error: "Failed to check email" },
      { status: 500 }
    );
  }
} 