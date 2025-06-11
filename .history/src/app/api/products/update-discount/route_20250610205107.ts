import { NextResponse } from "next/server";
import { connectToDatabase } from '@/lib/mongodb';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const client = await connectToDatabase();
    const db = client.db("aishh");

    // Cập nhật tất cả sản phẩm, thêm trường discountPercent với giá trị mặc định là 0
    const result = await db.collection("products").updateMany(
      { discountPercent: { $exists: false } },
      { $set: { discountPercent: 0 } }
    );

    revalidatePath("/products");
    revalidatePath("/admin/products");

    return NextResponse.json({
      ok: true,
      message: `Updated ${result.modifiedCount} products with discountPercent field`
    });
  } catch (error) {
    console.error("Error updating products:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update products" },
      { status: 500 }
    );
  }
} 