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

    console.log('Fetching order:', { orderCode, email, sessionEmail: session?.user?.email });

    if (!orderCode) {
      console.error('Missing order code');
      return NextResponse.json(
        { ok: false, message: 'Order code is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Tìm đơn hàng theo mã đơn hàng và email
    const order = await db.collection('orders').findOne({
      orderCode,
      email: email || { $exists: true } // Nếu có email thì tìm theo email, không thì tìm tất cả
    });

    console.log('Found order:', order);

    if (!order) {
      console.error('Order not found:', orderCode);
      return NextResponse.json(
        { ok: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Cho phép admin xem tất cả đơn hàng
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

    // Cho phép chủ đơn hàng xem đơn hàng của họ
    const isOwner = session?.user?.email === order.userId;
    const isOrderSuccessPage = email === order.email; // Cho phép xem trong trang order success

    console.log('Access check:', { isOwner, isOrderSuccessPage, orderEmail: order.email, providedEmail: email });

    if (isOwner || isOrderSuccessPage) {
      console.log('Access granted');
      return NextResponse.json({
        ok: true,
        order: {
          ...order,
          _id: order._id.toString()
        }
      });
    }

    // Nếu không phải admin và không phải chủ đơn hàng
    console.error('Unauthorized access attempt');
    return NextResponse.json(
      { ok: false, message: 'Unauthorized' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to fetch order' },
      { status: 500 }
    );
  }
} 