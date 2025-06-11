import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { db } = await connectToDatabase();
    const { promoCode, cartItems } = await request.json();

    console.log('Applying promo code:', { promoCode, cartItems }); // Debug log

    if (!promoCode || !cartItems || !Array.isArray(cartItems)) {
      return NextResponse.json(
        { ok: false, message: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Tìm mã giảm giá
    const promo = await db.collection('promoCodes').findOne({ code: promoCode });
    console.log('Found promo code:', promo); // Debug log

    if (!promo) {
      console.log('Promo code not found:', promoCode); // Debug log
      return NextResponse.json(
        { ok: false, message: 'Mã giảm giá không tồn tại' },
        { status: 404 }
      );
    }

    if (!promo.isActive) {
      console.log('Promo code is inactive'); // Debug log
      return NextResponse.json(
        { ok: false, message: 'Mã giảm giá đã bị vô hiệu hóa' },
        { status: 400 }
      );
    }

    // Kiểm tra ngày hết hạn
    if (promo.expiryDate) {
      const expiryDate = new Date(promo.expiryDate);
      const now = new Date();
      console.log('Checking expiry date:', { expiryDate, now }); // Debug log
      
      if (now > expiryDate) {
        console.log('Promo code has expired'); // Debug log
        return NextResponse.json(
          { ok: false, message: 'Mã giảm giá đã hết hạn' },
          { status: 400 }
        );
      }
    }

    // Kiểm tra yêu cầu đăng nhập
    if (promo.isLoginRequired && !session?.user?.email) {
      console.log('Login required but no session'); // Debug log
      return NextResponse.json(
        { ok: false, message: 'Vui lòng đăng nhập để sử dụng mã giảm giá này' },
        { status: 401 }
      );
    }

    // Kiểm tra giới hạn sử dụng cho mỗi người dùng
    if (promo.isLoginRequired && session?.user?.email && promo.perUserLimit > 0) {
      const userEmail = session.user.email;
      const userUsageCount = promo.usedByUsers?.filter(
        (user: { email: string; count: number }) => user.email === userEmail
      ).reduce((total: number, user: { count: number }) => total + user.count, 0) || 0;

      console.log('Checking user limit:', { userEmail, userUsageCount, perUserLimit: promo.perUserLimit }); // Debug log

      if (userUsageCount >= promo.perUserLimit) {
        return NextResponse.json(
          { ok: false, message: 'Bạn đã sử dụng hết số lần cho phép của mã giảm giá này' },
          { status: 400 }
        );
      }
    }

    // Tính toán giảm giá cho từng sản phẩm
    let totalDiscount = 0;
    const updatedCartItems = cartItems.map((item: any) => {
      let itemDiscount = 0;

      // Kiểm tra xem sản phẩm có được áp dụng mã giảm giá không
      const isApplicable = promo.scope === 'all' || 
        (promo.scope === 'selected' && 
          (promo.selectedProducts?.includes(item.id) || 
           promo.selectedProducts?.includes(item.productId)));

      console.log('Checking item applicability:', { 
        itemId: item.id,
        productId: item.productId,
        scope: promo.scope, 
        selectedProducts: promo.selectedProducts,
        isApplicable 
      }); // Debug log

      if (isApplicable) {
        if (promo.type === 'fixed') {
          itemDiscount = Math.min(promo.value, item.price * item.quantity);
        } else {
          const percentageDiscount = (item.price * item.quantity * promo.value) / 100;
          itemDiscount = promo.maxAmount 
            ? Math.min(percentageDiscount, promo.maxAmount)
            : percentageDiscount;
        }
      }

      totalDiscount += itemDiscount;
      return {
        ...item,
        discount: itemDiscount,
        isPromoApplied: isApplicable // Thêm flag để biết sản phẩm có được áp dụng mã giảm giá không
      };
    });

    console.log('Applied discounts:', { updatedCartItems, totalDiscount }); // Debug log

    return NextResponse.json({
      ok: true,
      message: 'Áp dụng mã giảm giá thành công',
      cartItems: updatedCartItems,
      totalDiscount
    });
  } catch (error) {
    console.error('Error applying promo code:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to apply promo code' },
      { status: 500 }
    );
  }
} 