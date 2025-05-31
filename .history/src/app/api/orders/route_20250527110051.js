import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request) {
  try {
    const { db } = await connectToDatabase();
    const orderData = await request.json();
    
    const result = await db.collection('orders').insertOne({
      ...orderData,
      createdAt: new Date(),
      status: 'pending'
    });

    return NextResponse.json({ 
      ok: true, 
      message: 'Order created successfully',
      orderId: result.insertedId 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to create order', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const orders = await db.collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ 
      ok: true, 
      orders 
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to fetch orders', error: error.message },
      { status: 500 }
    );
  }
} 