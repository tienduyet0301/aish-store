import { Product } from "../types/product";
import ProductCard from "@/components/ProductCard";

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
      {products.map((product, idx) => (
        <ProductCard key={product._id || (product as any).id || idx} product={product} />
      ))}
    </div>
  );
} 