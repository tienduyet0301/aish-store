import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String, required: true }],
  category: { type: String, required: true },
  colors: [{ type: String }],
  quantityM: { type: Number, default: 0 },
  quantityL: { type: Number, default: 0 },
  quantityXL: { type: Number, default: 0 },
  quantityHat: { type: Number, default: 0 },
  discountCode: { type: String },
  discountPercentage: { type: Number, default: 0 },
  discountExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product; 