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

    // Check if promoCode is a JSON string and parse it
    let promoCodeObject = null;
    if (orderData.promoCode) {
        if (typeof orderData.promoCode === 'string') {
            try {
                promoCodeObject = JSON.parse(orderData.promoCode);
            } catch (e) {
                console.error('Failed to parse promoCode JSON string:', e);
                // Keep it null if parsing fails
            }
        } else if (typeof orderData.promoCode === 'object') {
            promoCodeObject = orderData.promoCode;
        }
    }

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

      // Validate items array and check product quantities before creating order
      for (const item of orderData.items) {
        const product = await db.collection('products').findOne(
          { _id: new ObjectId(item.productId) },
          { session: dbSession }
        );

        if (!product) {
          throw new Error(`Product not found with ID: ${item.productId}`);
        }

        const quantityField = `quantity${item.size}`;
        const currentQuantity = product[quantityField] || 0;

        if (currentQuantity < item.quantity) {
          throw new Error(`Insufficient quantity for product ${product.name} (Size ${item.size}). Available: ${currentQuantity}`);
        }
      }

      // --- Promo Code Validation and Update in Transaction ---
      if (orderData.promoCode && typeof orderData.promoCode === 'object' && orderData.promoCode.id) {
          const promoId = new ObjectId(promoCodeObject.id);
          const userEmail = session?.user?.email || orderData.email;

          // Fetch the latest promo code document within the transaction
          const promoCodeDoc = await db.collection('notifications').findOne(
              { _id: promoId, type: 'promo' },
              { session: dbSession }
          );

          if (!promoCodeDoc || !promoCodeDoc.isActive) {
              throw new Error('Mã giảm giá không hợp lệ hoặc đã hết hạn');
          }

          // Re-check validation conditions
          // Kiểm tra ngày hết hạn
          if (promoCodeDoc.expiryDate) {
            const expiryDate = new Date(promoCodeDoc.expiryDate);
            if (expiryDate < new Date()) {
              throw new Error('Mã giảm giá đã hết hạn sử dụng');
            }
          }

          // Kiểm tra yêu cầu đăng nhập
          if (promoCodeDoc.isLoginRequired && !userEmail) {
             throw new Error('Vui lòng đăng nhập để sử dụng mã này');
          }

          // Kiểm tra giới hạn sử dụng trên mỗi người dùng
          if (promoCodeDoc.perUserLimit > 0 && userEmail) {
              // Query orders collection within the transaction to count user's previous orders with this promo code
              const userUsageCountInOrders = await db.collection('orders').countDocuments(
                  {
                      $or: [{ userId: userEmail }, { email: userEmail }],
                      "promoCode.id": promoCodeObject.id,
                  },
                  { session: dbSession }
              );

              if (userUsageCountInOrders >= promoCodeDoc.perUserLimit) {
                  throw new Error(`Bạn đã sử dụng mã này quá số lần cho phép (${promoCodeDoc.perUserLimit} lần)`);
              }
          }

          // Kiểm tra tổng số lần sử dụng nếu có limit
          if (promoCodeDoc.totalUsageLimit && promoCodeDoc.usedCount >= promoCodeDoc.totalUsageLimit) {
             throw new Error('Mã giảm giá đã hết lượt sử dụng.');
          }

          // Update promo code usage within the transaction
          const updateFields: any = { $inc: { usedCount: 1 } };
          if (userEmail) {
              updateFields.$push = { usedByUsers: userEmail };
          }

          await db.collection('notifications').updateOne(
              { _id: promoId },
              updateFields,
              { session: dbSession }
          );
      }
      // --- End Promo Code Validation and Update in Transaction ---

      const orderCode = generateOrderCode();

      // Create new order
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
        // Shipping information
        fullName: orderData.fullName,
        phone: orderData.phone,
        address: orderData.address,
        ward: orderData.ward,
        district: orderData.district,
        province: orderData.province,
        // Additional information
        note: orderData.note || null,
        shippingMethod: orderData.shippingMethod || 'standard',
        // Promo code information - use the parsed object for saving
        promoCode: promoCodeObject, // Save the parsed object
        promoAmount: orderData.promoAmount || 0,
        subtotal: orderData.subtotal || orderData.total
      };

      console.log('Creating order with data:', order);

      const result = await db.collection('orders').insertOne(order, { session: dbSession });

      if (!result.acknowledged) {
        console.error('Failed to insert order:', result);
        throw new Error('Failed to create order');
      }

      console.log('Order created successfully:', result.insertedId);

      // Update product quantities after successful order creation
      for (const item of orderData.items) {
        const quantityField = `quantity${item.size}`;
        const outOfStockField = `outOfStock${item.size}`;

        // Update quantity using $inc for atomic operation
        const updateResult = await db.collection('products').updateOne(
          { 
            _id: new ObjectId(item.productId),
            [quantityField]: { $gte: item.quantity } // Double check quantity before update
          },
          { 
            $inc: { [quantityField]: -item.quantity },
            $set: { 
              [outOfStockField]: false,
              updatedAt: new Date()
            }
          },
          { session: dbSession }
        );

        if (updateResult.modifiedCount === 0) {
          throw new Error(`Failed to update product quantity ${item.productId}`);
        }

        // Check and update outOfStock status
        const updatedProduct = await db.collection('products').findOne(
          { _id: new ObjectId(item.productId) },
          { session: dbSession }
        );

        if (!updatedProduct) {
          throw new Error(`Failed to fetch updated product: ${item.productId}`);
        }

        // Check if new quantity is 0
        if (updatedProduct[quantityField] === 0) {
          await db.collection('products').updateOne(
            { _id: new ObjectId(item.productId) },
            { 
              $set: { 
                [outOfStockField]: true,
                updatedAt: new Date()
              }
            },
            { session: dbSession }
          );
        }

        // Check if all sizes are out of stock
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

        // Revalidate product detail page
        revalidatePath(`/products/${updatedProduct.slug}`);
      }

      // Commit transaction
      await dbSession.commitTransaction();

      // Revalidate related pages
      revalidatePath('/products');
      revalidatePath('/admin/products');
      revalidatePath('/orders');

      return NextResponse.json({
        ok: true,
        order: {
          ...order,
          _id: result.insertedId.toString()
        }
      });

    } catch (error) {
      // Rollback transaction on error
      await dbSession.abortTransaction();
      throw error;
    } finally {
      // End session
      await dbSession.endSession();
    }

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { 
        ok: false, 
        message: error instanceof Error ? error.message : 'Failed to create order',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
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