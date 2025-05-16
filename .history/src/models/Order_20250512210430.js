import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
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
});

// Tạo model Order từ schema
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order; 