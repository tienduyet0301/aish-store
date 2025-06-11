import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

// GET - Lấy thông báo và mã giảm giá
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session in GET:', session);

    if (!session?.user?.email) {
      console.log('No session or email found');
      return NextResponse.json(
        { ok: false, message: 'Unauthorized - No session' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ email: session.user.email });
    console.log('User from DB:', user);
    console.log('Session user role:', session.user.role);
    console.log('DB user role:', user?.role);

    // Kiểm tra role từ session (không phân biệt chữ hoa/thường)
    const isAdmin = session.user.role?.toLowerCase() === 'admin';
    console.log('Is admin check:', isAdmin);

    if (!isAdmin) {
      console.log('User is not admin. Session role:', session.user.role);
      return NextResponse.json(
        { ok: false, message: 'Unauthorized - Not admin' },
        { status: 401 }
      );
    }

    const notifications = await db.collection('notifications').findOne({ type: 'announcement' });
    const promoCodes = await db.collection('promoCodes').find({}).toArray();

    return NextResponse.json({
      ok: true,
      notifications: notifications ? [notifications] : [],
      promoCodes: promoCodes.map(code => ({
        ...code,
        _id: code._id.toString()
      }))
    });
  } catch (error) {
    console.error('Error in GET notifications:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST - Cập nhật thông báo hoặc mã giảm giá
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session in POST:', session);

    if (!session?.user?.email) {
      console.log('No session or email found in POST');
      return NextResponse.json(
        { ok: false, message: 'Unauthorized - No session' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ email: session.user.email });
    console.log('User from DB in POST:', user);
    console.log('Session user role in POST:', session.user.role);
    console.log('DB user role in POST:', user?.role);

    // Kiểm tra role từ session (không phân biệt chữ hoa/thường)
    const isAdmin = session.user.role?.toLowerCase() === 'admin';
    console.log('Is admin check in POST:', isAdmin);

    if (!isAdmin) {
      console.log('User is not admin in POST. Session role:', session.user.role);
      return NextResponse.json(
        { ok: false, message: 'Unauthorized - Not admin' },
        { status: 401 }
      );
    }

    const data = await request.json();
    console.log('Request data:', data);

    if (data.type === 'announcement') {
      await db.collection('notifications').updateOne(
        { type: 'announcement' },
        {
          $set: {
            content: data.content,
            isActive: data.isActive,
            updatedAt: new Date().toISOString()
          }
        },
        { upsert: true }
      );
    } else if (data.type === 'promo') {
      if (data.action === 'add') {
        const existingCode = await db.collection('promoCodes').findOne({ code: data.code });
        if (existingCode) {
          return NextResponse.json(
            { ok: false, message: 'Mã giảm giá đã tồn tại' },
            { status: 400 }
          );
        }

        const promoCode = {
          code: data.code,
          type: data.promoType,
          value: data.value,
          maxAmount: data.maxAmount,
          isActive: true,
          isLoginRequired: data.isLoginRequired || false,
          perUserLimit: data.perUserLimit || 0,
          usedByUsers: [],
          usedCount: 0,
          scope: data.scope || 'all',
          selectedProducts: data.selectedProducts || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          expiryDate: data.expiryDate
        };

        console.log('Inserting promo code:', promoCode);
        await db.collection('promoCodes').insertOne(promoCode);
      } else if (data.action === 'toggle') {
        await db.collection('promoCodes').updateOne(
          { _id: new ObjectId(data.id) },
          {
            $set: {
              isActive: data.isActive,
              updatedAt: new Date().toISOString()
            }
          }
        );
      } else if (data.action === 'delete') {
        await db.collection('promoCodes').deleteOne({ _id: new ObjectId(data.id) });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error in POST notifications:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to handle notification' },
      { status: 500 }
    );
  }
} 