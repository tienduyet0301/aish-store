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
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { ok: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const notifications = await db.collection('notifications').findOne({ type: 'announcement' });
    const promoCodes = await db.collection('promoCodes').find({}).toArray();

    return NextResponse.json({
      ok: true,
      announcement: notifications?.content || '',
      isAnnouncementActive: notifications?.isActive || false,
      promoCodes: promoCodes.map(code => ({
        ...code,
        _id: code._id.toString()
      }))
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
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
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { ok: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const data = await request.json();

    if (data.type === 'announcement') {
      if (data.action === 'update') {
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
      }
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
          type: data.type,
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
    console.error('Error handling notification:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to handle notification' },
      { status: 500 }
    );
  }
} 