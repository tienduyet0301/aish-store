import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET - Lấy thông báo và mã giảm giá
export async function GET() {
  try {
    console.log("Fetching notifications from database...");
    const { db } = await connectToDatabase();
    const notifications = await db.collection("notifications").findOne({ type: "announcement" });
    const promoCodes = await db.collection("notifications")
      .find({ type: "promo" })
      .toArray();
    
    console.log("Found notifications:", notifications);
    console.log("Found promo codes:", promoCodes);

    return NextResponse.json({ 
      ok: true, 
      announcement: notifications?.content || "",
      isAnnouncementActive: notifications?.isActive || false,
      promoCodes: promoCodes.map(code => ({
        id: code._id.toString(),
        code: code.code,
        amount: code.amount,
        isActive: code.isActive
      }))
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST - Cập nhật thông báo hoặc mã giảm giá
export async function POST(request: Request) {
  try {
    const { type, content, code, amount, isActive, action, id } = await request.json();
    console.log("Updating notifications:", { type, content, code, amount, isActive, action, id });
    
    const { db } = await connectToDatabase();

    if (type === "announcement") {
      await db.collection("notifications").updateOne(
        { type: "announcement" },
        { 
          $set: { 
            content,
            isActive,
            updatedAt: new Date().toISOString()
          }
        },
        { upsert: true }
      );
      console.log("Updated announcement successfully");
    } else if (type === "promo") {
      if (action === "add") {
        // Validate input
        if (!code || typeof code !== 'string' || code.trim().length === 0) {
          return NextResponse.json(
            { ok: false, error: "Mã giảm giá không hợp lệ" },
            { status: 400 }
          );
        }

        // Convert amount to number and validate
        const numericAmount = Number(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
          return NextResponse.json(
            { ok: false, error: "Số tiền giảm giá không hợp lệ" },
            { status: 400 }
          );
        }

        // Check for duplicate code
        const existingCode = await db.collection("notifications").findOne({
          type: "promo",
          code: code.trim()
        });

        if (existingCode) {
          return NextResponse.json(
            { ok: false, error: "Mã giảm giá đã tồn tại" },
            { status: 400 }
          );
        }

        // Add new promo code
        await db.collection("notifications").insertOne({
          type: "promo",
          code: code.trim(),
          amount: numericAmount,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        console.log("Added new promo code successfully");
      } else if (action === "toggle") {
        if (!id) {
          return NextResponse.json(
            { ok: false, error: "ID không hợp lệ" },
            { status: 400 }
          );
        }

        await db.collection("notifications").updateOne(
          { _id: new ObjectId(id) },
          { 
            $set: { 
              isActive,
              updatedAt: new Date().toISOString()
            }
          }
        );
        console.log("Toggled promo code successfully");
      } else if (action === "delete") {
        if (!id) {
          return NextResponse.json(
            { ok: false, error: "ID không hợp lệ" },
            { status: 400 }
          );
        }

        await db.collection("notifications").deleteOne({ _id: new ObjectId(id) });
        console.log("Deleted promo code successfully");
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update notifications" },
      { status: 500 }
    );
  }
} 