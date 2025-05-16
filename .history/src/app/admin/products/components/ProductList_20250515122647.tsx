"use client";

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  quantityM: number;
  quantityL: number;
  quantityXL: number;
  quantityHat: number;
  productCode: string;
  details: string;
  category: string;
  collection: string;
  createdAt: string;
  colors: string[];
}

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export const ProductList = ({ products, onEdit, onDelete }: ProductListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product, index) => (
        <div
          key={product._id}
          className="border rounded-lg p-4 relative hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-xs font-medium">
                {index + 1}
              </div>
              <h3 className="font-normal text-sm text-black">{product.name}</h3>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(product)}
                className="py-1 px-3 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Sửa
              </button>
              <button
                onClick={() => onDelete(product._id)}
                className="py-1 px-3 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 