import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { orderCode: string } }
) {
  let mongoClient = null;
  
  try {
    const session = await getServerSession(authOptions);
    const { orderCode } = params;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    console.log('Fetching order:', { orderCode, email, sessionEmail: session?.user?.email });

    if (!orderCode) {
      console.error('Missing order code');
      return NextResponse.json(
        { ok: false, message: 'Order code is required' },
        { status: 400 }
      );
    }

    const { db, client } = await connectToDatabase();
    mongoClient = client;
    
    // Find order by orderCode
    const order = await db.collection('orders').findOne({ orderCode });

    console.log('Found order:', order);

    if (!order) {
      console.error('Order not found:', orderCode);
      return NextResponse.json(
        { ok: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Allow admin to view all orders
    const isAdmin = session?.user?.email === 'aish.aish.vn@gmail.com';
    if (isAdmin) {
      console.log('Admin access granted');
      return NextResponse.json({
        ok: true,
        order: {
          ...order,
          _id: order._id.toString()
        }
      });
    }

    // Allow order owner to view their order
    const isOwner = session?.user?.email === order.email;
    const isOrderSuccessPage = email === order.email;

    if (!isOwner && !isOrderSuccessPage) {
      console.error('Unauthorized access attempt');
      return NextResponse.json(
        { ok: false, message: 'Unauthorized' },
        { status: 403 }
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
  } finally {
    if (mongoClient) {
      await mongoClient.close();
    }
  }
} 