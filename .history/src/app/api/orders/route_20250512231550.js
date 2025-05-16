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

export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const orderCode = searchParams.get('orderCode');

    if (orderCode) {
      // Nếu có orderCode, tìm đơn hàng cụ thể
      const order = await db.collection("orders").findOne({ orderCode });
      
      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(order);
    } else {
      // Nếu không có orderCode, lấy tất cả đơn hàng
      const orders = await db.collection("orders")
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      return NextResponse.json({ orders });
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
} 