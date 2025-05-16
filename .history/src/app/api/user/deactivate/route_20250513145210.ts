import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reason } = await request.json();
    
    if (!reason) {
      return NextResponse.json({ error: "Reason is required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Cập nhật trạng thái tài khoản
    const result = await db.collection("users").updateOne(
      { email: session.user.email },
      { 
        $set: { 
          status: "deactivated",
          deactivatedAt: new Date(),
          deactivationReason: reason
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Account deactivated successfully" });
  } catch (error) {
    console.error("[DEACTIVATE_ACCOUNT]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 