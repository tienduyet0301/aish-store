import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Lấy thông tin tài khoản
export async function GET() {
  try {
    console.log('Fetching user profile...');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session?.user);
    
    if (!session?.user?.email) {
      console.log('No session or email found');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Kiểm tra role
    if (session.user.role === "ADMIN") {
      console.log('Admin user detected');
      return NextResponse.json({
        name: "Admin",
        email: session.user.email,
        role: "ADMIN"
      });
    }

    const { db } = await connectToDatabase();
    console.log('Connected to database');
    
    const user = await db.collection("users").findOne({ email: session.user.email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found in database');
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Trả về đầy đủ thông tin user
    const userData = {
      name: user.name || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      birthDay: user.birthDay || '',
      birthMonth: user.birthMonth || '',
      birthYear: user.birthYear || '',
      email: user.email || '',
      provider: user.provider || 'credentials',
      role: user.role || 'USER',
      createdAt: user.createdAt || new Date(),
    };
    
    console.log('Returning user data:', userData);
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Profile error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: "Internal Server Error", 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Cập nhật thông tin tài khoản
export async function PUT(request: Request) {
  try {
    console.log('Updating user profile...');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session?.user);
    
    if (!session?.user?.email) {
      console.log('No session or email found');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Kiểm tra role
    if (session.user.role === "ADMIN") {
      console.log('Admin user cannot update profile through this endpoint');
      return NextResponse.json({ error: "Admin users cannot update profile through this endpoint" }, { status: 403 });
    }

    const userData = await request.json();
    console.log('Update data:', userData);
    
    const { db } = await connectToDatabase();
    console.log('Connected to database');

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

    console.log('Update result:', result);

    if (result.matchedCount === 0) {
      console.log('User not found for update');
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: "Internal Server Error", 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 