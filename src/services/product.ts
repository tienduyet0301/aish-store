import { Product } from "@/types/product";

export async function getProduct(slug: string): Promise<Product> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${slug}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
} 