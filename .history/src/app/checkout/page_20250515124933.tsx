import React, { useState } from "react";

const [discountCode, setDiscountCode] = useState("");
const [discountError, setDiscountError] = useState("");
const [discountSuccess, setDiscountSuccess] = useState("");
const [appliedDiscount, setAppliedDiscount] = useState<{
  code: string;
  amount: number;
} | null>(null);

const handleApplyDiscount = async () => {
  if (!discountCode.trim()) {
    setDiscountError("Vui lòng nhập mã giảm giá");
    setDiscountSuccess("");
    return;
  }

  try {
    const response = await fetch("/api/discount/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: discountCode }),
    });

    const data = await response.json();

    if (!response.ok) {
      setDiscountError(data.message || "Mã giảm giá không hợp lệ");
      setDiscountSuccess("");
      setAppliedDiscount(null);
      return;
    }

    if (data.isExpired) {
      setDiscountError("Mã giảm giá đã hết hạn");
      setDiscountSuccess("");
      setAppliedDiscount(null);
      return;
    }

    // Nếu mã hợp lệ và chưa hết hạn
    setDiscountSuccess("Áp dụng mã giảm giá thành công");
    setDiscountError("");
    setAppliedDiscount({
      code: discountCode,
      amount: data.discountAmount,
    });
    setDiscountCode(""); // Xóa mã sau khi áp dụng thành công
  } catch (error) {
    setDiscountError("Có lỗi xảy ra khi kiểm tra mã giảm giá");
    setDiscountSuccess("");
    setAppliedDiscount(null);
  }
};

{/* Discount Code Section */}
<div className="mt-6">
  <div className="flex items-center gap-2">
    <input
      type="text"
      value={discountCode}
      onChange={(e) => setDiscountCode(e.target.value)}
      placeholder="Nhập mã giảm giá"
      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
    />
    <button
      onClick={handleApplyDiscount}
      className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
    >
      Áp dụng
    </button>
  </div>
  {discountError && (
    <p className="mt-2 text-sm text-red-500">{discountError}</p>
  )}
  {discountSuccess && (
    <p className="mt-2 text-sm text-green-500">{discountSuccess}</p>
  )}
  {appliedDiscount && (
    <div className="mt-2 flex items-center justify-between text-sm">
      <span className="text-gray-600">Mã giảm giá: {appliedDiscount.code}</span>
      <span className="text-green-500">-{formatPrice(appliedDiscount.amount)}</span>
    </div>
  )}
</div> 