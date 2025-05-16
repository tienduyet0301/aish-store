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