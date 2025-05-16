import { getProduct } from "@/services/product";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  return {
    title: `${product.name} | AISH`,
  };
}

export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <div>
      {/* Product detail content will go here */}
    </div>
  );
} 