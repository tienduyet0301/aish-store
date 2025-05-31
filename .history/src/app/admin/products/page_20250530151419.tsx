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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sizeGuideImage, setSizeGuideImage] = useState<File | null>(null);
  const [sizeGuideImagePreview, setSizeGuideImagePreview] = useState<string>("");
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (status === "authenticated") {
      fetchProducts();
    }
  }, [status, router]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      if (data.ok) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (productData: {
    name: string;
    price: string;
    description: string;
    images: string[];
    quantityM: string;
    quantityL: string;
    quantityXL: string;
    quantityHat: string;
    productCode: string;
    details: string;
    category: string;
    collection: string;
    sizeGuideImage: string;
    colors: string[];
  }) => {
    setIsSubmitting(true);
    try {
      const productFormData = new FormData();
      productFormData.append("name", productData.name);
      productFormData.append("description", productData.description);
      productFormData.append("details", productData.details);
      productFormData.append("price", productData.price);
      productFormData.append("category", productData.category);
      productFormData.append("collection", productData.collection);
      productFormData.append("productCode", productData.productCode);
      productFormData.append("quantityM", productData.quantityM);
      productFormData.append("quantityL", productData.quantityL);
      productFormData.append("quantityXL", productData.quantityXL);
      productFormData.append("quantityHat", productData.quantityHat);
      productFormData.append("images", JSON.stringify(productData.images));
      if (productData.sizeGuideImage) {
        productFormData.append("sizeGuideImage", productData.sizeGuideImage);
      }
      productFormData.append("colors", JSON.stringify(productData.colors));

      const response = await fetch("/api/products", {
        method: "POST",
        body: productFormData,
      });

      const data = await response.json();

      if (data.ok) {
        toast.success("Product added successfully");
        setIsAdding(false);
        fetchProducts();
      } else {
        toast.error(data.error || "Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (product: Product) => {
    setIsEditing(true);

    try {
      if (!product._id) {
        throw new Error("No product selected");
      }

      const updatedProduct = {
        name: product.name,
        price: Number(product.price),
        description: product.description,
        images: product.images,
        quantityM: Number(product.quantityM),
        quantityL: Number(product.quantityL),
        quantityXL: Number(product.quantityXL),
        quantityHat: Number(product.quantityHat),
        productCode: product.productCode,
        details: product.details,
        category: product.category,
        collection: product.collection,
        colors: product.colors || [],
        sizeGuideImage: product.sizeGuideImage || "",
      };

      console.log('Sending update data:', updatedProduct);

      const response = await fetch(`/api/products/${product._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProduct),
      });

      const data = await response.json();
      console.log('API response:', data);

      if (data.ok) {
        setProducts(prevProducts => 
          prevProducts.map(p => 
            p._id === product._id ? data.product : p
          )
        );
        toast.success("Cập nhật sản phẩm thành công");
        setSelectedProduct(null);
        fetchProducts();
      } else {
        toast.error(data.error || "Không thể cập nhật sản phẩm");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Không thể cập nhật sản phẩm");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.ok) {
        toast.success("Xóa sản phẩm thành công");
      } else {
        toast.error(data.error || "Không thể xóa sản phẩm. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Đã xảy ra lỗi khi gửi yêu cầu xóa.");
    } finally {
      fetchProducts();
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
              isAdding={isSubmitting}
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