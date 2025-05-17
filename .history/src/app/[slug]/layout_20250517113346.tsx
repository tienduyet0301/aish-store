// src/app/[slug]/layout.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/actions";
import { Product } from "@/lib/types";
import { Suspense } from "react";
import Loading from "./loading";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [
        {
          url: product.images[0]?.url || "",
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
  };
}

type Props = {
  children: React.ReactNode;
  params: { slug: string };
};

export default async function ProductLayout({ children, params }: Props) {
  const product = await getProduct(params.slug);
  if (!product) {
    notFound();
  }

  return (
    <Suspense fallback={<Loading />}>
      {children}
    </Suspense>
  );
}
