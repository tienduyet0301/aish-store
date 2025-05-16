import { ObjectId } from 'mongodb';

export const orderSchema = {
  orderCode: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  additionalPhone: {
    type: String
  },
  address: {
    type: String,
    required: true
  },
  ward: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  province: {
    type: String,
    required: true
  },
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  subtotal: {
    type: Number,
    required: true
  },
  shippingFee: {
    type: String,
    default: "Miễn phí"
  },
  total: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'bank'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  shippingStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered'],
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