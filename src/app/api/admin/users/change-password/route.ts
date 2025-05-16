import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const { userId, newPassword } = await request.json();
    
    if (!userId || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Kiểm tra user tồn tại và provider
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.provider && user.provider !== "credentials") {
      return NextResponse.json({ error: "Cannot change password for Google account" }, { status: 400 });
    }
    
    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Cập nhật mật khẩu trong database
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedPassword } }
    );

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 