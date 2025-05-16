import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function DELETE(request: Request) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Xóa tài khoản khỏi database
    await db.collection("users").deleteOne({ _id: userId });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 