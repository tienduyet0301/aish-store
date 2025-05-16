import React, { useState } from 'react';

const BannerForm: React.FC = () => {
  const [formData, setFormData] = useState({
    imageUrl: "",
    mobileImageUrl: "",
    title: "",
    description: "",
    link: "",
    order: 0,
    isActive: true,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/banners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create banner");
      }

      // Reset form
      setFormData({
        imageUrl: "",
        mobileImageUrl: "",
        title: "",
        description: "",
        link: "",
        order: 0,
        isActive: true,
      });

      // Refresh banner list
      onSuccess?.();
    } catch (error) {
      console.error("Error creating banner:", error);
      alert("Failed to create banner");
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Handle image change
  };

  const handleMobileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        mobileImageUrl: data.url,
      }));
    } catch (error) {
      console.error("Error uploading mobile image:", error);
      alert("Failed to upload mobile image");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Banner Image (Desktop)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full p-2 border rounded"
        />
        {formData.imageUrl && (
          <div className="mt-2">
            <img
              src={formData.imageUrl}
              alt="Preview"
              className="h-32 object-cover rounded"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Banner Image (Mobile)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleMobileImageChange}
          className="w-full p-2 border rounded"
        />
        {formData.mobileImageUrl && (
          <div className="mt-2">
            <img
              src={formData.mobileImageUrl}
              alt="Mobile Preview"
              className="h-32 object-cover rounded"
            />
          </div>
        )}
      </div>

      {/* ... rest of the form fields ... */}
    </form>
  );
};

export default BannerForm; 