"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiPlus, FiTrash2, FiEdit2, FiInfo } from "react-icons/fi";

const defaultImage = "/images/image1.jpg";

export default function BannerManagement() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);
  const fileInputRefs = useRef({});
  const router = useRouter();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch("/api/banners");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched banners:", data);
      const validBanners = data.filter(banner => 
        banner && 
        banner.imageUrl && 
        typeof banner.imageUrl === 'string' && 
        banner.imageUrl.trim() !== ''
      );

      // Phân loại banner dựa vào kích thước ảnh
      const processedBanners = await Promise.all(validBanners.map(async (banner) => {
        const isMobile = await new Promise((resolve) => {
          const img = new window.Image();
          img.onload = () => {
            resolve(img.height > img.width);
          };
          img.src = banner.imageUrl;
        });
        return { ...banner, isMobile };
      }));

      setBanners(processedBanners);
    } catch (error) {
      console.error("Error fetching banners:", error);
      setBanners([]);
      alert("Không thể tải danh sách banner. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e, bannerId = null) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra kích thước ảnh
    const isMobile = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          // Nếu chiều cao > chiều rộng thì là ảnh dọc (mobile)
          resolve(img.height > img.width);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });

    setUploading(true);
    const formData = new FormData();
    formData.append("files", file);

    try {
      console.log("Uploading file:", file.name);
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();
      console.log("Upload response:", uploadData);

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || `Upload failed: ${uploadResponse.statusText}`);
      }

      if (!uploadData.success || !uploadData.urls || uploadData.urls.length === 0) {
        throw new Error("No URL returned from upload");
      }

      const imageUrl = uploadData.urls[0];
      console.log("Creating/Updating banner with URL:", imageUrl);

      if (bannerId) {
        // Update existing banner
        const bannerResponse = await fetch("/api/banners", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            _id: bannerId,
            imageUrl: imageUrl,
            title: file.name,
          }),
        });

        if (!bannerResponse.ok) {
          const data = await bannerResponse.json();
          throw new Error(data.error || `Banner update failed: ${bannerResponse.statusText}`);
        }
      } else {
        // Create new banner
        const bannerResponse = await fetch("/api/banners", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl: imageUrl,
            title: file.name,
          }),
        });

        if (!bannerResponse.ok) {
          const data = await bannerResponse.json();
          throw new Error(data.error || `Banner creation failed: ${bannerResponse.statusText}`);
        }
      }

      await fetchBanners();
    } catch (error) {
      console.error("Error in handleFileUpload:", error);
      alert(`Failed to upload banner: ${error.message}`);
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      console.log("Deleting banner:", id);
      const response = await fetch("/api/banners", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Delete failed: ${response.statusText}`);
      }

      await fetchBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
      alert(`Failed to delete banner: ${error.message}`);
    }
  };

  const handleEdit = (banner) => {
    setEditingBannerId(banner._id);
    // Tự động click input file khi bấm sửa
    setTimeout(() => {
      if (fileInputRefs.current[banner._id]) {
        fileInputRefs.current[banner._id].click();
      }
    }, 0);
  };

  const handleEditFileChange = (e, bannerId) => {
    const file = e.target.files[0];
    if (!file) return;
    handleFileUpload({ target: { files: [file], value: '' } }, bannerId);
    setEditingBannerId(null);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newBanners = [...banners];
    [newBanners[index - 1], newBanners[index]] = [newBanners[index], newBanners[index - 1]];
    setBanners(newBanners);
    // TODO: Gọi API cập nhật thứ tự nếu cần
  };

  const handleMoveDown = (index) => {
    if (index === banners.length - 1) return;
    const newBanners = [...banners];
    [newBanners[index], newBanners[index + 1]] = [newBanners[index + 1], newBanners[index]];
    setBanners(newBanners);
    // TODO: Gọi API cập nhật thứ tự nếu cần
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="aspect-video bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowRequirements(!showRequirements)}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100"
                title="Upload Requirements"
              >
                <FiInfo size={20} />
              </button>
              <label className="bg-black text-white px-4 py-2 rounded-md cursor-pointer hover:bg-gray-800 transition-colors flex items-center gap-2">
                <FiPlus className="inline" />
                {uploading ? "Uploading..." : "Add Banner"}
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileUpload(e, null)}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {showRequirements && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold mb-2 text-gray-900">Upload Requirements:</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Supported formats: JPEG, PNG, WebP</li>
                <li>Maximum file size: 5MB</li>
                <li>Desktop banner: Recommended dimensions 1920x1080 pixels</li>
                <li>Mobile banner: Recommended dimensions 1080x1920 pixels</li>
                <li>For best results, use high-quality images</li>
              </ul>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner, index) => (
            <div
              key={banner._id}
              className="border border-gray-200 rounded-lg overflow-hidden group relative"
            >
              <div className="w-full aspect-video min-h-[120px] bg-gray-100 overflow-hidden rounded-lg">
                <div className="absolute top-2 left-2 z-10">
                  <span className={`${banner.isMobile ? 'bg-gray-600' : 'bg-black'} text-white text-xs px-2 py-1 rounded`}>
                    {banner.isMobile ? "Mobile" : "Desktop"}
                  </span>
                </div>
                <a href={banner.imageUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title || `Banner ${index + 1}`}
                    className="w-full h-full object-cover"
                    style={{ display: 'block' }}
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder.jpg';
                    }}
                  />
                </a>
                <div className="absolute top-2 right-2 flex gap-2 z-10">
                  <button
                    onClick={() => handleEdit(banner)}
                    className="bg-white text-gray-700 p-1 rounded-full shadow hover:bg-blue-100 border border-gray-200 flex items-center justify-center"
                    title="Edit Banner"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    ref={el => fileInputRefs.current[banner._id] = el}
                    onChange={e => handleEditFileChange(e, banner._id)}
                  />
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="bg-white text-gray-700 p-1 rounded-full shadow hover:bg-red-100 border border-gray-200 flex items-center justify-center"
                    title="Delete Banner"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200">
                <span className="text-sm text-gray-600 truncate block">
                  {banner.title || `Banner ${index + 1}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 