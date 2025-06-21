import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// GET - Lấy danh sách mã giảm giá đang hoạt động
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    // Lấy các mã giảm giá đang hoạt động và chưa hết hạn (nếu có expiryDate)
    const now = new Date().toISOString();
    const promoCodes = await db.collection('promoCodes').find({
      isActive: true,
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: null },
        { expiryDate: { $gte: now } }
      ]
    }).toArray();

    return NextResponse.json({
      ok: true,
      promoCodes: promoCodes.map(code => ({
        ...code,
        _id: code._id.toString()
      }))
    });
  } catch (error) {
    console.error('Error in GET vouchers:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to fetch vouchers' },
      { status: 500 }
    );
  }
} 