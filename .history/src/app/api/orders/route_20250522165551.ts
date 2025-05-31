import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateOrderCode } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const orderData = await req.json();
    
    console.log('Received order data:', orderData);

    // Validate required fields
    const requiredFields = ['email', 'fullName', 'phone', 'address', 'ward', 'district', 'province', 'items', 'total'];
    const missingFields = requiredFields.filter(field => !orderData[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return NextResponse.json(
        { ok: false, message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate items array
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      console.error('Invalid items array:', orderData.items);
      return NextResponse.json(
        { ok: false, message: 'Order must have at least one item' },
        { status: 400 }
      );
    }

    // Validate total amount
    if (typeof orderData.total !== 'number' || orderData.total <= 0) {
      console.error('Invalid total amount:', orderData.total);
      return NextResponse.json(
        { ok: false, message: 'Invalid total amount' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const orderCode = generateOrderCode();

    // Tạo đơn hàng mới
    const order = {
      orderCode,
      items: orderData.items,
      total: orderData.total,
      status: 'pending',
      createdAt: new Date(),
      email: orderData.email,
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

    console.log('Creating order with data:', order);

    // Kiểm tra xem orderCode đã tồn tại chưa
    const existingOrder = await db.collection('orders').findOne({ orderCode });
    if (existingOrder) {
      console.error('Order code already exists:', orderCode);
      return NextResponse.json(
        { ok: false, message: 'Order code already exists' },
        { status: 400 }
      );
    }

    const result = await db.collection('orders').insertOne(order);

    if (!result.acknowledged) {
      console.error('Failed to insert order:', result);
      throw new Error('Failed to create order');
    }

    console.log('Order created successfully:', result.insertedId);

    // Verify the order was created
    const createdOrder = await db.collection('orders').findOne({ _id: result.insertedId });
    if (!createdOrder) {
      console.error('Order not found after creation');
      throw new Error('Order not found after creation');
    }

    return NextResponse.json({
      ok: true,
      order: {
        ...createdOrder,
        _id: createdOrder._id.toString()
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

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Chỉ cho phép xem đơn hàng khi đã đăng nhập
    if (!session?.user?.email) {
      return NextResponse.json(
        { ok: false, message: 'Unauthorized' },
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