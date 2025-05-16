import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    return new NextResponse("Authorized", { status: 200 });
  } catch (error) {
    console.error("[ADMIN_CHECK_ACCESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 