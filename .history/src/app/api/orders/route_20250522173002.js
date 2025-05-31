import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import { createOrder } from "../../../models/Order";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const orderData = await request.json();

    // Start a session for transaction
    const session = await db.client.startSession();
    
    try {
      // Start transaction
      session.startTransaction();

      // Create order
      const result = await createOrder(db, orderData);

      // Update product quantities
      for (const item of orderData.items) {
        if (!item.productId) {
          console.error('Missing productId in order item:', item);
          continue;
        }

        const product = await db.collection("products").findOne(
          { _id: new ObjectId(item.productId) },
          { session }
        );

        if (!product) {
          console.error(`Product not found: ${item.productId}`);
          continue;
        }

        // Update quantity by size
        const updateField = `quantity${item.size}`;
        const currentQuantity = product[updateField] || 0;
        const newQuantity = Math.max(0, currentQuantity - item.quantity);

        console.log(`Updating product ${item.productId} - Size ${item.size}:`, {
          currentQuantity,
          orderedQuantity: item.quantity,
          newQuantity
        });

        const updateResult = await db.collection("products").updateOne(
          { _id: new ObjectId(item.productId) },
          { 
            $set: { 
              [updateField]: newQuantity,
              updatedAt: new Date()
            }
          },
          { session }
        );

        if (updateResult.modifiedCount === 0) {
          console.error(`Failed to update product ${item.productId}`);
          continue;
        }

        // Check if all sizes are out of stock
        const updatedProduct = await db.collection("products").findOne(
          { _id: new ObjectId(item.productId) },
          { session }
        );

        const allSizesOutOfStock = ['M', 'L', 'XL', 'Hat'].every(size => 
          (updatedProduct[`quantity${size}`] || 0) === 0
        );

        if (allSizesOutOfStock) {
          await db.collection("products").updateOne(
            { _id: new ObjectId(item.productId) },
            { 
              $set: { 
                outOfStock: true,
                updatedAt: new Date()
              }
            },
            { session }
          );
        }
      }

      // Commit transaction
      await session.commitTransaction();

      // Revalidate related paths
      revalidatePath("/products");
      revalidatePath("/admin/products");

      return NextResponse.json({
        ok: true,
        message: "Đơn hàng đã được tạo thành công",
        orderId: result.insertedId,
        orderCode: orderData.orderCode
      });
    } catch (error) {
      // If an error occurred, abort the transaction
      await session.abortTransaction();
      throw error;
    } finally {
      // End the session
      session.endSession();
    }
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
} 