"use client";

import { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";

interface ProductFormData {
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
}

interface ProductFormState extends Omit<ProductFormData, 'images' | 'sizeGuideImage'> {
  images: File[];
  sizeGuideImage: File | null;
}

const initialFormState: ProductFormState = {
  name: "",
  price: "",
  description: "",
  images: [],
  quantityM: "",
  quantityL: "",
  quantityXL: "",
  quantityHat: "",
  productCode: "",
  details: "",
  category: "",
  collection: "",
  sizeGuideImage: null,
  colors: [],
};

interface ProductFormProps {
  onSubmit: (productData: ProductFormData) => void;
  isAdding: boolean;
}

export const ProductForm = ({ onSubmit, isAdding }: ProductFormProps) => {
  const [newProduct, setNewProduct] = useState<ProductFormState>(initialFormState);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [sizeGuideImagePreview, setSizeGuideImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    // Clear old preview URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    
    // Reset all states
    setNewProduct(initialFormState);
    setPreviewUrls([]);
    setSizeGuideImagePreview("");
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      toast.error("You can only upload up to 5 images");
      return;
    }

    // Clear old preview URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    
    // Create new preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    setNewProduct(prev => ({ ...prev, images: files }));
  };

  const handleSizeGuideImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewProduct(prev => ({ ...prev, sizeGuideImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setSizeGuideImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Upload images first
      const formData = new FormData();
      newProduct.images.forEach((image) => {
        formData.append("files", image);
      });

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload images");
      }

      const uploadData = await uploadResponse.json();
      if (!uploadData.success || !uploadData.urls) {
        throw new Error("Invalid upload response");
      }

      // Upload size guide image if exists
      let sizeGuideImageUrl = "";
      if (newProduct.sizeGuideImage) {
        const sizeGuideFormData = new FormData();
        sizeGuideFormData.append("files", newProduct.sizeGuideImage);
        
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

      // Create product with Cloudinary URLs
      const productData: ProductFormData = {
        ...newProduct,
        images: uploadData.urls,
        sizeGuideImage: sizeGuideImageUrl,
      };

      await onSubmit(productData);
      resetForm();
    } catch (error) {
      console.error("Error submitting product:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit product");
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setNewProduct(prev => ({
      ...prev,
      category,
      // Reset quantities when category changes
      quantityM: category === "CAP" ? "" : prev.quantityM,
      quantityL: category === "CAP" ? "" : prev.quantityL,
      quantityXL: category === "CAP" ? "" : prev.quantityXL,
      quantityHat: category === "CAP" ? prev.quantityHat : "",
    }));
  };

  const isClothing = newProduct.category && newProduct.category !== "CAP";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-4 uppercase">
            Tên sản phẩm
          </label>
          <input
            type="text"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black text-base text-black py-3 px-4"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-4 uppercase">
            Giá
          </label>
          <input
            type="number"
            value={newProduct.price}
            onChange={(e) =>
              setNewProduct({ ...newProduct, price: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black text-base text-black py-3 px-4"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-4 uppercase">
            Phân loại
          </label>
          <select
            value={newProduct.category}
            onChange={handleCategoryChange}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black text-base text-black py-3 px-4"
            required
          >
            <option value="">Chọn phân loại</option>
            <optgroup label="TOPS">
              <option value="TSHIRT">TSHIRT</option>
              <option value="SHIRT">SHIRT</option>
              <option value="POLO">POLO</option>
              <option value="SWEATER">SWEATER</option>
              <option value="HOODIE">HOODIE</option>
              <option value="JACKET">JACKET</option>
            </optgroup>
            <optgroup label="BOTTOMS">
              <option value="PANTS">PANTS</option>
              <option value="SHORT">SHORT</option>
              <option value="SKIRT">SKIRT</option>
            </optgroup>
            <optgroup label="ACCESSORIES">
              <option value="CAP">CAP</option>
              <option value="KEYCHAIN">KEYCHAIN</option>
              <option value="TOWEL">TOWEL</option>
            </optgroup>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-4">
          <label className="block text-sm font-semibold text-gray-700 mb-4 uppercase">
            Màu sắc
          </label>
          <div className="flex flex-wrap gap-4">
            {["black", "white", "blue", "grey", "beige"].map((color) => (
              <label key={color} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newProduct.colors?.includes(color) || false}
                  onChange={(e) => {
                    const newColors = e.target.checked
                      ? [...(newProduct.colors || []), color]
                      : (newProduct.colors || []).filter((c) => c !== color);
                    setNewProduct({ ...newProduct, colors: newColors });
                  }}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-sm font-medium text-gray-700 capitalize">{color}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {isClothing ? (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4 uppercase">
                Số lượng size M
              </label>
              <input
                type="number"
                value={newProduct.quantityM}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, quantityM: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black text-base text-black py-3 px-4"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4 uppercase">
                Số lượng size L
              </label>
              <input
                type="number"
                value={newProduct.quantityL}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, quantityL: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black text-base text-black py-3 px-4"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4 uppercase">
                Số lượng size XL
              </label>
              <input
                type="number"
                value={newProduct.quantityXL}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, quantityXL: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black text-base text-black py-3 px-4"
                required
                min="0"
              />
            </div>
            <div className="opacity-0">
              {/* Placeholder để giữ layout */}
            </div>
          </>
        ) : newProduct.category === "CAP" ? (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4 uppercase">
              Số lượng nón
            </label>
            <input
              type="number"
              value={newProduct.quantityHat}
              onChange={(e) =>
                setNewProduct({ ...newProduct, quantityHat: e.target.value })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black text-base text-black py-3 px-4"
              required
              min="0"
            />
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-4 uppercase">
            Bộ sưu tập
          </label>
          <select
            value={newProduct.collection}
            onChange={(e) =>
              setNewProduct({ ...newProduct, collection: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black text-base text-black py-3 px-4"
            required
          >
            <option value="">Chọn bộ sưu tập</option>
            <option value="ACCEPT THE PROBLEM">ACCEPT THE PROBLEM</option>
            <option value="BACK TO SUMMER">BACK TO SUMMER</option>
            <option value="CHILL, CALM DOWN">CHILL, CALM DOWN</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-4 uppercase">
            Mã sản phẩm
          </label>
          <input
            type="text"
            value={newProduct.productCode}
            onChange={(e) =>
              setNewProduct({ ...newProduct, productCode: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black text-base text-black py-3 px-4"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-4 uppercase">
            Mô tả
          </label>
          <textarea
            value={newProduct.description}
            onChange={(e) =>
              setNewProduct({ ...newProduct, description: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black text-base text-black py-3 px-4"
            rows={4}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-4 uppercase">
            Chi tiết sản phẩm
          </label>
          <textarea
            value={newProduct.details}
            onChange={(e) =>
              setNewProduct({ ...newProduct, details: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black text-base text-black py-3 px-4"
            rows={4}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-4 uppercase">
            Hình ảnh (tối đa 5 ảnh)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-black hover:text-gray-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-black"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    className="sr-only"
                    required
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {newProduct.images.length} file(s) selected
          </p>
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-5 gap-4 mt-2">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-4 uppercase">
            Ảnh hướng dẫn size
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center w-full">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600 justify-center">
                <label
                  htmlFor="size-guide-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-black hover:text-gray-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-black"
                >
                  <span>Upload a file</span>
                  <input
                    id="size-guide-upload"
                    name="size-guide-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleSizeGuideImageChange}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
          {sizeGuideImagePreview && (
            <div className="relative w-32 h-32 mt-2 mx-auto">
              <Image
                src={sizeGuideImagePreview}
                alt="Size Guide Preview"
                fill
                className="object-cover rounded"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isAdding}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
        >
          {isAdding ? "Đang thêm..." : "Thêm sản phẩm"}
        </button>
      </div>
    </form>
  );
}; 