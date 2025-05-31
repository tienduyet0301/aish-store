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

    // Ensure all required fields are present
    const formattedProduct = {
      ...product,
      _id: product._id.toString(),
      quantityM: product.quantityM || 0,
      quantityL: product.quantityL || 0,
      quantityXL: product.quantityXL || 0,
      quantityHat: product.quantityHat || 0,
      outOfStockM: product.quantityM === 0,
      outOfStockL: product.quantityL === 0,
      outOfStockXL: product.quantityXL === 0,
      outOfStockHat: product.quantityHat === 0,
      outOfStock: product.quantityM === 0 && product.quantityL === 0 && product.quantityXL === 0 && product.quantityHat === 0,
      sizes: product.sizes || ["M", "L", "XL"],
      colors: product.colors || [],
      images: product.images?.map((url: string) => 
        url.startsWith('http') ? url : `${DOMAIN}${url}`
      ) || []
    };

    return NextResponse.json({ ok: true, product: formattedProduct });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 