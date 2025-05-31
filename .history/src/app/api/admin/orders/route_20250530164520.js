export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Lấy tất cả đơn hàng và sắp xếp theo thời gian tạo mới nhất
    const orders = await db.collection("orders")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      ok: true,
      orders: orders.map(order => ({
        ...order,
        _id: order._id.toString()
      }))
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { ok: false, message: "Có lỗi xảy ra khi lấy danh sách đơn hàng" },
      { status: 500 }
    );
  }
} 