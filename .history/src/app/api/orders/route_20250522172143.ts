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
    
    console.log('Received order data:', JSON.stringify(orderData, null, 2));

    // Validate items array
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      console.error('Invalid items array:', orderData.items);
      return NextResponse.json(
        { ok: false, message: 'Order must have at least one item' },
        { status: 400 }
      );
    }

    // Validate each item in the order
    for (const item of orderData.items) {
      if (!item.id) {
        console.error('Item missing id:', item);
        return NextResponse.json(
          { ok: false, message: 'Each item must have an id' },
          { status: 400 }
        );
      }
      if (!item.size) {
        console.error('Item missing size:', item);
        return NextResponse.json(
          { ok: false, message: 'Each item must have a size' },
          { status: 400 }
        );
      }
      if (!item.quantity || item.quantity <= 0) {
        console.error('Item missing or invalid quantity:', item);
        return NextResponse.json(
          { ok: false, message: 'Each item must have a valid quantity' },
          { status: 400 }
        );
      }
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

    console.log('Creating order with data:', JSON.stringify(order, null, 2));

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
          console.log('Updating quantity for item:', JSON.stringify(item, null, 2));
          
          // First, find the product to check its current structure
          const product = await db.collection('products').findOne(
            { _id: new ObjectId(item.id) },
            { session: dbSession }
          );

          if (!product) {
            throw new Error(`Product ${item.id} not found`);
          }

          console.log('Found product:', JSON.stringify(product, null, 2));

          // Find the size index in the sizes array
          const sizeIndex = product.sizes.findIndex(s => s.size === item.size);
          if (sizeIndex === -1) {
            throw new Error(`Size ${item.size} not found for product ${item.id}`);
          }

          // Check if there's enough quantity
          if (product.sizes[sizeIndex].quantity < item.quantity) {
            throw new Error(`Insufficient stock for product ${item.id} with size ${item.size}`);
          }

          // Update the quantity
          const updateResult = await db.collection('products').updateOne(
            { 
              _id: new ObjectId(item.id),
              [`sizes.${sizeIndex}.size`]: item.size
            },
            { 
              $inc: { [`sizes.${sizeIndex}.quantity`]: -item.quantity }
            },
            { session: dbSession }
          );

          console.log('Update result:', updateResult);

          if (updateResult.matchedCount === 0) {
            throw new Error(`Failed to update quantity for product ${item.id} with size ${item.size}`);
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