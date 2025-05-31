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

      // Check product quantities before creating order
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
        shippingMethod: orderData.shippingMethod || 'standard'
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

export async function GET(request: Request) {
  let mongoClient = null;
  
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    console.log('Fetching orders for:', { email, sessionEmail: session?.user?.email });

    if (!email && !session?.user?.email) {
      console.error('No email provided');
      return NextResponse.json(
        { ok: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    try {
      const { db, client } = await connectToDatabase();
      mongoClient = client;

      // Find orders by email
      const orders = await db.collection('orders')
        .find({ email: email || session?.user?.email })
        .sort({ createdAt: -1 })
        .toArray();

      console.log('Found orders:', orders.length);

      return NextResponse.json({
        ok: true,
        orders: orders.map(order => ({
          ...order,
          _id: order._id.toString()
        }))
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { 
        ok: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch orders',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    if (mongoClient) {
      try {
        await mongoClient.close();
      } catch (closeError) {
        console.error('Error closing MongoDB connection:', closeError);
      }
    }
  }
} 