import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(context.params.id) });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();

    const result = await db.collection("products").updateOne(
      { _id: new ObjectId(context.params.id) },
      { $set: body }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    revalidatePath(`/products/${context.params.id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const result = await db
      .collection("products")
      .deleteOne({ _id: new ObjectId(context.params.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    revalidatePath("/products");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 