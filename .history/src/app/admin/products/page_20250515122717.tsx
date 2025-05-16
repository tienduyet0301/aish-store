"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { ProductForm } from "./components/ProductForm";
import { ProductList } from "./components/ProductList";
import { EditModal } from "./components/EditModal";
import { Product, ProductForm as ProductFormType } from "./components/types";
import Image from "next/image";
import { LazyProductForm } from '@/components/lazy';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sizeGuideImage, setSizeGuideImage] = useState<File | null>(null);
  const [sizeGuideImagePreview, setSizeGuideImagePreview] = useState<string>("");
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (formData: ProductFormType) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to add product");
      }

      toast.success("Thêm sản phẩm thành công");
      setIsAdding(false);
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Không thể thêm sản phẩm");
    }
  };

  const handleEditProduct = async (formData: ProductFormType) => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(`/api/products/${selectedProduct._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      toast.success("Cập nhật sản phẩm thành công");
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Không thể cập nhật sản phẩm");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      toast.success("Xóa sản phẩm thành công");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Không thể xóa sản phẩm");
    }
  };

  const handleSizeGuideImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSizeGuideImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSizeGuideImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setSizeGuideImage(null);
    setSizeGuideImagePreview("");
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <>
      <div className="h-[60px]"></div>
      <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="inline-block">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-black tracking-wider mb-2"
              style={{ letterSpacing: "0.2em" }}
            >
              QUẢN LÝ SẢN PHẨM
            </motion.h1>
            <div className="h-[1px] bg-black"></div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-semibold text-black uppercase">Danh sách sản phẩm</h2>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-black text-white px-4 py-2 text-sm hover:bg-gray-800 transition-colors"
            >
              Thêm sản phẩm mới
            </button>
          </div>

          {isAdding && (
            <LazyProductForm
              onSubmit={handleAddProduct}
              isAdding={isAdding}
            />
          )}

          <div className="mt-4">
            {isLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <ProductList
                products={products}
                onEdit={handleEdit}
                onDelete={handleDeleteProduct}
              />
            )}
          </div>
        </div>
      </div>

      <EditModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSave={handleEditProduct}
        isEditing={isEditing}
      />
    </>
  );
} 