import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(req: Request) {
  try {
    const { code, totalAmount } = await req.json();
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email || null;

    if (!code || totalAmount === undefined) {
      return NextResponse.json(
        { ok: false, message: 'Promo code and total amount are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const promoCodeDoc = await db.collection('promoCodes')
      .findOne({ code: code.toUpperCase() });

    if (!promoCodeDoc || !promoCodeDoc.isActive) {
      return NextResponse.json(
        { ok: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' },
        { status: 400 }
      );
    }

    // Kiểm tra ngày hết hạn
    if (promoCodeDoc.expiryDate) {
      const expiryDate = new Date(promoCodeDoc.expiryDate);
      if (expiryDate < new Date()) {
        return NextResponse.json(
          { ok: false, message: 'Mã giảm giá đã hết hạn sử dụng' },
          { status: 400 }
        );
      }
    }

    // Kiểm tra yêu cầu đăng nhập
    if (promoCodeDoc.isLoginRequired && !userEmail) {
       return NextResponse.json(
           { ok: false, message: 'Vui lòng đăng nhập để sử dụng mã này' },
           { status: 401 }
       );
    }

    // Kiểm tra giới hạn sử dụng trên mỗi người dùng
    if (promoCodeDoc.perUserLimit > 0 && userEmail) {
        // Kiểm tra số lần sử dụng trong collection orders
        const userUsageCountInOrders = await db.collection('orders').countDocuments({
            $or: [{ userId: userEmail }, { email: userEmail }],
            "promoCode.id": promoCodeDoc._id.toString()
        });

        if (userUsageCountInOrders >= promoCodeDoc.perUserLimit) {
            return NextResponse.json(
                { ok: false, message: `Bạn đã sử dụng mã này quá số lần cho phép (${promoCodeDoc.perUserLimit} lần)` },
                { status: 400 }
            );
        }
    }

    // Kiểm tra tổng số lần sử dụng nếu có limit
    if (promoCodeDoc.totalUsageLimit && promoCodeDoc.usedCount >= promoCodeDoc.totalUsageLimit) {
       return NextResponse.json(
           { ok: false, message: 'Mã giảm giá đã hết lượt sử dụng' },
           { status: 400 }
       );
    }

    // Tính toán số tiền giảm giá thực tế
    let calculatedAmount = 0;

    if (promoCodeDoc.type === 'fixed') {
      calculatedAmount = promoCodeDoc.value;
    } else if (promoCodeDoc.type === 'percentage') {
      calculatedAmount = totalAmount * (promoCodeDoc.value / 100);
      // Áp dụng giới hạn tối đa nếu có
      if (promoCodeDoc.maxAmount !== undefined && promoCodeDoc.maxAmount !== null && calculatedAmount > promoCodeDoc.maxAmount) {
        calculatedAmount = promoCodeDoc.maxAmount;
      }
    }

    // Đảm bảo số tiền giảm giá không âm và không lớn hơn tổng tiền
    calculatedAmount = Math.max(0, calculatedAmount);
    calculatedAmount = Math.min(calculatedAmount, totalAmount);

    // Trả về thông tin mã giảm giá đầy đủ
    return NextResponse.json({
      ok: true,
      message: `Mã giảm giá ${calculatedAmount.toLocaleString('vi-VN')} VND đã được áp dụng!`,
      discountAmount: calculatedAmount,
      promoCode: {
        id: promoCodeDoc._id.toString(),
        code: promoCodeDoc.code,
        type: promoCodeDoc.type,
        value: promoCodeDoc.value,
        maxAmount: promoCodeDoc.maxAmount || null,
        isLoginRequired: Boolean(promoCodeDoc.isLoginRequired),
        perUserLimit: Number(promoCodeDoc.perUserLimit) || 0,
        expiryDate: promoCodeDoc.expiryDate ? new Date(promoCodeDoc.expiryDate).toISOString() : null
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