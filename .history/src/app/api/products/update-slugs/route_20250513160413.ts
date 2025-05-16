import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { createSlug } from "@/lib/utils";

export async function POST() {
  try {
    const { db } = await connectToDatabase();
    const products = await db.collection("products").find({}).toArray();
    
    console.log("Found products:", products.length);
    
    for (const product of products) {
      let slug = createSlug(product.name);
      console.log(`Processing product: ${product.name}`);
      console.log(`Generated slug: ${slug}`);
      
      // Kiểm tra xem slug đã tồn tại chưa
      const existingProduct = await db.collection("products").findOne({ 
        slug, 
        _id: { $ne: product._id } 
      });
      
      if (existingProduct) {
        // Nếu slug đã tồn tại, thêm timestamp vào cuối
        const timestamp = Date.now();
        slug = `${slug}-${timestamp}`;
        console.log(`Slug already exists, new slug: ${slug}`);
      }

      const result = await db.collection("products").updateOne(
        { _id: product._id },
        { $set: { slug } }
      );
      
      console.log(`Update result for ${product.name}:`, result.modifiedCount > 0 ? "Success" : "Failed");
    }

    // Kiểm tra lại sau khi cập nhật
    const updatedProducts = await db.collection("products").find({}).toArray();
    const slugs = updatedProducts.map(p => ({ name: p.name, slug: p.slug }));
    console.log("Updated products with slugs:", slugs);

    return NextResponse.json({ 
      ok: true, 
      message: `Updated ${products.length} products with slugs`,
      slugs
    });
  } catch (error) {
    console.error("Error updating slugs:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update slugs" },
      { status: 500 }
    );
  }
} 