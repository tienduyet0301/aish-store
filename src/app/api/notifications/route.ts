import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// GET - Lấy thông báo công khai (không cần đăng nhập)
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    // Lấy thông báo announcement đang active
    const announcement = await db.collection('notifications').findOne({ 
      type: 'announcement',
      isActive: true 
    });

    return NextResponse.json({
      ok: true,
      announcement: announcement?.content || '',
      isActive: announcement?.isActive || false
    });
  } catch (error) {
    console.error('Error fetching public notifications:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
} 