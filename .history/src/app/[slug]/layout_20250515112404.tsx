import { getProduct } from "@/lib/products";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const product = await getProduct(slug);
  
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
  return <>{children}</>;
} 