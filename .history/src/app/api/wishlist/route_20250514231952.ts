import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';

// GET: Lấy danh sách wishlist của user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Lấy danh sách sản phẩm từ wishlist
    const wishlistIds = user.wishlist || [];
    const products = await db.collection('products')
      .find({ _id: { $in: wishlistIds.map((id: string) => new ObjectId(id)) } })
      .toArray();

    return NextResponse.json({ wishlist: products });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Thêm sản phẩm vào wishlist
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Kiểm tra sản phẩm có tồn tại không
    const product = await db.collection('products').findOne({ _id: new ObjectId(productId) });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Thêm sản phẩm vào wishlist của user
    await db.collection('users').updateOne(
      { email: session.user.email },
      { $addToSet: { wishlist: productId } }
    );

    return NextResponse.json({ message: 'Product added to wishlist' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Xóa sản phẩm khỏi wishlist
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Xóa sản phẩm khỏi wishlist của user
    await db.collection('users').updateOne(
      { email: session.user.email },
      { $pull: { wishlist: productId } }
    );

    return NextResponse.json({ message: 'Product removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 