import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log("No session or email found");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();
    console.log("Received request for email:", session.user.email);

    if (!currentPassword || !newPassword || !confirmPassword) {
      console.log("Missing password fields");
      return NextResponse.json(
        { error: "All password fields are required" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      console.log("New passwords do not match");
      return NextResponse.json(
        { error: "New passwords do not match" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      console.log("New password too short");
      return NextResponse.json(
        { error: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({ email: session.user.email });

    if (!user) {
      console.log("User not found in database");
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log("Found user, comparing passwords");
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    console.log("Password comparison result:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("Current password is incorrect");
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    console.log("Password valid, hashing new password");
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    console.log("Updating password in database");
    await db.collection("users").updateOne(
      { email: session.user.email },
      { $set: { password: hashedNewPassword } }
    );

    console.log("Password updated successfully");
    return NextResponse.json({
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error("Error in update password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 