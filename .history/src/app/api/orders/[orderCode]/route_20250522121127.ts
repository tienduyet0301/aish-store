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

    // Nếu không có session, trả về lỗi 401
    if (!session) {
      return NextResponse.json(
        { ok: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Kiểm tra quyền truy cập - cho phép admin hoặc chủ đơn hàng
    const isAdmin = session.user?.email === 'aish.aish.vn@gmail.com';
    const isOwner = session.user?.email === order.email;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { ok: false, message: 'Forbidden' },
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
  }
} 