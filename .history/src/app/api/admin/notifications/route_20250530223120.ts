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
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const notifications = await db.collection('notifications').find({}).toArray();

    return NextResponse.json({
      ok: true,
      notifications: notifications.map(notif => ({
        ...notif,
        _id: notif._id.toString()
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
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const data = await request.json();
    const { type, action, id, content, isActive, code, promoType, promoValue, promoMaxAmount, isLoginRequired, perUserLimit, expiryDate } = data;

    if (type === 'announcement') {
      // Xử lý thông báo
      const existingAnnouncement = await db.collection('notifications').findOne({ type: 'announcement' });
      
      if (existingAnnouncement) {
        await db.collection('notifications').updateOne(
          { type: 'announcement' },
          { $set: { content, isActive, updatedAt: new Date().toISOString() } }
        );
      } else {
        await db.collection('notifications').insertOne({
          type: 'announcement',
          content,
          isActive,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    } else if (type === 'promo') {
      if (action === 'add') {
        // Kiểm tra mã giảm giá đã tồn tại chưa
        const existingPromo = await db.collection('notifications').findOne({
          type: 'promo',
          code: code.toUpperCase()
        });

        if (existingPromo) {
          return NextResponse.json(
            { ok: false, message: 'Mã giảm giá đã tồn tại' },
            { status: 400 }
          );
        }

        // Thêm mã giảm giá mới
        await db.collection('notifications').insertOne({
          type: 'promo',
          code: code.toUpperCase(),
          promoType,
          value: promoValue,
          maxAmount: promoMaxAmount,
          isLoginRequired: isLoginRequired || false,
          perUserLimit: perUserLimit || 0,
          usedByUsers: [],
          usedCount: 0,
          expiryDate: expiryDate || null,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else if (action === 'toggle') {
        // Cập nhật trạng thái kích hoạt
        await db.collection('notifications').updateOne(
          { _id: new ObjectId(id) },
          { $set: { isActive, updatedAt: new Date().toISOString() } }
        );
      } else if (action === 'delete') {
        // Xóa mã giảm giá
        await db.collection('notifications').deleteOne({ _id: new ObjectId(id) });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error handling notification:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to process notification' },
      { status: 500 }
    );
  }
} 