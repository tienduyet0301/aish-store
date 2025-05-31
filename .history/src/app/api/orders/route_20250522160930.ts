import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateOrderCode } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const orderData = await request.json();

    // Validate items array
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json(
        { ok: false, message: 'Order must have at least one item' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const orderCode = generateOrderCode();

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

      // Kiểm tra nếu tất cả các size đều hết hàng
      const updatedProduct = await db.collection("products").findOne({ _id: new ObjectId(item.id) });
      if (!updatedProduct) {
        throw new Error(`Failed to fetch updated product: ${item.id}`);
      }

      const allSizesOutOfStock = ['M', 'L', 'XL', 'Hat'].every(size => 
        (updatedProduct[`quantity${size}`] || 0) === 0
      );

      if (allSizesOutOfStock) {
        await db.collection("products").updateOne(
          { _id: new ObjectId(item.id) },
          { $set: { outOfStock: true } }
        );
      }

      // Revalidate trang chi tiết sản phẩm
      revalidatePath(`/${product.slug}`);
    }

    // Tạo đơn hàng mới với thông tin người dùng
    const order = {
      orderCode,
      items: orderData.items,
      total: orderData.total,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentStatus: 'pending',
      shippingStatus: 'pending',
      // Thông tin người dùng (có thể null nếu không đăng nhập)
      fullName: orderData.fullName || null,
      email: orderData.email || null,
      phone: orderData.phone || null,
      address: orderData.address || null,
      paymentMethod: orderData.paymentMethod || 'cod',
      userId: session?.user?.email || null
    };

    // Lưu vào database
    const result = await db.collection('orders').insertOne(order);

    if (!result.acknowledged) {
      throw new Error('Failed to create order');
    }

    // Revalidate trang admin products và my-orders
    revalidatePath('/admin/products');
    revalidatePath('/my-orders');

    return NextResponse.json({
      ok: true,
      order: {
        ...order,
        _id: result.insertedId.toString()
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    const { db } = await connectToDatabase();
    let query = {};

    // Nếu có email từ query params, lọc theo email
    if (email) {
      query = { email };
    }
    // Nếu đã đăng nhập, lọc theo email của user
    else if (session?.user?.email) {
      query = { email: session.user.email };
    }

    const orders = await db.collection('orders')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      ok: true,
      orders: orders.map(order => ({
        ...order,
        _id: order._id.toString()
      }))
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Failed to fetch orders' },
      { status: 500 }
    );
  }
} 