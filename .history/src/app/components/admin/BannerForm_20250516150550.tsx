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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle form submission
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Handle image change
  };

  const handleMobileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Handle mobile image change
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