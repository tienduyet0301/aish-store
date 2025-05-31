import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email || null; // Lấy email người dùng nếu đăng nhập

    if (!code || subtotal === undefined) {
      return NextResponse.json(
        { ok: false, message: 'Promo code and subtotal are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Tìm mã giảm giá trong collection promoCodes (hoặc tên collection của bạn)
    const promoCodeDoc = await db.collection('promoCodes').findOne({ code: code.toUpperCase() });

    if (!promoCodeDoc || !promoCodeDoc.isActive) {
      return NextResponse.json(
        { ok: false, message: 'Invalid or expired promo code' },
        { status: 400 }
      );
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
        const usedByUsers = promoCodeDoc.usedByUsers || [];
        const userUsageCount = usedByUsers.filter((email: string) => email === userEmail).length;

        if (userUsageCount >= promoCodeDoc.perUserLimit) {
            return NextResponse.json(
                { ok: false, message: 'Bạn đã sử dụng mã này' },
                { status: 400 }
            );
        }
    }
    
    // TODO: Thêm kiểm tra ngày hết hạn (expiryDate) và tổng số lần sử dụng (totalUsageLimit) nếu có

    // Tính toán số tiền giảm giá thực tế
    let calculatedAmount = 0;

    if (promoCodeDoc.type === 'fixed') {
      calculatedAmount = promoCodeDoc.value;
    } else if (promoCodeDoc.type === 'percentage') {
      calculatedAmount = subtotal * (promoCodeDoc.value / 100);
      // Áp dụng giới hạn tối đa nếu có
      if (promoCodeDoc.maxAmount !== undefined && promoCodeDoc.maxAmount !== null && calculatedAmount > promoCodeDoc.maxAmount) {
        calculatedAmount = promoCodeDoc.maxAmount;
      }
    }

    // Đảm bảo số tiền giảm giá không âm
    calculatedAmount = Math.max(0, calculatedAmount);

    return NextResponse.json({ 
      ok: true, 
      message: `Mã giảm giá ${calculatedAmount.toLocaleString('vi-VN')} VND đã được áp dụng!`, 
      promoCode: promoCodeDoc.code,
      promoAmount: calculatedAmount
    });

  } catch (error) {
    console.error('Error applying promo code:', error);
    return NextResponse.json(
      { ok: false, message: 'An error occurred while applying the promo code' },
      { status: 500 }
    );
  }
} 