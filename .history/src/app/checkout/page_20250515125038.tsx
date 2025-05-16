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
    // Không xóa mã sau khi áp dụng thành công
  } catch (error) {
    setDiscountError("Có lỗi xảy ra khi kiểm tra mã giảm giá");
    setDiscountSuccess("");
    setAppliedDiscount(null);
  }
}; 