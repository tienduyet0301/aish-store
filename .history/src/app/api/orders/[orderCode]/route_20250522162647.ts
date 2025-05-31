import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { orderCode: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { orderCode } = params;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

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

    // Cho phép admin xem tất cả đơn hàng
    const isAdmin = session?.user?.email === 'aish.aish.vn@gmail.com';
    if (isAdmin) {
      return NextResponse.json({
        ok: true,
        order: {
          ...order,
          _id: order._id.toString()
        }
      });
    }

    // Cho phép chủ đơn hàng xem đơn hàng của họ
    const isOwner = session?.user?.email === order.email || email === order.email;
    if (isOwner) {
      return NextResponse.json({
        ok: true,
        order: {
          ...order,
          _id: order._id.toString()
        }
      });
    }

    // Nếu không phải admin và không phải chủ đơn hàng
    return NextResponse.json(
      { ok: false, message: 'Unauthorized' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Failed to fetch order' },
      { status: 500 }
    );
  }
} 