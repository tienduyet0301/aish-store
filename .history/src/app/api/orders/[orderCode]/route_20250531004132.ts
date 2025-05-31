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

    try {
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
            _id: order._id.toString(),
            promoCode: order.promoCode ? {
              code: order.promoCode.code,
              type: order.promoCode.type,
              value: order.promoCode.value,
              maxAmount: order.promoCode.maxAmount || null
            } : null
          }
        });
      }

      // Allow order owner to view their order
      const isOwner = session?.user?.email === order.email;
      const isOrderSuccessPage = email === order.email;

      console.log('Access check:', { isOwner, isOrderSuccessPage, orderEmail: order.email });

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
          _id: order._id.toString(),
          promoCode: order.promoCode ? {
            code: order.promoCode.code,
            type: order.promoCode.type,
            value: order.promoCode.value,
            maxAmount: order.promoCode.maxAmount || null
          } : null
        }
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { 
        ok: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch order',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    if (mongoClient) {
      try {
        await mongoClient.close();
      } catch (closeError) {
        console.error('Error closing MongoDB connection:', closeError);
      }
    }
  }
} 