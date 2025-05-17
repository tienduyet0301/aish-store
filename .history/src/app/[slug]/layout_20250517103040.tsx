// src/app/[slug]/layout.tsx
import { getProduct } from "@/lib/products";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const product = await getProduct(params.slug);

    return {
      title: product?.name ? `${product.name} | AISH` : "Product | AISH",
      description: product?.description || "Product details",
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Product | AISH",
      description: "Product details",
    };
  }
}

type Props = {
  children: React.ReactNode;
  params: { slug: string };
}

export default async function ProductLayout({
  children,
  params,
}: Props) {
  return <>{children}</>;
}
