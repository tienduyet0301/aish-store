import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { createSlug } from "@/lib/utils";

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";

// GET /api/products/by-slug/[slug] - Lấy thông tin sản phẩm theo slug
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db("aishh");
    const { slug } = params;

    const product = await db
      .collection("products")
      .findOne({ slug: slug });

    if (!product) {
      return NextResponse.json(
        { ok: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      product: {
        ...product,
        _id: product._id.toString(),
        images: product.images?.map((url: string) => 
          url.startsWith('http') ? url : `${DOMAIN}${url}`
        ) || []
      }
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
} 