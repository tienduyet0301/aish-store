import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateOrderCode } from '@/lib/utils';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const orderData = await req.json();
    
    console.log('Received order data:', JSON.stringify(orderData, null, 2));

    // Validate items array
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      console.error('Invalid items array:', orderData.items);
      return NextResponse.json(
        { ok: false, message: 'Order must have at least one item' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const orderCode = generateOrderCode();

    // Tạo đơn hàng mới
    const order = {
      orderCode,
      items: orderData.items,
      total: orderData.total,
      status: 'pending',
      createdAt: new Date(),
      email: orderData.email,
      userId: session?.user?.email || null,
      paymentStatus: 'pending',
      paymentMethod: orderData.paymentMethod || 'cod',
      // Thông tin giao hàng
      fullName: orderData.fullName,
      phone: orderData.phone,
      address: orderData.address,
      ward: orderData.ward,
      district: orderData.district,
      province: orderData.province,
      // Thông tin bổ sung
      note: orderData.note || null,
      shippingMethod: orderData.shippingMethod || 'standard'
    };

    console.log('Creating order with data:', JSON.stringify(order, null, 2));

    const result = await db.collection('orders').insertOne(order);

    if (!result.acknowledged) {
      console.error('Failed to insert order:', result);
      throw new Error('Failed to create order');
    }

    console.log('Order created successfully:', result.insertedId);

    // Cập nhật số lượng sản phẩm sau khi tạo đơn hàng thành công
    for (const item of orderData.items) {
      console.log('Processing item:', JSON.stringify(item, null, 2));
      
      if (!item.productId) {
        console.error('Missing productId in item:', item);
        continue;
      }

      const product = await db.collection('products').findOne({ 
        _id: new ObjectId(item.productId) 
      });

      if (!product) {
        console.error(`Product not found: ${item.productId}`);
        continue;
      }

      console.log('Found product:', JSON.stringify(product, null, 2));

      // Cập nhật số lượng theo size
      const updateField = `quantity${item.size}`;
      const currentQuantity = product[updateField] || 0;
      const newQuantity = Math.max(0, currentQuantity - item.quantity);

      console.log(`Updating product ${item.productId} - Size ${item.size}:`, {
        currentQuantity,
        orderedQuantity: item.quantity,
        newQuantity,
        updateField
      });

      const updateResult = await db.collection('products').updateOne(
        { _id: new ObjectId(item.productId) },
        { 
          $set: { 
            [updateField]: newQuantity,
            updatedAt: new Date()
          }
        }
      );

      console.log('Update result:', JSON.stringify(updateResult, null, 2));

      // Verify the update
      const updatedProduct = await db.collection('products').findOne({ 
        _id: new ObjectId(item.productId) 
      });
      console.log('Product after update:', JSON.stringify(updatedProduct, null, 2));
    }

    // Revalidate các trang liên quan để cập nhật cache
    revalidatePath('/products');
    revalidatePath('/admin/products');
    revalidatePath(`/products/${orderData.items[0]?.productId}`);

    return NextResponse.json({
      ok: true,
      order: {
        ...order,
        _id: result.insertedId.toString()
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Chỉ cho phép xem đơn hàng khi đã đăng nhập
    if (!session?.user?.email) {
      return NextResponse.json(
        { ok: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const query = { userId: session.user.email };

    const orders = await db.collection('orders')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      ok: true,
      orders: orders.map(order => ({
        ...order,
        _id: order._id.toString()
      }))
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Failed to fetch orders' },
      { status: 500 }
    );
  }
} 