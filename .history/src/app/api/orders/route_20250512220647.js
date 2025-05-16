import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import { createOrder } from "../../../models/Order";

export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const orderData = await request.json();

    // Tạo đơn hàng mới
    const result = await createOrder(db, orderData);

    return NextResponse.json({
      ok: true,
      message: "Đơn hàng đã được tạo thành công",
      orderId: result.insertedId,
      orderCode: orderData.orderCode
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { ok: false, message: "Có lỗi xảy ra khi tạo đơn hàng" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Lấy tất cả đơn hàng và sắp xếp theo thời gian tạo mới nhất
    const orders = await db.collection("orders")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
} 