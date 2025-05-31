import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateOrderCode } from '@/lib/utils';
import { ObjectId, MongoClient } from 'mongodb';

export async function POST(req: Request) {
  let mongoClient: MongoClient | null = null;
  
  try {
    const session = await getServerSession(authOptions);
    const orderData = await req.json();
    
    console.log('Received order data:', orderData);

    // Validate items array
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      console.error('Invalid items array:', orderData.items);
      return NextResponse.json(
        { ok: false, message: 'Order must have at least one item' },
        { status: 400 }
      );
    }

    const { db, client } = await connectToDatabase();
    mongoClient = client;
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

    // Start a session for transaction
    const dbSession = await client.startSession();
    let insertedId: string | undefined;

    try {
      await dbSession.withTransaction(async () => {
        // Insert order
        const result = await db.collection('orders').insertOne(order, { session: dbSession });
        console.log('Order created with ID:', result.insertedId);
        insertedId = result.insertedId.toString();

        // Update product quantities
        for (const item of orderData.items) {
          console.log('Updating quantity for item:', item);
          
          // Find the product and update the specific size quantity
          const updateResult = await db.collection('products').updateOne(
            { 
              _id: new ObjectId(item.id),
              'sizes.size': item.size,
              'sizes.quantity': { $gte: item.quantity }
            },
            { 
              $inc: { 'sizes.$.quantity': -item.quantity }
            },
            { session: dbSession }
          );

          if (updateResult.matchedCount === 0) {
            throw new Error(`Insufficient stock for product ${item.id} with size ${item.size}`);
          }

          console.log(`Updated quantity for product ${item.id}, size ${item.size}`);
        }
      });

      if (!insertedId) {
        throw new Error('Failed to create order');
      }

      return NextResponse.json({
        ok: true,
        order: {
          ...order,
          _id: insertedId
        }
      });

    } catch (error) {
      console.error('Transaction failed:', error);
      return NextResponse.json(
        { ok: false, message: error instanceof Error ? error.message : 'Failed to create order' },
        { status: 500 }
      );
    } finally {
      await dbSession.endSession();
    }

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    );
  } finally {
    if (mongoClient) {
      await mongoClient.close();
    }
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