import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import Order from "../../../models/Order";

export async function POST(request) {
  try {
    await connectToDatabase();
    const orderData = await request.json();

    // Tạo đơn hàng mới
    const order = new Order({
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Lưu đơn hàng vào database
    await order.save();

    return NextResponse.json({
      ok: true,
      message: "Đơn hàng đã được tạo thành công",
      orderId: order._id,
      orderCode: order.orderCode
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { ok: false, message: "Có lỗi xảy ra khi tạo đơn hàng" },
      { status: 500 }
    );
  }
} 