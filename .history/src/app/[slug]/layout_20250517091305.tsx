import { getProduct } from "@/lib/products";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const slug = params.slug;
    const product = await getProduct(slug);
    
    return {
      title: product?.name ? `${product.name} | AISH` : 'Product | AISH',
      description: product?.description || 'Product details',
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Product | AISH',
      description: 'Product details',
    };
  }
}

interface ProductLayoutProps {
  children: React.ReactNode;
  params: {
    slug: string;
  };
}

export default function ProductLayout({
  children,
  params,
}: ProductLayoutProps) {
  return <>{children}</>;
} 