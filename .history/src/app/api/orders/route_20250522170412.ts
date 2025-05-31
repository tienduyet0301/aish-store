import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateOrderCode } from '@/lib/utils';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const orderData = await request.json();

    console.log('Received order data:', orderData);

    // Validate required fields
    if (!orderData.items || orderData.items.length === 0) {
      console.error('Invalid items array');
      return NextResponse.json(
        { ok: false, message: 'Order must have at least one item' },
        { status: 400 }
      );
    }

    // Validate other required fields
    const requiredFields = ['email', 'fullName', 'phone', 'address', 'ward', 'district', 'province', 'total'];
    const missingFields = requiredFields.filter(field => !orderData[field]);
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return NextResponse.json(
        { ok: false, message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate total
    if (typeof orderData.total !== 'number' || orderData.total <= 0) {
      console.error('Invalid total amount');
      return NextResponse.json(
        { ok: false, message: 'Invalid order total' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Check if orderCode already exists
    const orderCode = generateOrderCode();
    const existingOrder = await db.collection('orders').findOne({ orderCode });
    if (existingOrder) {
      console.error('Order code already exists:', orderCode);
      return NextResponse.json(
        { ok: false, message: 'Failed to create order. Please try again.' },
        { status: 500 }
      );
    }

    // Create order object
    const order = {
      orderCode,
      items: orderData.items,
      total: orderData.total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      userId: session?.user?.email || null,
      email: orderData.email,
      fullName: orderData.fullName,
      phone: orderData.phone,
      address: orderData.address,
      ward: orderData.ward,
      district: orderData.district,
      province: orderData.province,
      paymentMethod: orderData.paymentMethod
    };

    console.log('Creating order:', order);

    // Start a session for transaction
    const session = await db.client.startSession();
    try {
      await session.withTransaction(async () => {
        // Insert order
        const result = await db.collection('orders').insertOne(order, { session });
        console.log('Order created with ID:', result.insertedId);

        // Update product quantities
        for (const item of orderData.items) {
          const updateResult = await db.collection('products').updateOne(
            { 
              _id: new ObjectId(item.id),
              'sizes.size': item.size,
              'sizes.quantity': { $gte: item.quantity }
            },
            { 
              $inc: { 'sizes.$.quantity': -item.quantity }
            },
            { session }
          );

          if (updateResult.matchedCount === 0) {
            throw new Error(`Insufficient stock for product ${item.id} with size ${item.size}`);
          }

          console.log(`Updated quantity for product ${item.id}, size ${item.size}`);
        }
      });

      return NextResponse.json({
        ok: true,
        order: {
          ...order,
          _id: result.insertedId.toString()
        }
      });
    } catch (error) {
      console.error('Transaction failed:', error);
      return NextResponse.json(
        { ok: false, message: error instanceof Error ? error.message : 'Failed to create order' },
        { status: 500 }
      );
    } finally {
      await session.endSession();
    }
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