import { Product } from "./types";

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`);
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
} 