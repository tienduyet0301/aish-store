// src/app/[slug]/layout.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/actions";
import { Product } from "@/lib/types";
import { Suspense } from "react";
import Loading from "./loading";

// @ts-ignore
export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug);
  if (!product) {
    return {
      title: "AISH OFFICIAL",
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
