export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  sizeGuideImage?: string;
  quantityM: number;
  quantityL: number;
  quantityXL: number;
  quantityHat: number;
  productCode: string;
  details: string;
  category: string;
  collection: string;
  selectedSize?: string;
  quantity?: number;
  createdAt: string;
  updatedAt: string;
  colors: string[];
  sizes: string[];
  slug: string;
} 