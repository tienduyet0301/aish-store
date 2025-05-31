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

    // Kiểm tra quyền truy cập
    if (session?.user?.email !== order.email) {
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
  }
} 