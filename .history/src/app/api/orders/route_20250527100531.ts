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
    
    console.log('Dữ liệu đơn hàng nhận được:', orderData);

    // Kiểm tra mảng items
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      console.error('Mảng items không hợp lệ:', orderData.items);
      return NextResponse.json(
        { ok: false, message: 'Đơn hàng phải có ít nhất một sản phẩm' },
        { status: 400 }
      );
    }

    // Kết nối MongoDB với hỗ trợ transaction
    const { db, client } = await connectToDatabase();
    mongoClient = client;

    // Bắt đầu session cho transaction
    const dbSession = client.startSession();

    try {
      // Bắt đầu transaction
      await dbSession.startTransaction();

      // Kiểm tra số lượng sản phẩm trước khi tạo đơn hàng
      for (const item of orderData.items) {
        const product = await db.collection('products').findOne(
          { _id: new ObjectId(item.productId) },
          { session: dbSession }
        );

        if (!product) {
          throw new Error(`Không tìm thấy sản phẩm với ID: ${item.productId}`);
        }

        const quantityField = `quantity${item.size}`;
        const currentQuantity = product[quantityField] || 0;

        if (currentQuantity < item.quantity) {
          throw new Error(`Số lượng sản phẩm ${product.name} (Size ${item.size}) không đủ. Còn lại: ${currentQuantity}`);
        }
      }

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

      console.log('Đang tạo đơn hàng với dữ liệu:', order);

      const result = await db.collection('orders').insertOne(order, { session: dbSession });

      if (!result.acknowledged) {
        console.error('Không thể tạo đơn hàng:', result);
        throw new Error('Không thể tạo đơn hàng');
      }

      console.log('Đơn hàng được tạo thành công:', result.insertedId);

      // Cập nhật số lượng sản phẩm sau khi tạo đơn hàng thành công
      for (const item of orderData.items) {
        const quantityField = `quantity${item.size}`;
        const outOfStockField = `outOfStock${item.size}`;

        // Cập nhật số lượng sử dụng $inc để đảm bảo tính atomic
        const updateResult = await db.collection('products').updateOne(
          { 
            _id: new ObjectId(item.productId),
            [quantityField]: { $gte: item.quantity } // Kiểm tra lại số lượng trước khi cập nhật
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
          throw new Error(`Không thể cập nhật số lượng sản phẩm ${item.productId}`);
        }

        // Kiểm tra và cập nhật trạng thái outOfStock
        const updatedProduct = await db.collection('products').findOne(
          { _id: new ObjectId(item.productId) },
          { session: dbSession }
        );

        if (!updatedProduct) {
          throw new Error(`Không thể lấy thông tin sản phẩm sau khi cập nhật: ${item.productId}`);
        }

        // Kiểm tra nếu số lượng mới = 0
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

        // Kiểm tra nếu tất cả các size đều hết hàng
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
        revalidatePath(`/products/${updatedProduct.slug}`);
      }

      // Commit transaction
      await dbSession.commitTransaction();

      // Revalidate các trang liên quan
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
      // Rollback transaction nếu có lỗi
      await dbSession.abortTransaction();
      throw error;
    } finally {
      // End session
      await dbSession.endSession();
    }

  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng:', error);
    return NextResponse.json(
      { 
        ok: false, 
        message: error instanceof Error ? error.message : 'Không thể tạo đơn hàng',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    // Đóng kết nối MongoDB
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