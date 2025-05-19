import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Chỉ cần kiểm tra role trong session
    if ((session.user as any).role === "ADMIN") {
      return new NextResponse("Authorized", { status: 200 });
    }

    return new NextResponse("Forbidden", { status: 403 });
  } catch (error) {
    console.error("[ADMIN_CHECK_ACCESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 