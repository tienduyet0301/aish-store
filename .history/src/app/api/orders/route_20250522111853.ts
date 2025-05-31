import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const orderData = await request.json();

    // Validate required fields
    const requiredFields = ['orderCode', 'fullName', 'email', 'phone', 'address', 'items', 'total', 'paymentMethod'];
    const missingFields = requiredFields.filter(field => !orderData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { ok: false, message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate items array
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json(
        { ok: false, message: 'Order must have at least one item' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Check if order code already exists
    const existingOrder = await db.collection('orders').findOne({ orderCode: orderData.orderCode });
    if (existingOrder) {
      return NextResponse.json(
        { ok: false, message: 'Order code already exists' },
        { status: 400 }
      );
    }

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

    // Tạo đơn hàng mới
    const order = {
      ...orderData,
      _id: new ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'pending',
      paymentStatus: 'pending',
      shippingStatus: 'pending'
    };

    // Lưu vào database
    const result = await db.collection('orders').insertOne(order);

    if (!result.acknowledged) {
      throw new Error('Failed to create order');
    }

    // Revalidate trang admin products
    revalidatePath('/admin/products');

    return NextResponse.json({
      ok: true,
      order: {
        ...order,
        _id: order._id.toString()
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
    const { searchParams } = new URL(request.url);
    const orderCode = searchParams.get('orderCode');

    if (!orderCode) {
      return NextResponse.json(
        { ok: false, message: 'Order code is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const order = await db.collection('orders').findOne({ orderCode });

    if (!order) {
      return NextResponse.json(
        { ok: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      order: {
        ...order,
        _id: order._id.toString()
      }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Failed to fetch order' },
      { status: 500 }
    );
  }
} 