// src/app/[slug]/layout.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct } from "@/services/product";
import { Product } from "@/lib/types";
import { Suspense } from "react";
import Loading from "./loading";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const product = await getProduct(params.slug);
    
    if (!product) {
      return {
        title: 'Product Not Found | AISH',
        description: 'The requested product could not be found.',
      };
    }

    return {
      title: `${product.name} | AISH`,
      description: product.description || 'Check out this product on AISH',
      openGraph: {
        title: `${product.name} | AISH`,
        description: product.description || 'Check out this product on AISH',
        images: product.images?.[0] ? [product.images[0]] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Product | AISH',
      description: 'Check out our products on AISH',
    };
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}
