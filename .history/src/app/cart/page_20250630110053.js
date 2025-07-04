"use client";
import { motion } from "framer-motion";
import { useCart } from "../../context/CartContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useWishlist } from "../../context/WishlistContext";
import { useTranslation } from 'react-i18next';

export default function Cart() {
  const { cartItems, updateQuantity, removeItem, setCartItems } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoAmount, setPromoAmount] = useState(0);
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [productStock, setProductStock] = useState(null);
  const [editingQuantity, setEditingQuantity] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useTranslation();

  const sizes = ["M", "L", "XL"];

  const calculateTotal = () => {
    const subtotal = cartItems
      .reduce((total, item) => {
        const itemTotal = item.price * item.quantity;
        return total + itemTotal;
      }, 0);

    const finalTotal = subtotal - (isPromoApplied ? promoAmount : 0);
    
    return finalTotal.toLocaleString('vi-VN') + " VND";
  };

  const handleQuantityChange = (item, newQuantity) => {
    const stockQuantity = item.currentStock || item.stock?.[item.size] || 0;
    
    if (newQuantity >= 1 && newQuantity <= stockQuantity) {
      updateQuantity(item.id, newQuantity);
    } else if (newQuantity > stockQuantity) {
      alert(`Chỉ còn ${stockQuantity} sản phẩm trong kho cho size ${item.size}`);
    }
  };

  const handleEdit = async (item) => {
    setEditingItem(item);
    setSelectedSize(item.size || "M");
    setEditingQuantity(item.quantity);
    setShowEditModal(true);

    // Fetch lại thông tin sản phẩm để lấy stock
    try {
      const res = await fetch(`/api/products/${item.id}`);
      const data = await res.json();
      if (data.ok) {
        setProductStock(data.product);
      } else {
        setProductStock(null);
      }
    } catch (err) {
      setProductStock(null);
    }
  };

  const handleSizeChange = async (e) => {
    const newSize = e.target.value;
    setSelectedSize(newSize);

    // Lấy thông tin stock từ item hiện tại
    const currentItem = cartItems.find(item => item.id === editingItem.id);
    if (currentItem) {
      const sizeQuantity = currentItem.stock?.[newSize] || 0;
      setEditingQuantity(sizeQuantity > 0 ? 1 : 0); // luôn reset về 1 hoặc 0
    }
  };

  const handleSaveChanges = () => {
    if (editingItem && selectedSize) {
      const currentItem = cartItems.find(item => item.id === editingItem.id);
      if (!currentItem) return;

      const sizeQuantity = productStock?.[`quantity${selectedSize}`] || 0;
      if (editingQuantity > sizeQuantity) {
        alert(`Chỉ còn ${sizeQuantity} sản phẩm trong kho cho size ${selectedSize}`);
        return;
      }

      updateQuantity(editingItem.id, editingQuantity, selectedSize, sizeQuantity);
    }
    setShowEditModal(false);
    setEditingItem(null);
    setProductStock(null);
    setEditingQuantity(1);
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingItem(null);
    setProductStock(null);
    setEditingQuantity(1);
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      removeItem(itemToDelete.id);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleApplyPromoCode = async () => {
    // Reset states khi người dùng nhập mã mới
    setPromoMessage("");
    setPromoAmount(0);
    setIsPromoApplied(false);

    if (!promoCode.trim()) {
      setPromoMessage("Vui lòng nhập mã giảm giá");
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
        setPromoAmount(data.totalDiscount);
        setIsPromoApplied(true);
        setPromoMessage(`Mã giảm giá ${data.totalDiscount.toLocaleString('vi-VN')} VND đã được áp dụng!`);
        setCartItems(data.cartItems);
      } else {
        setPromoMessage(data.message || "Mã giảm giá không hợp lệ hoặc đã hết hạn");
        setPromoAmount(0);
        setIsPromoApplied(false);
      }
    } catch (error) {
      console.error("Error applying promo code:", error);
      setPromoMessage("Có lỗi xảy ra khi áp dụng mã giảm giá");
      setPromoAmount(0);
      setIsPromoApplied(false);
    }
  };

  // Thêm hàm reset mã giảm giá
  const handleResetPromoCode = () => {
    setPromoCode("");
    setPromoMessage("");
    setPromoAmount(0);
    setIsPromoApplied(false);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Bạn không có sản phẩm nào trong shopping bag cả.");
      return;
    }
    router.push("/checkout");
  };

  return (
    <div className="bg-white">
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        backgroundColor: "#FFFFFF",
      }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full h-[300px] sm:h-[400px] bg-cover bg-center text-white flex justify-center items-center"
        style={{
          backgroundImage: `url('https://i.postimg.cc/YqJ07fYf/BANNER0-1-compressed.jpg')`,
          backgroundPosition: 'center top',
        }}
      >
        <h1 className="text-5xl sm:text-6xl font-bold uppercase text-center md:text-left">{t('cart.shoppingBag')}</h1>
      </motion.div>

      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pt-8 pb-8 md:pt-16 md:pb-16">
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <h1 style={{
              fontSize: "1.5em",
              fontWeight: "bold",
              marginBottom: "20px",
              color: "#000000",
              textTransform: "uppercase",
              borderBottom: "2px solid #000000",
              display: "inline-block",
              paddingBottom: "5px"
            }}>
              {t('cart.shoppingBag')}
            </h1>
            <p style={{ 
              fontSize: "1em", 
              color: "#000000", 
              marginTop: "20px",
              marginBottom: "20px" 
            }}>
              Bạn không có sản phẩm nào trong shopping bag cả.
            </p>
            <button
              onClick={() => router.push('/products')}
              style={{
                backgroundColor: "#000000",
                color: "#FFFFFF",
                padding: "10px 20px",
                border: "none",
                cursor: "pointer",
                fontSize: "0.9em"
              }}
            >
              Khám phá sản phẩm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 md:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7"
            >
              <div className="mb-6">
                <h2 style={{
                  fontSize: "1em",
                  fontWeight: "bold",
                  marginBottom: "15px",
                  color: "#000000",
                  textAlign: "left",
                  borderBottom: "1px solid #000000",
                  paddingBottom: "10px"
                }}>
                  YOUR SELECTIONS
                </h2>
              </div>
              {cartItems.map((item) => (
                <div key={item.cartItemId || `${item.id}-${item.size}`}
                  className="flex flex-col md:flex-row items-start mb-8 pb-12 md:mb-8 md:pb-12 border-b-2 border-black last:border-b-0 gap-2 md:gap-0"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-30 h-30 md:w-40 md:h-40 object-cover rounded mx-auto md:mx-0 mb-2 md:mb-0"
                  />
                  <div className="flex-1 flex flex-col">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1 md:gap-0">
                      <p className="text-xs md:text-base font-bold text-black mb-1">{item.name}</p>
                      <p className="text-xs md:text-sm text-black font-bold">{(item.price * item.quantity).toLocaleString('vi-VN')} VND</p>
                    </div>
                    <p className="text-xs text-black mb-1">Color: {item.color || "Black"}</p>
                    <p className="text-xs text-black mb-1">Size: {item.size || "Unknown"}</p>
                    <p className="text-xs font-bold text-black mb-1">{item.status || "ORDER"}</p>
                    <p className="text-xs text-black mb-1">{item.shippingInfo || "Expected 2-3 days"}</p>
                    <div className="flex items-center mt-2 gap-1 md:gap-2">
                      <button
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center border border-black text-black text-xs bg-transparent disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >−</button>
                      <span className="w-6 md:w-7 text-center text-xs text-black border border-black py-1">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center border border-black text-black text-xs bg-transparent disabled:opacity-50"
                        disabled={item.quantity >= (item.currentStock || item.stock?.[item.size] || 0)}
                      >+</button>
                      <span className="text-xs text-black ml-1 md:ml-2">({item.currentStock || item.stock?.[item.size] || 0} items left)</span>
                    </div>
                    <div className="flex gap-1 md:gap-2 mt-2 items-center">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-xs text-black underline bg-transparent border-none font-bold"
                      >EDIT</button>
                      <span className="text-xs text-black font-bold">|</span>
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-xs text-black underline bg-transparent border-none font-bold"
                      >DELETE</button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-3"
            >
                <div className="bg-white p-6 rounded-lg sticky top-4" style={{
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}>
                <h2 style={{
                  fontSize: "1em",
                  fontWeight: "bold",
                  marginBottom: "15px",
                  color: "#000000",
                  textAlign: "left",
                  borderBottom: "1px solid #000000",
                  paddingBottom: "10px"
                }}>
                  ORDER SUMMARY
                </h2>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.cartItemId || `${item.id}-${item.size}`} style={{
                      display: "flex",
                      gap: "15px",
                      marginBottom: "20px",
                      color: "#000000",
                    }}>
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                        }}
                      />
                      <div style={{
                        color: "#000000",
                        flex: 1,
                      }}>
                        <p style={{ 
                          fontWeight: "bold", 
                          marginBottom: "6px", 
                          fontSize: "0.9em" 
                        }}>
                          {item.name}
                        </p>
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                          fontSize: "0.7em",
                          color: "#000000",
                        }}>
                            <span>Quantity:</span>
                          <span>{item.quantity}</span>
                        </div>
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                          fontSize: "0.7em",
                          color: "#000000",
                        }}>
                            <span>Color:</span>
                            <span>{item.color || "Black"}</span>
                        </div>
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                          fontSize: "0.7em",
                          color: "#000000",
                        }}>
                            <span>Size:</span>
                          <span>{item.size || "Unknown"}</span>
                        </div>
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                          fontSize: "0.7em",
                          color: "#000000",
                        }}>
                            <span>Time:</span>
                            <span>{item.shippingInfo || "Expected 2-3 days"}</span>
                        </div>
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                          fontSize: "0.7em",
                          color: "#000000",
                        }}>
                            <span>Price:</span>
                            <span>{(item.price * item.quantity).toLocaleString('vi-VN')} VND</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    fontSize: "0.7em",
                    color: "#000000",
                  }}>
                  </div>
                    {isPromoApplied && (
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    fontSize: "0.7em",
                    color: "#000000",
                  }}>
                        <span>Discount</span>
                        <span>- {promoAmount.toLocaleString('vi-VN')} VND</span>
                  </div>
                    )}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    fontSize: "0.7em",
                    fontWeight: "bold",
                    color: "#000000",
                  }}>
                      <span>Total</span>
                      <span>{calculateTotal()}</span>
                    </div>
                  </div>
                  <div style={{
                  paddingTop: "10px",
                  marginTop: "20px"
                }}>
                  <div style={{ 
                    borderTop: "1px solid #000000", 
                    borderBottom: "1px solid #000000", 
                    paddingTop: "10px", 
                    paddingBottom: "10px",
                    marginTop: "20px"
                  }}>
                    <p style={{ marginBottom: "10px", fontWeight: "bold", fontSize: "0.8em", color: "#000000" }}>MAY WE HELP?</p>
                    <p style={{ marginBottom: "10px", fontSize: "0.75em", color: "#000000" }}>0347272386</p>
                    <p style={{ marginBottom: "10px", fontSize: "0.75em", color: "#000000" }}>aish.aish.vn@gmail.com</p>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-black text-white text-sm font-semibold py-3 px-4 mt-8 rounded hover:bg-gray-800 transition-colors"
                >
                  CHECK OUT
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {showEditModal && editingItem && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 w-11/12 max-w-2xl relative"
          >
            <button
              onClick={handleCancelEdit}
              className="absolute top-4 right-4 text-black"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="text-center py-4">
              <p style={{ fontSize: "0.7em", color: "#000000", textTransform: "uppercase", letterSpacing: "0.1em" }}>EDIT YOUR SELECTION</p>
              <h2 style={{ fontSize: "0.9em", color: "#000000", marginTop: "8px" }}>{editingItem.name}</h2>
              <p style={{ fontSize: "0.7em", color: "#000000", marginTop: "4px", fontWeight: "bold" }}>
                {editingItem.price?.toLocaleString('vi-VN')} VND
              </p>
            </div>
            <div className="flex flex-col md:flex-row border-t border-gray-200">
              <div className="md:w-1/2 p-6 flex flex-col items-center justify-center border-r border-gray-200">
                <img
                  src={editingItem.image}
                  alt={editingItem.name}
                  style={{
                    width: "160px",
                    height: "160px",
                    objectFit: "cover",
                    marginBottom: "16px"
                  }}
                />
                <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "0.7em", color: "#000000", marginBottom: "4px" }}>Color: {editingItem.color || "Black"}</p>
                    <p style={{ fontSize: "0.7em", color: "#000000" }}>Size: {editingItem.size || "M"}</p>
                </div>
              </div>
              <div className="md:w-1/2 p-6">
                <div className="mb-6">
                  <label style={{ 
                    display: "block", 
                    marginBottom: "8px", 
                    fontSize: "0.7em", 
                    color: "#000000", 
                    textTransform: "uppercase", 
                    letterSpacing: "0.1em" 
                  }}>
                    SIZE
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSize}
                        onChange={handleSizeChange}
                      style={{
                        width: "100%",
                        padding: "8px",
                        fontSize: "0.7em",
                        color: "#000000",
                        border: "1px solid #000000",
                        appearance: "none",
                        background: "white",
                        cursor: "pointer"
                      }}
                    >
                        {sizes.map((size) => {
                          const sizeQuantity = productStock?.[`quantity${size}`] || 0;
                          const isDisabled = sizeQuantity === 0;
                          return (
                            <option 
                              key={size} 
                              value={size}
                              disabled={isDisabled}
                              style={{
                                color: isDisabled ? "#999" : "#000",
                                backgroundColor: isDisabled ? "#f5f5f5" : "white"
                              }}
                            >
                              {size} - {isDisabled ? "Hết hàng" : `Còn ${sizeQuantity}`}
                        </option>
                          );
                        })}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "0.7em", color: "#000000", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    STOCK QUANTITY
                  </label>
                  <div style={{ fontSize: "0.7em", color: "#000000" }}>
                    {productStock ? (productStock[`quantity${selectedSize}`] || 0) : 0} items
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200">
              <button
                onClick={handleSaveChanges}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "0.7em",
                  color: "#ffffff",
                  backgroundColor: "#000000",
                  border: "none",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em"
                }}
              >
                Save Changes
              </button>
              <button
                onClick={handleCancelEdit}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "0.7em",
                  color: "#000000",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em"
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showDeleteModal && itemToDelete && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 w-11/12 max-w-md relative"
          >
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-black"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="text-center py-8">
              <p style={{ fontSize: "0.7em", color: "#000000", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
                CONFIRM REMOVAL
              </p>
              <p style={{ fontSize: "0.9em", color: "#000000", marginBottom: "8px" }}>
                Are you sure you want to remove this item?
              </p>
              <p style={{ fontSize: "0.7em", color: "#000000" }}>
                {itemToDelete.name}
              </p>
            </div>
            <div className="border-t border-gray-200">
              <button
                onClick={confirmDelete}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "0.7em",
                  color: "#ffffff",
                  backgroundColor: "#000000",
                  border: "none",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em"
                }}
              >
                Confirm
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "0.7em",
                  color: "#000000",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em"
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <style jsx>{`
        .underline-btn {
          position: relative;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .underline-btn::after {
          content: "";
          position: absolute;
          width: 0;
          height: 1px;
          bottom: -1px;
          left: 0;
          background-color: currentColor;
          transition: width 0.3s ease;
        }
        .underline-btn:hover::after {
          width: 100%;
        }
        .underline-btn:hover {
          color: #000;
        }
        .underline-btn.remove:hover {
          color: #dc2626;
        }
      `}</style>
      </div>
    </div>
  );
}
