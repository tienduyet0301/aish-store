import { Product } from "@/types/product";

export async function getProduct(id: string): Promise<Product> {
  // TODO: Implement actual API call
  // For now return mock data
  return {
    id,
    name: "Product Name",
    description: "Product Description",
    price: 0,
    images: [],
    category: "",
    sizes: [],
    colors: [],
    inStock: true,
  };
} 