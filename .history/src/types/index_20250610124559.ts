export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  colors?: string[];
  quantityM: number;
  quantityL: number;
  quantityXL: number;
  quantityHat: number;
  productDiscount?: {
    code: string;
    type: 'fixed' | 'percentage';
    value: number;
    maxAmount?: number;
    isActive: boolean;
    expiryDate?: string;
    usedCount: number;
  };
  createdAt: string;
  updatedAt: string;
} 