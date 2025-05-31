import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateOrderCode } from '@/lib/utils';
import { ObjectId, MongoClient } from 'mongodb';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  let mongoClient: MongoClient | null = null;
  
  try {
    const session = await getServerSession(authOptions);
    const orderData = await req.json();
    
    console.log('Received order data:', orderData);

    // Validate items array
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      console.error('Invalid items array:', orderData.items);
      return NextResponse.json(
        { ok: false, message: 'Order must have at least one item' },
        { status: 400 }
      );
    }

    // Connect to MongoDB with transaction support
    const { db, client } = await connectToDatabase();
    mongoClient = client;

    // Start a session for transaction
    const dbSession = client.startSession();

    try {
      // Start transaction
      await dbSession.startTransaction();

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

      console.log('Creating order with data:', order);

      const result = await db.collection('orders').insertOne(order, { session: dbSession });

      if (!result.acknowledged) {
        console.error('Failed to insert order:', result);
        throw new Error('Failed to create order');
      }

      console.log('Order created successfully:', result.insertedId);

      // Cập nhật số lượng sản phẩm sau khi tạo đơn hàng thành công
      for (const item of orderData.items) {
        const product = await db.collection('products').findOne(
          { _id: new ObjectId(item.productId) },
          { session: dbSession }
        );

        if (!product) {
          console.error(`Product not found: ${item.productId}`);
          throw new Error(`Product ${item.productId} not found`);
        }

        // Cập nhật số lượng theo size
        const updateField = `quantity${item.size}`;
        const currentQuantity = product[updateField] || 0;
        const newQuantity = Math.max(0, currentQuantity - item.quantity);

        console.log(`Updating product ${item.productId} - Size ${item.size}:`, {
          currentQuantity,
          orderedQuantity: item.quantity,
          newQuantity
        });

        // Cập nhật số lượng và trạng thái outOfStock
        const updateResult = await db.collection('products').updateOne(
          { _id: new ObjectId(item.productId) },
          { 
            $set: { 
              [updateField]: newQuantity,
              [`outOfStock${item.size}`]: newQuantity === 0,
              updatedAt: new Date()
            }
          },
          { session: dbSession }
        );

        if (updateResult.modifiedCount === 0) {
          throw new Error(`Failed to update product ${item.productId}`);
        }

        // Kiểm tra nếu tất cả các size đều hết hàng
        const updatedProduct = await db.collection('products').findOne(
          { _id: new ObjectId(item.productId) },
          { session: dbSession }
        );

        if (!updatedProduct) {
          throw new Error(`Failed to fetch updated product: ${item.productId}`);
        }

        const allSizesOutOfStock = ['M', 'L', 'XL', 'Hat'].every(size => 
          (updatedProduct[`quantity${size}`] || 0) === 0
        );

        if (allSizesOutOfStock) {
          await db.collection('products').updateOne(
            { _id: new ObjectId(item.productId) },
            { 
              $set: { 
                outOfStock: true,
                updatedAt: new Date()
              }
            },
            { session: dbSession }
          );
        }

        // Revalidate trang chi tiết sản phẩm
        revalidatePath(`/${product.slug}`);
      }

      // Commit transaction
      await dbSession.commitTransaction();

      // Revalidate các trang liên quan
      revalidatePath('/products');
      revalidatePath('/admin/products');

      return NextResponse.json({
        ok: true,
        order: {
          ...order,
          _id: result.insertedId.toString()
        }
      });

    } catch (error) {
      // Rollback transaction nếu có lỗi
      await dbSession.abortTransaction();
      throw error;
    } finally {
      // End session
      await dbSession.endSession();
    }

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { ok: false, message: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    );
  } finally {
    // Close MongoDB connection
    if (mongoClient) {
      await mongoClient.close();
    }
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