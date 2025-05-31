import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    console.log('Connected to database');

    // Lấy tất cả các mã giảm giá hiện tại
    const promoCodes = await db.collection('notifications')
      .find({ type: 'promo' })
      .toArray();

    console.log(`Found ${promoCodes.length} promo codes to update`);

    const updatedCodes = [];
    for (const promo of promoCodes) {
      // Chuyển đổi cấu trúc cũ sang cấu trúc mới
      const updateData = {
        promoType: 'fixed', // Mặc định là fixed cho các mã cũ
        value: promo.amount || 0, // Chuyển amount cũ thành value
        maxAmount: null, // Thêm trường mới
        isLoginRequired: false, // Thêm trường mới
        perUserLimit: 0, // Thêm trường mới
        usedByUsers: [], // Thêm trường mới
        usedCount: 0, // Thêm trường mới
        expiryDate: null, // Thêm trường mới
        updatedAt: new Date().toISOString()
      };

      // Cập nhật document
      await db.collection('notifications').updateOne(
        { _id: new ObjectId(promo._id) },
        { $set: updateData }
      );

      updatedCodes.push(promo.code);
    }

    return NextResponse.json({
      ok: true,
      message: `Successfully updated ${updatedCodes.length} promo codes`,
      updatedCodes
    });
  } catch (error) {
    console.error('Error updating promo structure:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to update promo structure' },
      { status: 500 }
    );
  }
} 