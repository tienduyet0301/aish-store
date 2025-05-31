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

// Validate order data
function validateOrderData(orderData) {
  const requiredFields = [
    'orderNumber',
    'fullName',
    'email',
    'phone',
    'ward',
    'district',
    'province',
    'items',
    'subtotal',
    'total',
    'paymentMethod'
  ];

  const missingFields = requiredFields.filter(field => !orderData[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  if (typeof orderData.subtotal !== 'number' || orderData.subtotal <= 0) {
    throw new Error('Invalid subtotal amount');
  }

  if (typeof orderData.total !== 'number' || orderData.total <= 0) {
    throw new Error('Invalid total amount');
  }
}

export const createOrder = async (db, orderData) => {
  try {
    // Validate order data
    validateOrderData(orderData);

    const collection = db.collection('orders');
    const result = await collection.insertOne({
      ...orderData,
      _id: new ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'pending',
      paymentStatus: 'pending',
      shippingStatus: 'pending'
    });

    return result;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrdersByUserId = async (db, userId) => {
  try {
    const collection = db.collection('orders');
    return await collection.find({ userId }).toArray();
  } catch (error) {
    console.error('Error fetching orders by user ID:', error);
    throw error;
  }
};

export const getOrderById = async (db, orderId) => {
  try {
    const collection = db.collection('orders');
    return await collection.findOne({ _id: new ObjectId(orderId) });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    throw error;
  }
};

export const updateOrderStatus = async (db, orderId, status) => {
  try {
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
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}; 