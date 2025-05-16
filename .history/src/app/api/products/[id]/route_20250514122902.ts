import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";

// GET /api/products/[id] - Lấy thông tin sản phẩm theo ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db("aishh");
    const { id } = params;

    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(id) });

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

// PUT /api/products/[id] - Cập nhật sản phẩm theo ID
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db("aishh");
    const product = await request.json();
    const { id } = params;

    // Chuyển đổi các trường số
    const updatedProduct = {
      name: product.name,
      price: Number(product.price),
      description: product.description,
      images: product.images,
      quantityM: Number(product.quantityM),
      quantityL: Number(product.quantityL),
      quantityXL: Number(product.quantityXL),
      quantityHat: Number(product.quantityHat),
      productCode: product.productCode,
      details: product.details,
      category: product.category,
      collection: product.collection,
      colors: product.colors || [],
      updatedAt: new Date().toISOString()
    };

    const result = await db
      .collection("products")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedProduct }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { ok: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Lấy sản phẩm đã cập nhật
    const updatedProductData = await db
      .collection("products")
      .findOne({ _id: new ObjectId(id) });

    if (!updatedProductData) {
      return NextResponse.json(
        { ok: false, error: "Failed to fetch updated product" },
        { status: 500 }
      );
    }

    revalidatePath("/products");
    revalidatePath("/admin/products");

    return NextResponse.json({ 
      ok: true,
      product: {
        ...updatedProductData,
        _id: updatedProductData._id.toString(),
        images: updatedProductData.images?.map((url: string) => 
          url.startsWith('http') ? url : `${DOMAIN}${url}`
        ) || []
      }
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Xóa sản phẩm theo ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db("aishh");
    const { id } = params;

    const result = await db
      .collection("products")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { ok: false, error: "Product not found" },
        { status: 404 }
      );
    }

    revalidatePath("/products");
    revalidatePath("/admin/products");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
} 