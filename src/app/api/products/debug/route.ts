import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("aishh");
    
    const products = await db.collection("products").find({}).toArray();
    
    // Chỉ trả về thông tin cần thiết để debug
    const debugInfo = products.map(product => ({
      _id: product._id.toString(),
      name: product.name,
      slug: product.slug
    }));

    return NextResponse.json({
      ok: true,
      products: debugInfo
    });
  } catch (error) {
    console.error("Error fetching debug info:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch debug info" },
      { status: 500 }
    );
  }
} 