import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

async function updatePromoStructure() {
  try {
    const { db } = await connectToDatabase();
    console.log('Connected to database');

    // Lấy tất cả các mã giảm giá hiện tại
    const promoCodes = await db.collection('notifications')
      .find({ type: 'promo' })
      .toArray();

    console.log(`Found ${promoCodes.length} promo codes to update`);

    for (const promo of promoCodes) {
      // Chuyển đổi cấu trúc cũ sang cấu trúc mới
      const updateData = {
        promoType: 'fixed', // Mặc định là fixed cho các mã cũ
        value: promo.amount || 0, // Chuyển amount cũ thành value
        maxAmount: null, // Thêm trường mới
        isLoginRequired: false, // Thêm trường mới
        perUserLimit: 0, // Thêm trường mới
        usedByUsers: [], // Thêm trường mới
        usedCount: 0, // Thêm trường mới
        expiryDate: null, // Thêm trường mới
        updatedAt: new Date().toISOString()
      };

      // Cập nhật document
      await db.collection('notifications').updateOne(
        { _id: new ObjectId(promo._id) },
        { $set: updateData }
      );

      console.log(`Updated promo code: ${promo.code}`);
    }

    console.log('Successfully updated all promo codes');
  } catch (error) {
    console.error('Error updating promo structure:', error);
  } finally {
    process.exit(0);
  }
}

updatePromoStructure(); 