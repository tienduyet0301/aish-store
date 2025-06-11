const handleApplyPromoCode = async () => {
  if (!promoCode.trim()) {
    setMessage("Vui lòng nhập mã giảm giá");
    return;
  }

  try {
    const response = await fetch("/api/cart/apply-promo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        promoCode: promoCode.trim(),
        cartItems: cartItems
      }),
    });

    const data = await response.json();
    console.log('Apply promo response:', data); // Debug log

    if (data.ok) {
      setMessage("Áp dụng mã giảm giá thành công!");
      setCartItems(data.cartItems);
      setTotalDiscount(data.totalDiscount);
      setPromoCode("");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage(data.message || "Có lỗi xảy ra khi áp dụng mã giảm giá");
    }
  } catch (error) {
    console.error("Error applying promo code:", error);
    setMessage("Có lỗi xảy ra khi áp dụng mã giảm giá");
  }
}; 