"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { toast } from "react-hot-toast";
import Image from "next/image";

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
  sizeGuideImage?: string;
  colors: string[];
}

interface EditModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (product: Product) => void;
  isEditing: boolean;
}

export const EditModal = ({ product, onClose, onSave, isEditing }: EditModalProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [uploadingImages, setUploadingImages] = useState<{ [key: string]: boolean }>({});
  const [sizeGuideImage, setSizeGuideImage] = useState<File | null>(null);
  const [sizeGuideImagePreview, setSizeGuideImagePreview] = useState<string>("");

  useEffect(() => {
    if (product) {
      setSelectedProduct(product);
      setSizeGuideImagePreview(product.sizeGuideImage || "");
    }
  }, [product]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fieldName = `imageUrl${index}`;
    setUploadingImages(prev => ({ ...prev, [fieldName]: true }));

    try {
      const formData = new FormData();
      formData.append("files", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.urls && data.urls.length > 0) {
        if (selectedProduct) {
          const newImages = [...selectedProduct.images];
          newImages[index] = data.urls[0];
          setSelectedProduct({
            ...selectedProduct,
            images: newImages,
          });
        }
      } else {
        toast.error(data.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImages(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleSizeGuideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("files", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.urls && data.urls.length > 0) {
        if (selectedProduct) {
          setSelectedProduct({
            ...selectedProduct,
            sizeGuideImage: data.urls[0],
          });
          setSizeGuideImagePreview(data.urls[0]);
        }
      } else {
        toast.error(data.error || "Failed to upload size guide image");
      }
    } catch (error) {
      console.error("Error uploading size guide image:", error);
      toast.error("Failed to upload size guide image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const updatedProduct = {
        ...selectedProduct,
        price: Number(selectedProduct.price),
        quantityM: Number(selectedProduct.quantityM),
        quantityL: Number(selectedProduct.quantityL),
        quantityXL: Number(selectedProduct.quantityXL),
        quantityHat: Number(selectedProduct.quantityHat),
        updatedAt: new Date().toISOString()
      };

      await onSave(updatedProduct);
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Không thể cập nhật sản phẩm");
    }
  };

  const handleClose = () => {
    setSelectedProduct(null);
    onClose();
  };

  if (!selectedProduct) return null;

  return (
    <Dialog
      open={!!selectedProduct}
      onClose={handleClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto w-full max-w-4xl rounded bg-white p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-2xl font-bold text-black">
              Chỉnh sửa sản phẩm
            </Dialog.Title>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Preview Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ảnh sản phẩm
              </label>
              <div className="grid grid-cols-5 gap-4">
                {selectedProduct.images.map((imageUrl, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={imageUrl}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      ref={(el) => {
                        if (el) {
                          fileInputRefs.current[`editImageUrl${index}`] = el;
                        }
                      }}
                      onChange={(e) => handleImageUpload(e, index)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[`editImageUrl${index}`]?.click()}
                      disabled={uploadingImages[`editImageUrl${index}`]}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity text-white text-sm font-medium"
                    >
                      {uploadingImages[`editImageUrl${index}`] ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      ) : (
                        "Thay đổi"
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Tên sản phẩm
                  </label>
                  <input
                    type="text"
                    value={selectedProduct.name}
                    onChange={(e) => {
                      setSelectedProduct({
                        ...selectedProduct,
                        name: e.target.value,
                      });
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black text-base text-black py-3 px-4"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Màu sắc
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {["black", "white", "blue", "grey"].map((color) => (
                      <label key={color} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedProduct.colors?.includes(color) || false}
                          onChange={(e) => {
                            const newColors = e.target.checked
                              ? [...(selectedProduct.colors || []), color]
                              : (selectedProduct.colors || []).filter((c) => c !== color);
                            setSelectedProduct({
                              ...selectedProduct,
                              colors: newColors,
                            });
                          }}
                          className="rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-sm font-medium text-gray-700 capitalize">{color}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Giá
                  </label>
                  <input
                    type="number"
                    value={selectedProduct.price}
                    onChange={(e) => {
                      setSelectedProduct({
                        ...selectedProduct,
                        price: Number(e.target.value),
                      });
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black text-base text-black py-3 px-4"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Phân loại
                  </label>
                  <select
                    value={selectedProduct.category}
                    onChange={(e) => {
                      setSelectedProduct({
                        ...selectedProduct,
                        category: e.target.value,
                      });
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black text-base text-black py-3 px-4"
                    required
                  >
                    <option value="TSHIRT">TSHIRT</option>
                    <option value="SHIRT">SHIRT</option>
                    <option value="POLO">POLO</option>
                    <option value="SWEATER">SWEATER</option>
                    <option value="HOODIE">HOODIE</option>
                    <option value="PANTS">PANTS</option>
                    <option value="SHORT">SHORT</option>
                    <option value="SKIRT">SKIRT</option>
                    <option value="CAP">CAP</option>
                    <option value="KEYCHAIN">KEYCHAIN</option>
                    <option value="TOWEL">TOWEL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Bộ sưu tập
                  </label>
                  <input
                    type="text"
                    value={selectedProduct.collection}
                    onChange={(e) => {
                      setSelectedProduct({
                        ...selectedProduct,
                        collection: e.target.value,
                      });
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black text-base text-black py-3 px-4"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Mã sản phẩm
                  </label>
                  <input
                    type="text"
                    value={selectedProduct.productCode}
                    onChange={(e) => {
                      setSelectedProduct({
                        ...selectedProduct,
                        productCode: e.target.value,
                      });
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black text-base text-black py-3 px-4"
                    required
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={selectedProduct.description}
                    onChange={(e) => {
                      setSelectedProduct({
                        ...selectedProduct,
                        description: e.target.value,
                      });
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black text-base text-black py-3 px-4"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Chi tiết sản phẩm
                  </label>
                  <textarea
                    value={selectedProduct.details}
                    onChange={(e) => {
                      setSelectedProduct({
                        ...selectedProduct,
                        details: e.target.value,
                      });
                    }}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black text-base text-black py-3 px-4"
                    rows={4}
                    required
                  />
                </div>

                {selectedProduct.category !== "CAP" ? (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        Số lượng size M
                      </label>
                      <input
                        type="number"
                        value={selectedProduct.quantityM}
                        onChange={(e) => {
                          setSelectedProduct({
                            ...selectedProduct,
                            quantityM: Number(e.target.value),
                          });
                        }}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black text-base text-black py-3 px-4"
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        Số lượng size L
                      </label>
                      <input
                        type="number"
                        value={selectedProduct.quantityL}
                        onChange={(e) => {
                          setSelectedProduct({
                            ...selectedProduct,
                            quantityL: Number(e.target.value),
                          });
                        }}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black text-base text-black py-3 px-4"
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        Số lượng size XL
                      </label>
                      <input
                        type="number"
                        value={selectedProduct.quantityXL}
                        onChange={(e) => {
                          setSelectedProduct({
                            ...selectedProduct,
                            quantityXL: Number(e.target.value),
                          });
                        }}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black text-base text-black py-3 px-4"
                        required
                        min="0"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Số lượng
                    </label>
                    <input
                      type="number"
                      value={selectedProduct.quantityHat}
                      onChange={(e) => {
                        setSelectedProduct({
                          ...selectedProduct,
                          quantityHat: Number(e.target.value),
                        });
                      }}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black text-base text-black py-3 px-4"
                      required
                      min="0"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Ảnh hướng dẫn size
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSizeGuideImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
                    />
                    {sizeGuideImagePreview && (
                      <div className="relative w-20 h-20">
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
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isEditing}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
              >
                {isEditing ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}; 