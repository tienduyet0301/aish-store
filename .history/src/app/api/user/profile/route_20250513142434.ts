import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Lấy thông tin tài khoản
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Trả về đầy đủ thông tin user
    return NextResponse.json({
      name: user.name || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      birthDay: user.birthDay || '',
      birthMonth: user.birthMonth || '',
      birthYear: user.birthYear || '',
      email: user.email || '',
      provider: user.provider || 'credentials',
      createdAt: user.createdAt || new Date(),
    });
  } catch (error) {
    console.error('Profile error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Cập nhật thông tin tài khoản
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = await request.json();
    const { db } = await connectToDatabase();

    // Cập nhật thông tin user
    const result = await db.collection("users").updateOne(
      { email: session.user.email },
      { 
        $set: { 
          ...userData,
          email: session.user.email,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 