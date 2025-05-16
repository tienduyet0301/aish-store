import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(request, { params }) {
  try {
    const { orderId } = params;
    const { status } = await request.json();

    const { db } = await connectToDatabase();
    
    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(orderId) },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { ok: false, message: "Không tìm thấy đơn hàng" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Cập nhật trạng thái đơn hàng thành công"
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { ok: false, message: "Có lỗi xảy ra khi cập nhật trạng thái đơn hàng" },
      { status: 500 }
    );
  }
} 