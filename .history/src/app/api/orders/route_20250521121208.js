import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { createOrder } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const orderData = await request.json();

    // Log toàn bộ dữ liệu đơn hàng
    console.log('orderData.items:', orderData.items);

    // Tạo đơn hàng mới
    const result = await createOrder(db, orderData);

    // Lưu thông tin số lượng cập nhật cho từng sản phẩm
    const updatedProducts = [];

    // Cập nhật số lượng sản phẩm
    for (const item of orderData.items) {
      console.log('Processing item:', item);
      if (!item.productId) {
        console.error('Missing productId in order item:', item);
        continue;
      }
      let objectId;
      try {
        objectId = new ObjectId(item.productId);
      } catch (err) {
        console.error('Invalid productId, cannot convert to ObjectId:', item.productId);
        continue;
      }
      const product = await db.collection("products").findOne({ _id: objectId });
      if (!product) {
        console.error(`Product not found: ${item.productId}`);
        continue;
      }
      const updateField = `quantity${item.size}`;
      const currentQuantity = product[updateField] || 0;
      const newQuantity = Math.max(0, currentQuantity - item.quantity);
      console.log(`Updating product ${item.productId} - Size ${item.size}:`, {
        currentQuantity,
        orderedQuantity: item.quantity,
        newQuantity
      });
      const updateResult = await db.collection("products").updateOne(
        { _id: objectId },
        { 
          $set: { 
            [updateField]: newQuantity,
            [`outOfStock${item.size}`]: newQuantity === 0,
            updatedAt: new Date()
          }
        }
      );
      console.log('Update result:', updateResult);
      if (updateResult.modifiedCount === 0) {
        console.error(`Failed to update product ${item.productId}`);
        continue;
      }
      // Kiểm tra nếu tất cả các size đều hết hàng
      const updatedProduct = await db.collection("products").findOne({ _id: objectId });
      const allSizesOutOfStock = ['M', 'L', 'XL', 'Hat'].every(size => 
        (updatedProduct[`quantity${size}`] || 0) === 0
      );
      if (allSizesOutOfStock) {
        await db.collection("products").updateOne(
          { _id: objectId },
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
      // Lưu lại số lượng mới cho từng sản phẩm
      updatedProducts.push({
        productId: item.productId,
        size: item.size,
        newQuantity
      });
    }
    // Revalidate trang admin products
    revalidatePath("/admin/products");
    // Trả về response với thông tin cập nhật
    return NextResponse.json({
      ok: true,
      message: "Đơn hàng đã được tạo thành công",
      orderId: result.insertedId,
      orderCode: orderData.orderCode,
      updatedProducts
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

    if (orderCode) {
      // Cho phép bất kỳ ai lấy đơn hàng theo orderCode
      const order = await db.collection("orders").findOne({ orderNumber: orderCode });
      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ ok: true, order });
    }

    // Nếu không có orderCode, chỉ trả về đơn hàng của user đăng nhập
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await db.collection("orders")
      .find({ email: userEmail })
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
} 