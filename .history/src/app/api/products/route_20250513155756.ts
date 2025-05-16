// src/app/api/products/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { createSlug } from "@/lib/utils";

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";

// GET /api/products - Lấy danh sách sản phẩm
export async function GET() {
  try {
    console.log("Connecting to database...");
    const { db } = await connectToDatabase();
    console.log("Connected to database successfully");

    console.log("Fetching products...");
    const products = await db.collection("products").find({}).toArray();
    console.log(`Found ${products.length} products`);

    return NextResponse.json({ ok: true, products });
  } catch (error: any) {
    console.error("Error details:", {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      name: error?.name || 'Unknown error type'
    });
    return NextResponse.json(
      { ok: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products - Thêm sản phẩm mới
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const details = formData.get("details") as string;
    const price = Number(formData.get("price"));
    const category = formData.get("category") as string;
    const collection = formData.get("collection") as string;
    const productCode = formData.get("productCode") as string;
    const quantityM = Number(formData.get("quantityM"));
    const quantityL = Number(formData.get("quantityL"));
    const quantityXL = Number(formData.get("quantityXL"));
    const quantityHat = Number(formData.get("quantityHat"));
    const images = JSON.parse(formData.get("images") as string);
    const sizeGuideImage = formData.get("sizeGuideImage") as string;
    const colors = JSON.parse(formData.get("colors") as string || "[]");

    const { db } = await connectToDatabase();
    const slug = createSlug(name);
    
    // Kiểm tra xem slug đã tồn tại chưa
    const existingProduct = await db.collection("products").findOne({ slug });
    if (existingProduct) {
      // Nếu slug đã tồn tại, thêm timestamp vào cuối
      const timestamp = Date.now();
      slug = `${slug}-${timestamp}`;
    }

    const product = {
      name,
      description,
      details,
      price,
      category,
      collection,
      productCode,
      images,
      sizeGuideImage,
      quantityM,
      quantityL,
      quantityXL,
      quantityHat,
      colors,
      slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await db.collection("products").insertOne(product);

    return NextResponse.json({
      ok: true,
      product: { ...product, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Cập nhật sản phẩm
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    
    const updateData: any = {
      name: formData.get("name"),
      description: formData.get("description"),
      details: formData.get("details"),
      price: Number(formData.get("price")),
      category: formData.get("category"),
      quantityM: Number(formData.get("quantityM")),
      quantityL: Number(formData.get("quantityL")),
      quantityXL: Number(formData.get("quantityXL")),
      quantityHat: Number(formData.get("quantityHat")),
      colors: JSON.parse(formData.get("colors") as string || "[]"),
      updatedAt: new Date().toISOString(),
    };

    // Handle size guide image upload if exists
    const sizeGuideImage = formData.get("sizeGuideImage") as File;
    if (sizeGuideImage) {
      const sizeGuideFormData = new FormData();
      sizeGuideFormData.append("file", sizeGuideImage);
      
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: sizeGuideFormData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload size guide image");
      }

      const uploadData = await uploadResponse.json();
      updateData.sizeGuideImage = uploadData.url;
    }

    const { db } = await connectToDatabase();
    const result = await db.collection("products").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { ok: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const updatedProduct = await db.collection("products").findOne({
      _id: new ObjectId(id),
    });

    return NextResponse.json({
      ok: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Xóa sản phẩm
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
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

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
