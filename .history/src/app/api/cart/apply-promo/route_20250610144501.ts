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

    if (!promoCode || !cartItems || !Array.isArray(cartItems)) {
      return NextResponse.json(
        { ok: false, message: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Tìm mã giảm giá
    const promo = await db.collection('promoCodes').findOne({ code: promoCode });

    if (!promo) {
      return NextResponse.json(
        { ok: false, message: 'Mã giảm giá không tồn tại' },
        { status: 404 }
      );
    }

    if (!promo.isActive) {
      return NextResponse.json(
        { ok: false, message: 'Mã giảm giá đã bị vô hiệu hóa' },
        { status: 400 }
      );
    }

    // Kiểm tra ngày hết hạn
    if (promo.expiryDate && new Date() > new Date(promo.expiryDate)) {
      return NextResponse.json(
        { ok: false, message: 'Mã giảm giá đã hết hạn' },
        { status: 400 }
      );
    }

    // Kiểm tra yêu cầu đăng nhập
    if (promo.isLoginRequired && !session?.user?.email) {
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

      if (userUsageCount >= promo.perUserLimit) {
        return NextResponse.json(
          { ok: false, message: 'Bạn đã sử dụng hết số lần cho phép của mã giảm giá này' },
          { status: 400 }
        );
      }
    }

    // Tính toán giảm giá cho từng sản phẩm
    let totalDiscount = 0;
    console.log('Promo details:', {
      code: promo.code,
      scope: promo.scope,
      selectedProducts: promo.selectedProducts,
      type: promo.type,
      value: promo.value
    });

    const updatedCartItems = cartItems.map((item: any) => {
      let itemDiscount = 0;

      // Log chi tiết về item
      console.log('Processing item:', {
        itemId: item.id,
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      });

      // Kiểm tra xem sản phẩm có được áp dụng mã giảm giá không
      const isApplicable = promo.scope === 'all' || 
        (promo.scope === 'selected' && promo.selectedProducts?.includes(item.productId));

      console.log('Item applicability check:', { 
        itemId: item.id,
        productId: item.productId,
        scope: promo.scope, 
        selectedProducts: promo.selectedProducts,
        isApplicable,
        matches: {
          byProductId: promo.selectedProducts?.includes(item.productId)
        }
      });

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
        isPromoApplied: isApplicable
      };
    });

    console.log('Final results:', {
      totalDiscount,
      updatedItems: updatedCartItems.map(item => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        isPromoApplied: item.isPromoApplied,
        discount: item.discount
      }))
    });

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