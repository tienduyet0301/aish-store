"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface PromoCode {
  id: string;
  code: string;
  amount: number;
  isActive: boolean;
}

export default function NotificationsAdmin() {
  const [announcement, setAnnouncement] = useState("");
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(false);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoAmount, setNewPromoAmount] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/admin/notifications");
      const data = await response.json();
      if (data.ok) {
        setAnnouncement(data.announcement);
        setIsAnnouncementActive(data.isAnnouncementActive);
        setPromoCodes(data.promoCodes || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "announcement",
          content: announcement,
          isActive: isAnnouncementActive,
        }),
      });

      const data = await response.json();
      if (data.ok) {
        setMessage("Thông báo đã được cập nhật!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error updating announcement:", error);
      setMessage("Có lỗi xảy ra khi cập nhật thông báo");
    }
  };

  const handleAddPromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Adding promo code:", { newPromoCode, newPromoAmount });

    if (!newPromoCode || !newPromoAmount) {
      setMessage("Vui lòng nhập đầy đủ thông tin mã giảm giá");
      return;
    }

    // Chuyển đổi chuỗi số tiền thành số
    const amount = parseInt(newPromoAmount.replace(/[^0-9]/g, ''));
    console.log("Parsed amount:", amount);

    if (isNaN(amount) || amount <= 0) {
      setMessage("Số tiền giảm giá không hợp lệ");
      return;
    }

    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "promo",
          action: "add",
          code: newPromoCode.trim(),
          amount: Number(amount), // Đảm bảo gửi số
        }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (data.ok) {
        setMessage("Mã giảm giá đã được thêm!");
        setNewPromoCode("");
        setNewPromoAmount("");
        fetchNotifications();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.error || "Có lỗi xảy ra khi thêm mã giảm giá");
      }
    } catch (error) {
      console.error("Error adding promo code:", error);
      setMessage("Có lỗi xảy ra khi thêm mã giảm giá");
    }
  };

  const handleTogglePromoCode = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "promo",
          action: "toggle",
          id,
          isActive,
        }),
      });

      const data = await response.json();
      if (data.ok) {
        setMessage("Trạng thái mã giảm giá đã được cập nhật!");
        fetchNotifications();
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error toggling promo code:", error);
      setMessage("Có lỗi xảy ra khi cập nhật trạng thái mã giảm giá");
    }
  };

  const handleDeletePromoCode = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) {
      return;
    }

    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "promo",
          action: "delete",
          id,
        }),
      });

      const data = await response.json();
      if (data.ok) {
        setMessage("Mã giảm giá đã được xóa!");
        fetchNotifications();
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error deleting promo code:", error);
      setMessage("Có lỗi xảy ra khi xóa mã giảm giá");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full">
        <div className="border-b border-gray-200">
          <h1 className="text-2xl font-bold text-black py-12 px-8 uppercase tracking-wide">Quản lý thông báo và mã giảm giá</h1>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border-b border-green-200 text-green-700 px-8 py-2 text-sm"
          >
            {message}
          </motion.div>
        )}

        <div className="p-8">
          <div className="border border-gray-200 mb-6">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-bold text-black">Thông báo chạy ngang</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleAnnouncementSubmit}>
                <div className="mb-4">
                  <textarea
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                    className="w-full border border-gray-200 px-3 py-2 text-sm text-black focus:outline-none focus:border-gray-400"
                    rows={3}
                    placeholder="Nhập nội dung thông báo..."
                  />
                </div>
                <div className="mb-4">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={isAnnouncementActive}
                      onChange={(e) => setIsAnnouncementActive(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-black"
                    />
                    <span className="ml-2 text-black">Hiển thị thông báo</span>
                  </label>
                </div>
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 text-sm hover:bg-gray-800"
                >
                  Cập nhật thông báo
                </button>
              </form>
            </div>
          </div>

          <div className="border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-bold text-black">Mã giảm giá</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleAddPromoCode} className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <input
                      type="text"
                      value={newPromoCode}
                      onChange={(e) => setNewPromoCode(e.target.value)}
                      className="w-full border border-gray-200 px-3 py-2 text-sm text-black focus:outline-none focus:border-gray-400"
                      placeholder="Nhập mã giảm giá..."
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={newPromoAmount}
                      onChange={(e) => setNewPromoAmount(e.target.value)}
                      className="w-full border border-gray-200 px-3 py-2 text-sm text-black focus:outline-none focus:border-gray-400"
                      placeholder="Nhập số tiền giảm (VD: 100.000đ)"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 text-sm hover:bg-gray-800"
                >
                  Thêm mã giảm giá
                </button>
              </form>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-2 px-4 text-left text-sm font-bold text-black">Mã giảm giá</th>
                      <th className="py-2 px-4 text-left text-sm font-bold text-black">Số tiền giảm</th>
                      <th className="py-2 px-4 text-left text-sm font-bold text-black">Trạng thái</th>
                      <th className="py-2 px-4 text-left text-sm font-bold text-black">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promoCodes.map((promo) => (
                      <tr key={promo.id} className="border-b border-gray-100">
                        <td className="py-2 px-4 text-sm text-black">{promo.code}</td>
                        <td className="py-2 px-4 text-sm text-black">{promo.amount.toLocaleString()}đ</td>
                        <td className="py-2 px-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={promo.isActive}
                              onChange={(e) => handleTogglePromoCode(promo.id, e.target.checked)}
                              className="form-checkbox h-4 w-4 text-black"
                            />
                            <span className="ml-2 text-sm text-black">
                              {promo.isActive ? "Đang kích hoạt" : "Đã tắt"}
                            </span>
                          </label>
                        </td>
                        <td className="py-2 px-4">
                          <button
                            onClick={() => handleDeletePromoCode(promo.id)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 