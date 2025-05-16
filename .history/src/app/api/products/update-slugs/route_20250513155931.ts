import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { createSlug } from "@/lib/utils";

export async function POST() {
  try {
    const { db } = await connectToDatabase();
    const products = await db.collection("products").find({}).toArray();
    
    for (const product of products) {
      let slug = createSlug(product.name);
      
      // Kiểm tra xem slug đã tồn tại chưa
      const existingProduct = await db.collection("products").findOne({ 
        slug, 
        _id: { $ne: product._id } 
      });
      
      if (existingProduct) {
        // Nếu slug đã tồn tại, thêm timestamp vào cuối
        const timestamp = Date.now();
        slug = `${slug}-${timestamp}`;
      }

      await db.collection("products").updateOne(
        { _id: product._id },
        { $set: { slug } }
      );
    }

    return NextResponse.json({ 
      ok: true, 
      message: `Updated ${products.length} products with slugs` 
    });
  } catch (error) {
    console.error("Error updating slugs:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update slugs" },
      { status: 500 }
    );
  }
} 