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

  const handleAddProduct = async (productData: ProductFormType) => {
    setIsAdding(true);

    try {
      // First upload images
      if (productData.images.length === 0) {
        throw new Error("Please select at least one image");
      }

      const formData = new FormData();
      productData.images.forEach((image, index) => {
        formData.append("files", image);
      });

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Failed to upload images");
      }

      const uploadData = await uploadResponse.json();
      
      if (!uploadData.success || !uploadData.urls) {
        throw new Error("Invalid upload response");
      }

      // Upload size guide image if exists
      let sizeGuideImageUrl = "";
      if (productData.sizeGuideImage) {
        const sizeGuideFormData = new FormData();
        sizeGuideFormData.append("files", productData.sizeGuideImage);
        
        const sizeGuideResponse = await fetch("/api/upload", {
          method: "POST",
          body: sizeGuideFormData,
        });

        if (!sizeGuideResponse.ok) {
          throw new Error("Failed to upload size guide image");
        }

        const sizeGuideData = await sizeGuideResponse.json();
        if (!sizeGuideData.success || !sizeGuideData.urls || sizeGuideData.urls.length === 0) {
          throw new Error("Invalid size guide image upload response");
        }
        sizeGuideImageUrl = sizeGuideData.urls[0];
      }

      // Then create product
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
      productFormData.append("images", JSON.stringify(uploadData.urls));
      if (sizeGuideImageUrl) {
        productFormData.append("sizeGuideImage", sizeGuideImageUrl);
      }
      productFormData.append("colors", JSON.stringify(productData.colors));

      const response = await fetch("/api/products", {
        method: "POST",
        body: productFormData,
      });

      const data = await response.json();

      if (data.ok) {
        toast.success("Product added successfully");
        fetchProducts();
      } else {
        toast.error(data.error || "Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add product");
    } finally {
      setIsAdding(false);
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
        updatedAt: new Date().toISOString()
      };

      const response = await fetch(`/api/products/${product._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProduct),
      });

      const data = await response.json();

      if (data.ok) {
        toast.success("Cập nhật sản phẩm thành công");
        // Cập nhật state với dữ liệu mới từ server
        setProducts(prevProducts => 
          prevProducts.map(p => 
            p._id === product._id ? data.product : p
          )
        );
        setIsEditing(false);
        setSelectedProduct(null);
        // Refresh lại danh sách sản phẩm
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
        toast.success("Product deleted successfully");
        fetchProducts();
      } else {
        toast.error(data.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
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
          <ProductForm onSubmit={handleAddProduct} isAdding={isAdding} />

          <div className="mb-2 mt-8">
            <h2 className="text-base font-semibold text-black uppercase">Danh sách sản phẩm</h2>
            <div className="w-full h-px bg-gray-300 mt-1 mb-2"></div>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <ProductList
                products={products}
                onEdit={setSelectedProduct}
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