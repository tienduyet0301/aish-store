import { ObjectId } from 'mongodb';

export const orderSchema = {
  orderCode: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  items: [{
    productId: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
};

export const createOrder = async (db, orderData) => {
  const collection = db.collection('orders');
  const result = await collection.insertOne({
    ...orderData,
    _id: new ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return result;
};

export const getOrdersByUserId = async (db, userId) => {
  const collection = db.collection('orders');
  return await collection.find({ userId }).toArray();
};

export const getOrderById = async (db, orderId) => {
  const collection = db.collection('orders');
  return await collection.findOne({ _id: new ObjectId(orderId) });
};

export const updateOrderStatus = async (db, orderId, status) => {
  const collection = db.collection('orders');
  return await collection.updateOne(
    { _id: new ObjectId(orderId) },
    { 
      $set: { 
        status,
        updatedAt: new Date()
      }
    }
  );
}; 