import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const session = await getServerSession(authOptions);
    const { code, totalAmount } = await request.json();

    if (!code || !totalAmount) {
      return NextResponse.json(
        { ok: false, message: 'Mã giảm giá và tổng tiền là bắt buộc' },
        { status: 400 }
      );
    }

    // Tìm mã giảm giá
    const promoCode = await db.collection('notifications').findOne({
      type: 'promo',
      code: code.toUpperCase(),
      isActive: true
    });

    if (!promoCode) {
      return NextResponse.json(
        { ok: false, message: 'Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa' },
        { status: 404 }
      );
    }

    // Kiểm tra ngày hết hạn
    if (promoCode.expiryDate && new Date(promoCode.expiryDate) < new Date()) {
      return NextResponse.json(
        { ok: false, message: 'Mã giảm giá đã hết hạn' },
        { status: 400 }
      );
    }

    // Kiểm tra yêu cầu đăng nhập
    if (promoCode.isLoginRequired && !session?.user?.email) {
      return NextResponse.json(
        { ok: false, message: 'Vui lòng đăng nhập để sử dụng mã giảm giá này' },
        { status: 401 }
      );
    }

    // Kiểm tra giới hạn sử dụng mỗi người dùng
    if (promoCode.perUserLimit > 0 && session?.user?.email) {
      const userUsageCount = promoCode.usedByUsers?.filter(
        (userId: string) => userId === session.user.email
      ).length || 0;

      if (userUsageCount >= promoCode.perUserLimit) {
        return NextResponse.json(
          { ok: false, message: 'Bạn đã sử dụng hết số lần cho phép của mã giảm giá này' },
          { status: 400 }
        );
      }
    }

    // Tính toán số tiền giảm giá
    let discountAmount = 0;
    if (promoCode.promoType === 'fixed') {
      discountAmount = promoCode.value;
    } else if (promoCode.promoType === 'percentage') {
      discountAmount = (totalAmount * promoCode.value) / 100;
      if (promoCode.maxAmount && discountAmount > promoCode.maxAmount) {
        discountAmount = promoCode.maxAmount;
      }
    }

    // Kiểm tra số tiền giảm giá không vượt quá tổng tiền
    if (discountAmount > totalAmount) {
      discountAmount = totalAmount;
    }

    return NextResponse.json({
      ok: true,
      discountAmount,
      promoCode: {
        id: promoCode._id.toString(),
        code: promoCode.code,
        type: promoCode.promoType,
        value: promoCode.value,
        maxAmount: promoCode.maxAmount,
        isLoginRequired: promoCode.isLoginRequired,
        perUserLimit: promoCode.perUserLimit,
        expiryDate: promoCode.expiryDate
      }
    });
  } catch (error) {
    console.error('Error applying promo code:', error);
    return NextResponse.json(
      { ok: false, message: 'Có lỗi xảy ra khi áp dụng mã giảm giá' },
      { status: 500 }
    );
  }
} 