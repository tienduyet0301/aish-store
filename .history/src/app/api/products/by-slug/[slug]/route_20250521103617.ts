import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";

// GET product by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    console.log("Fetching product with slug:", params.slug);
    const { db } = await connectToDatabase();
    
    const product = await db
      .collection("products")
      .findOne({ slug: params.slug });

    console.log("Found product:", product);

    if (!product) {
      console.log("Product not found for slug:", params.slug);
      return NextResponse.json(
        { ok: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 