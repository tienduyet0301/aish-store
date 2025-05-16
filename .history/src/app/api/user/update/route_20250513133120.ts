import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { firstName, lastName, birthDay, birthMonth, birthYear, email } = await request.json();

    const { db } = await connectToDatabase();
    
    // Kiểm tra xem email mới đã tồn tại chưa (nếu email thay đổi)
    if (email !== session.user.email) {
      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
      }
    }

    // Cập nhật thông tin người dùng
    const result = await db.collection('users').updateOne(
      { email: session.user.email },
      {
        $set: {
          firstName,
          lastName,
          birthDay,
          birthMonth,
          birthYear,
          email,
          updatedAt: new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 