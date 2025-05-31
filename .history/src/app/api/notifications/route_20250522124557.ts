import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Fetch notifications
    const notifications = await db.collection('notifications').findOne({ type: 'announcement' });
    console.log('Found notifications:', notifications);

    // Fetch promo codes
    const promoCodes = await db.collection('notifications')
      .find({ type: 'promo', isActive: true })
      .toArray();
    console.log('Found promo codes:', promoCodes);

    return NextResponse.json({
      notifications,
      promoCodes
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
} 