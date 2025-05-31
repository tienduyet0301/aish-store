import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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