import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

// Lấy giỏ hàng
export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await db.collection("carts").findOne({ email: userEmail });
    return NextResponse.json(cart || { items: [] });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// Cập nhật giỏ hàng
export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, size, quantity } = await request.json();

    if (!productId || !size || quantity === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(productId) });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const updateField = `quantity${size}`;
    const availableQuantity = product[updateField] || 0;

    if (quantity > availableQuantity) {
      return NextResponse.json(
        { error: "Not enough stock available" },
        { status: 400 }
      );
    }

    const result = await db.collection("carts").updateOne(
      { email: userEmail },
      {
        $set: {
          email: userEmail,
          [`items.${productId}.${size}`]: quantity,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { db } = await connectToDatabase();
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, size } = await request.json();

    if (!productId || !size) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await db.collection("carts").updateOne(
      { email: userEmail },
      {
        $unset: {
          [`items.${productId}.${size}`]: "",
        },
        $set: {
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return NextResponse.json(
      { error: "Failed to remove item from cart" },
      { status: 500 }
    );
  }
} 