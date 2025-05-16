import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import { createOrder } from "../../../models/Order";

export async function POST(request) {
  try {
    const orderData = await request.json();

    // Thêm thông tin thời gian và trạng thái
    const orderWithMetadata = {
      ...orderData,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { db } = await connectToDatabase();
    
    // Lưu đơn hàng vào database
    const result = await db.collection('orders').insertOne(orderWithMetadata);

    if (!result.acknowledged) {
      return NextResponse.json(
        { message: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Trả về đơn hàng đã tạo
    return NextResponse.json({
      message: 'Order created successfully',
      order: {
        ...orderWithMetadata,
        _id: result.insertedId
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
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