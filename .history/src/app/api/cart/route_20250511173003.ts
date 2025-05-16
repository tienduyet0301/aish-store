import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Lấy giỏ hàng
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const cart = await db.collection("carts").findOne({ userEmail: session.user.email });
    
    return NextResponse.json(cart?.items || []);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Cập nhật giỏ hàng
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await request.json();
    const { db } = await connectToDatabase();

    await db.collection("carts").updateOne(
      { userEmail: session.user.email },
      { $set: { items, userEmail: session.user.email } },
      { upsert: true }
    );

    return NextResponse.json({ message: "Cart updated successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 