import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(request, { params }) {
  try {
    const { orderId } = params;
    const updates = await request.json();

    const { db } = await connectToDatabase();
    
    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(orderId) },
      { 
        $set: { 
          ...updates,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Order updated successfully" 
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { orderId } = params;
    
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Kiểm tra xem đơn hàng có tồn tại không
    const order = await db.collection("orders").findOne({
      _id: new ObjectId(orderId)
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Xóa đơn hàng
    const result = await db.collection("orders").deleteOne({
      _id: new ObjectId(orderId)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Failed to delete order" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Order deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order", details: error.message },
      { status: 500 }
    );
  }
} 