export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  quantityM: number;
  quantityL: number;
  quantityXL: number;
  quantityHat: number;
  productCode: string;
  details: string;
  category: string;
  collection: string;
  createdAt: string;
  colors: string[];
}

export interface ProductForm {
  name: string;
  price: string;
  description: string;
  images: File[];
  quantityM: string;
  quantityL: string;
  quantityXL: string;
  quantityHat: string;
  productCode: string;
  details: string;
  category: string;
  collection: string;
  sizeGuideImage: File | null;
  colors: string[];
}

export const initialFormState: ProductForm = {
  name: "",
  price: "",
  description: "",
  images: [],
  quantityM: "",
  quantityL: "",
  quantityXL: "",
  quantityHat: "",
  productCode: "",
  details: "",
  category: "",
  collection: "",
  sizeGuideImage: null,
  colors: [],
}; 