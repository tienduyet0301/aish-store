"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface PromoCode {
  id: string;
  code: string;
  amount?: number; // amount có thể không tồn tại nếu type là percentage
  isActive: boolean;
  type: 'fixed' | 'percentage'; // Thêm loại giảm giá
  value: number; // Số tiền hoặc phần trăm
  maxAmount?: number; // Giới hạn tối đa cho percentage
  isLoginRequired?: boolean; // Yêu cầu đăng nhập
  perUserLimit?: number; // Giới hạn sử dụng mỗi người dùng
  usedByUsers?: string[]; // Danh sách người dùng đã dùng
  expiryDate?: string; // Ngày hết hạn
  usedCount?: number; // Tổng số lần đã dùng
}

export default function NotificationsAdmin() {
  const [announcement, setAnnouncement] = useState("");
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(false);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoType, setNewPromoType] = useState<'fixed' | 'percentage'>('fixed'); // State cho loại giảm giá
  const [newPromoValue, setNewPromoValue] = useState(""); // State cho giá trị (tiền hoặc %) - dùng string để dễ nhập liệu
  const [newPromoMaxAmount, setNewPromoMaxAmount] = useState(""); // State cho giới hạn tối đa
  const [newPromoIsLoginRequired, setNewPromoIsLoginRequired] = useState(false); // State yêu cầu đăng nhập
  const [newPromoPerUserLimit, setNewPromoPerUserLimit] = useState(""); // State giới hạn mỗi người dùng
  const [newPromoExpiryDate, setNewPromoExpiryDate] = useState(""); // State ngày hết hạn
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/admin/notifications");
      const data = await response.json();
      if (data.ok) {
        // Filter out announcement and only set promo codes
        const fetchedPromoCodes = data.notifications.filter((notif: any) => notif.type === 'promo');
        const announcementNotif = data.notifications.find((notif: any) => notif.type === 'announcement');

        if(announcementNotif) {
           setAnnouncement(announcementNotif.content);
           setIsAnnouncementActive(announcementNotif.isActive);
        }

        // Map data to match PromoCode interface
        const formattedPromoCodes: PromoCode[] = fetchedPromoCodes.map((code: any) => ({
          id: code._id.toString(),
          code: code.code,
          type: code.type || 'fixed', // Default to fixed if type is missing
          value: code.value !== undefined ? code.value : code.amount, // Use value if available, fallback to amount
          amount: code.amount, // Keep amount for backward compatibility if needed
          maxAmount: code.maxAmount,
          isActive: code.isActive,
          isLoginRequired: code.isLoginRequired || false,
          perUserLimit: code.perUserLimit || 0,
          usedByUsers: code.usedByUsers || [],
          expiryDate: code.expiryDate,
          usedCount: code.usedCount || 0,
        }));
        setPromoCodes(formattedPromoCodes);

      } else {
         setMessage(data.message || "Failed to fetch notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setMessage("Có lỗi xảy ra khi lấy dữ liệu thông báo và mã giảm giá");
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
    console.log("Adding promo code:", { newPromoCode, newPromoType, newPromoValue, newPromoMaxAmount, newPromoIsLoginRequired, newPromoPerUserLimit, newPromoExpiryDate });

    if (!newPromoCode.trim() || !newPromoValue.trim()) {
      setMessage("Vui lòng nhập đầy đủ mã và giá trị giảm giá");
      return;
    }

    const promoValueNumeric = parseFloat(newPromoValue.replace(/[^0-9.-]+/g, ''));

    if (isNaN(promoValueNumeric) || promoValueNumeric <= 0) {
        setMessage(newPromoType === 'fixed' ? "Số tiền giảm giá không hợp lệ" : "Phần trăm giảm giá không hợp lệ");
        return;
    }

    let promoMaxAmountNumeric: number | undefined = undefined;
    if (newPromoType === 'percentage' && newPromoMaxAmount.trim()) {
        promoMaxAmountNumeric = parseFloat(newPromoMaxAmount.replace(/[^0-9.-]+/g, ''));
        if (isNaN(promoMaxAmountNumeric) || promoMaxAmountNumeric < 0) {
            setMessage("Giới hạn tối đa không hợp lệ");
            return;
        }
    }

    const promoPerUserLimitNumeric = parseInt(newPromoPerUserLimit.trim());
    if (newPromoPerUserLimit.trim() && (isNaN(promoPerUserLimitNumeric) || promoPerUserLimitNumeric < 0)) {
         setMessage("Giới hạn sử dụng mỗi người dùng không hợp lệ");
         return;
    }

    const promoExpiryDateValue = newPromoExpiryDate ? new Date(newPromoExpiryDate).toISOString() : undefined; // Lưu ISO string

    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "promo",
          action: "add",
          code: newPromoCode.trim().toUpperCase(), // Lưu mã code viết hoa
          promoType: newPromoType, // Gửi loại giảm giá
          promoValue: promoValueNumeric, // Gửi giá trị số
          promoMaxAmount: promoMaxAmountNumeric, // Gửi giới hạn tối đa
          isLoginRequired: newPromoIsLoginRequired, // Gửi yêu cầu đăng nhập
          perUserLimit: promoPerUserLimitNumeric || 0, // Gửi giới hạn mỗi người dùng (0 nếu trống/không hợp lệ)
          expiryDate: promoExpiryDateValue, // Gửi ngày hết hạn
          isActive: true, // Mặc định kích hoạt khi tạo mới
          usedByUsers: [], // Khởi tạo mảng rỗng
          usedCount: 0, // Khởi tạo số lần dùng là 0
        }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (data.ok) {
        setMessage("Mã giảm giá đã được thêm!");
        setNewPromoCode("");
        setNewPromoType('fixed');
        setNewPromoValue("");
        setNewPromoMaxAmount("");
        setNewPromoIsLoginRequired(false);
        setNewPromoPerUserLimit("");
        setNewPromoExpiryDate("");
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
                    <label className="block text-sm font-medium text-black mb-1">Mã giảm giá</label>
                    <input
                      type="text"
                      value={newPromoCode}
                      onChange={(e) => setNewPromoCode(e.target.value)}
                      className="w-full border border-gray-200 px-3 py-2 text-sm text-black focus:outline-none focus:border-gray-400"
                      placeholder="VD: NEWCODE20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Loại giảm giá</label>
                    <select
                      value={newPromoType}
                      onChange={(e) => setNewPromoType(e.target.value as 'fixed' | 'percentage')}
                      className="w-full border border-gray-200 px-3 py-2 text-sm text-black focus:outline-none focus:border-gray-400"
                    >
                      <option value="fixed">Giảm theo số tiền cố định</option>
                      <option value="percentage">Giảm theo phần trăm (%)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Giá trị giảm giá ({newPromoType === 'fixed' ? 'VND' : '%'})</label>
                    <input
                      type="text"
                      value={newPromoValue}
                      onChange={(e) => setNewPromoValue(e.target.value)}
                      className="w-full border border-gray-200 px-3 py-2 text-sm text-black focus:outline-none focus:border-gray-400"
                      placeholder={newPromoType === 'fixed' ? "VD: 50000" : "VD: 20"}
                      required
                    />
                  </div>
                  {newPromoType === 'percentage' && (
                    <div>
                       <label className="block text-sm font-medium text-black mb-1">Giới hạn tối đa (VND, tùy chọn)</label>
                       <input
                         type="text"
                         value={newPromoMaxAmount}
                         onChange={(e) => setNewPromoMaxAmount(e.target.value)}
                         className="w-full border border-gray-200 px-3 py-2 text-sm text-black focus:outline-none focus:border-gray-400"
                         placeholder="VD: 100000"
                       />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                   <div>
                      <label className="block text-sm font-medium text-black mb-1">Ngày hết hạn (tùy chọn)</label>
                      <input
                        type="date"
                        value={newPromoExpiryDate}
                        onChange={(e) => setNewPromoExpiryDate(e.target.value)}
                        className="w-full border border-gray-200 px-3 py-2 text-sm text-black focus:outline-none focus:border-gray-400"
                      />
                   </div>
                    <div>
                       <label className="block text-sm font-medium text-black mb-1">Giới hạn sử dụng mỗi người dùng (tùy chọn, 0 = không giới hạn)</label>
                       <input
                         type="number"
                         value={newPromoPerUserLimit}
                         onChange={(e) => setNewPromoPerUserLimit(e.target.value)}
                         className="w-full border border-gray-200 px-3 py-2 text-sm text-black focus:outline-none focus:border-gray-400"
                         placeholder="VD: 1"
                         min="0"
                       />
                    </div>
                </div>

                <div className="mb-4">
                   <label className="flex items-center text-sm font-medium text-black">
                     <input
                       type="checkbox"
                       checked={newPromoIsLoginRequired}
                       onChange={(e) => setNewPromoIsLoginRequired(e.target.checked)}
                       className="form-checkbox h-4 w-4 text-black"
                     />
                     <span className="ml-2">Yêu cầu đăng nhập để sử dụng</span>
                   </label>
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
                      <th className="py-2 px-4 text-left text-sm font-bold text-black">Loại</th>
                      <th className="py-2 px-4 text-left text-sm font-bold text-black">Giá trị</th>
                      <th className="py-2 px-4 text-left text-sm font-bold text-black">Tối đa</th>
                      <th className="py-2 px-4 text-left text-sm font-bold text-black">Yêu cầu ĐN</th>
                      <th className="py-2 px-4 text-left text-sm font-bold text-black">Giới hạn mỗi users</th>
                       <th className="py-2 px-4 text-left text-sm font-bold text-black">Đã dùng</th>
                       <th className="py-2 px-4 text-left text-sm font-bold text-black">Hết hạn</th>
                      <th className="py-2 px-4 text-left text-sm font-bold text-black">Trạng thái</th>
                      <th className="py-2 px-4 text-left text-sm font-bold text-black">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promoCodes.map((promo) => (
                      <tr key={promo.id} className="border-b border-gray-100">
                        <td className="py-2 px-4 text-sm text-black">{promo.code}</td>
                        <td className="py-2 px-4 text-sm text-black">{promo.type === 'fixed' ? 'Tiền' : '%'}</td>
                        <td className="py-2 px-4 text-sm text-black">{promo.value}{promo.type === 'fixed' ? '₫' : '%'}</td>
                        <td className="py-2 px-4 text-sm text-black">{promo.maxAmount !== undefined && promo.maxAmount !== null ? promo.maxAmount.toLocaleString() + '₫' : '---'}</td>
                        <td className="py-2 px-4 text-sm text-black">{promo.isLoginRequired ? 'Có' : 'Không'}</td>
                        <td className="py-2 px-4 text-sm text-black">{promo.perUserLimit !== undefined && promo.perUserLimit > 0 ? promo.perUserLimit : 'Không giới hạn'}</td>
                         <td className="py-2 px-4 text-sm text-black">{promo.usedCount !== undefined ? promo.usedCount : 'N/A'}</td>
                         <td className="py-2 px-4 text-sm text-black">{promo.expiryDate ? new Date(promo.expiryDate).toLocaleDateString() : '---'}</td>
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