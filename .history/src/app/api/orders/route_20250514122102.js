import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import { createOrder } from "../../../models/Order";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const orderData = await request.json();

    // Tạo đơn hàng mới
    const result = await createOrder(db, orderData);

    // Cập nhật số lượng sản phẩm
    for (const item of orderData.items) {
      const product = await db.collection("products").findOne({ _id: new ObjectId(item.productId) });
      if (!product) {
        console.error(`Product not found: ${item.productId}`);
        continue;
      }

      // Cập nhật số lượng theo size
      const updateField = `quantity${item.size}`;
      const newQuantity = Math.max(0, product[updateField] - item.quantity);

      // Cập nhật số lượng sản phẩm
      await db.collection("products").updateOne(
        { _id: new ObjectId(item.productId) },
        { 
          $set: { 
            [updateField]: newQuantity,
            [`outOfStock${item.size}`]: newQuantity === 0,
            updatedAt: new Date()
          }
        }
      );

      // Kiểm tra nếu tất cả các size đều hết hàng
      const updatedProduct = await db.collection("products").findOne({ _id: new ObjectId(item.productId) });
      const allSizesOutOfStock = ['M', 'L', 'XL', 'Hat'].every(size => 
        updatedProduct[`quantity${size}`] === 0
      );

      if (allSizesOutOfStock) {
        await db.collection("products").updateOne(
          { _id: new ObjectId(item.productId) },
          { 
            $set: { 
              outOfStock: true,
              updatedAt: new Date()
            }
          }
        );
      }

      // Revalidate trang chi tiết sản phẩm
      revalidatePath(`/${product.slug}`);
    }

    // Revalidate các trang liên quan
    revalidatePath("/products");
    revalidatePath("/admin/products");
    revalidatePath("/admin/products/page");

    return NextResponse.json({
      ok: true,
      message: "Đơn hàng đã được tạo thành công",
      orderId: result.insertedId,
      orderCode: orderData.orderCode
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { ok: false, message: "Có lỗi xảy ra khi tạo đơn hàng" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const orderCode = searchParams.get('orderCode');

    // Lấy email user hiện tại từ session
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (orderCode) {
      // Nếu có orderCode, tìm đơn hàng cụ thể (và phải thuộc về user này)
      const order = await db.collection("orders").findOne({ orderCode, email: userEmail });
      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(order);
    } else {
      // Nếu không có orderCode, lấy tất cả đơn hàng của user hiện tại
      const orders = await db.collection("orders")
        .find({ email: userEmail })
        .sort({ createdAt: -1 })
        .toArray();
      return NextResponse.json({ orders });
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
} 