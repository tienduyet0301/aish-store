import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Kiểm tra nếu là admin
    if (session.user.email === process.env.ADMIN_USERNAME) {
      return new NextResponse("Authorized", { status: 200 });
    }

    // Kiểm tra user thường
    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({ 
      email: session.user.email,
      role: "ADMIN"
    });

    if (!user) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    return new NextResponse("Authorized", { status: 200 });
  } catch (error) {
    console.error("[ADMIN_CHECK_ACCESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 