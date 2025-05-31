import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { createOrder } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

// Validate order data
function validateOrderData(orderData) {
  const requiredFields = [
    'orderNumber',
    'fullName',
    'email',
    'phone',
    'ward',
    'district',
    'province',
    'items',
    'subtotal',
    'total',
    'paymentMethod'
  ];

  const missingFields = requiredFields.filter(field => !orderData[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  if (typeof orderData.subtotal !== 'number' || orderData.subtotal <= 0) {
    throw new Error('Invalid subtotal amount');
  }

  if (typeof orderData.total !== 'number' || orderData.total <= 0) {
    throw new Error('Invalid total amount');
  }
}

export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const orderData = await request.json();

    // Validate order data
    validateOrderData(orderData);

    // Log toàn bộ dữ liệu đơn hàng
    console.log('orderData:', JSON.stringify(orderData, null, 2));

    // Tạo đơn hàng mới
    const result = await createOrder(db, orderData);

    // Lưu thông tin số lượng cập nhật cho từng sản phẩm
    const updatedProducts = [];

    // Cập nhật số lượng sản phẩm
    for (const item of orderData.items) {
      const product = await db.collection("products").findOne({ _id: new ObjectId(item.id) });
      if (!product) {
        throw new Error(`Product not found: ${item.id}`);
      }

      // Kiểm tra số lượng tồn kho
      const size = item.size?.toLowerCase();
      const quantityField = `quantity${size?.toUpperCase()}`;
      if (product[quantityField] < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name} (${size})`);
      }

      // Cập nhật số lượng
      const updateResult = await db.collection("products").updateOne(
        { _id: new ObjectId(item.id) },
        { $inc: { [quantityField]: -item.quantity } }
      );

      if (updateResult.modifiedCount === 0) {
        throw new Error(`Failed to update stock for product: ${product.name}`);
      }

      updatedProducts.push({
        productId: item.id,
        newQuantity: product[quantityField] - item.quantity
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Đơn hàng đã được tạo thành công",
      orderId: result.insertedId,
      orderCode: orderData.orderNumber,
      updatedProducts
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { 
        ok: false, 
        error: error.message || "Failed to create order",
        details: error.stack
      },
      { status: 400 }
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
    return NextResponse.json({ ok: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { 
        ok: false, 
        error: "Failed to fetch orders",
        details: error.stack
      },
      { status: 500 }
    );
  }
} 