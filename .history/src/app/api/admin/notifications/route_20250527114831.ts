import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Lấy thông báo và mã giảm giá
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Kiểm tra quyền admin
    if (session?.user?.email !== 'aish.aish.vn@gmail.com') {
      return NextResponse.json(
        { ok: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();

    // Lấy danh sách thông báo
    const notifications = await db.collection('notifications')
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      ok: true,
      notifications: notifications.map(notification => ({
        ...notification,
        _id: notification._id.toString()
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
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Kiểm tra quyền admin
    if (session?.user?.email !== 'aish.aish.vn@gmail.com') {
      return NextResponse.json(
        { ok: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const notificationData = await req.json();
    const { db } = await connectToDatabase();

    // Tạo thông báo mới
    const result = await db.collection('notifications').insertOne({
      ...notificationData,
      createdAt: new Date(),
      read: false
    });

    return NextResponse.json({
      ok: true,
      notification: {
        ...notificationData,
        _id: result.insertedId.toString(),
        createdAt: new Date(),
        read: false
      }
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to create notification' },
      { status: 500 }
    );
  }
} 