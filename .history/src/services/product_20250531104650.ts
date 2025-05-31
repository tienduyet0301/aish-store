import { Product } from "@/types/product";

export async function getProduct(slug: string): Promise<Product> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/by-slug/${slug}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    
    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.error || 'Failed to fetch product');
    }
    
    return data.product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
} 