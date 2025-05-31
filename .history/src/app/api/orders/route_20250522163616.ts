import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateOrderCode } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const orderData = await req.json();

    // Validate items array
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json(
        { error: 'Order must have at least one item' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const orderCode = generateOrderCode();

    // Tạo đơn hàng mới
    const order = {
      orderCode,
      items: orderData.items,
      totalAmount: orderData.totalAmount || orderData.total,
      status: 'pending',
      createdAt: new Date(),
      email: orderData.email || session?.user?.email || 'guest',
      userId: session?.user?.email || null,
      paymentStatus: 'pending',
      paymentMethod: orderData.paymentMethod || 'cod',
      // Thông tin giao hàng
      fullName: orderData.fullName,
      phone: orderData.phone,
      address: orderData.address,
      ward: orderData.ward,
      district: orderData.district,
      province: orderData.province,
      // Thông tin bổ sung
      note: orderData.note || null,
      shippingMethod: orderData.shippingMethod || 'standard'
    };

    const result = await db.collection('orders').insertOne(order);

    if (!result.acknowledged) {
      throw new Error('Failed to create order');
    }

    return NextResponse.json({
      ok: true,
      orderCode,
      order: {
        ...order,
        _id: result.insertedId
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Chỉ cho phép xem đơn hàng khi đã đăng nhập
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const query = { userId: session.user.email };

    const orders = await db.collection('orders')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      ok: true,
      orders
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
} 