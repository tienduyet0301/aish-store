import { getProduct } from "@/services/product";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  return {
    title: `${product.name} | AISH`,
    description: product.description,
  };
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 