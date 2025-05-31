import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: Request,
  { params }: { params: { orderCode: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const orderCode = params.orderCode;

    console.log("Fetching order with code:", orderCode);

    const order = await db.collection("orders").findOne({ orderNumber: orderCode });

    if (!order) {
      console.log("Order not found for code:", orderCode);
      return NextResponse.json(
        { ok: false, error: "Order not found" },
        { status: 404 }
      );
    }

    console.log("Found order:", order);

    return NextResponse.json({ ok: true, order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
} 