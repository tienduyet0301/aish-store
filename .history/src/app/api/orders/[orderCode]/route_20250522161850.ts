import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { orderCode: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { orderCode } = params;

    if (!orderCode) {
      return NextResponse.json(
        { error: 'Order code is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const order = await db.collection('orders').findOne({ orderCode });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Cho phép admin xem tất cả đơn hàng
    const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL;
    if (isAdmin) {
      return NextResponse.json({
        ok: true,
        order: {
          ...order,
          _id: order._id.toString()
        }
      });
    }

    // Cho phép chủ đơn hàng xem đơn hàng của mình
    // Nếu đã đăng nhập, kiểm tra email
    if (session?.user?.email && session.user.email === order.email) {
      return NextResponse.json({
        ok: true,
        order: {
          ...order,
          _id: order._id.toString()
        }
      });
    }

    // Nếu chưa đăng nhập, kiểm tra email từ query params
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    if (email && email === order.email) {
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
      { error: 'Unauthorized' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
} 