"use client";
import { motion } from "framer-motion";
import { useCart } from "../../context/CartContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Cart() {
  const { cartItems, updateQuantity, removeItem } = useCart();
  const router = useRouter();
  const [savedItems, setSavedItems] = useState([]);
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

  const sizes = ["M", "L", "XL"];

  const calculateTotal = () => {
    const subtotal = cartItems
      .reduce((total, item) => {
        const itemTotal = item.price * item.quantity;
        return total + itemTotal;
      }, 0);

    const finalTotal = subtotal - (isPromoApplied ? promoAmount : 0);
    
    return finalTotal.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND'
    });
  };

  const handleQuantityChange = (item, newQuantity) => {
    const stockQuantity = item.currentStock || item.stock?.[item.size] || 0;
    
    if (newQuantity >= 1 && newQuantity <= stockQuantity) {
      updateQuantity(item.id, newQuantity);
    } else if (newQuantity > stockQuantity) {
      alert(`Chỉ còn ${stockQuantity} sản phẩm trong kho cho size ${item.size}`);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setSelectedSize(item.size || "M");
    setEditingQuantity(item.quantity);
    setShowEditModal(true);
  };

  const handleSizeChange = async (e) => {
    const newSize = e.target.value;
    setSelectedSize(newSize);

    // Lấy thông tin stock từ item hiện tại
    const currentItem = cartItems.find(item => item.id === editingItem.id);
    if (currentItem) {
      const sizeQuantity = currentItem.stock?.[newSize] || 0;
      setEditingQuantity(Math.min(editingQuantity, sizeQuantity));
    }
  };

  const handleSaveChanges = () => {
    if (editingItem && selectedSize) {
      const currentItem = cartItems.find(item => item.id === editingItem.id);
      if (!currentItem) return;

      const sizeQuantity = currentItem.stock?.[selectedSize] || 0;
      if (editingQuantity > sizeQuantity) {
        alert(`Chỉ còn ${sizeQuantity} sản phẩm trong kho cho size ${selectedSize}`);
        return;
      }

      updateQuantity(editingItem.id, editingQuantity, selectedSize);
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

  const handleSaveItem = (item) => {
    setSavedItems(prev => {
      const isAlreadySaved = prev.some(savedItem => savedItem.id === item.id);
      if (isAlreadySaved) {
        const updatedItems = prev.filter(savedItem => savedItem.id !== item.id);
        localStorage.setItem('savedItems', JSON.stringify(updatedItems));
        return updatedItems;
      } else {
        const updatedItems = [...prev, { ...item, savedAt: new Date().toISOString() }];
        localStorage.setItem('savedItems', JSON.stringify(updatedItems));
        return updatedItems;
      }
    });

    const message = savedItems.some(savedItem => savedItem.id === item.id) 
      ? "Item removed from saved items"
      : "Item saved successfully";
    alert(message);
  };

  useEffect(() => {
    const loadSavedItems = () => {
      try {
        const savedItemsFromStorage = JSON.parse(localStorage.getItem('savedItems') || '[]');
        setSavedItems(savedItemsFromStorage);
      } catch (error) {
        console.error('Error loading saved items:', error);
        setSavedItems([]);
      }
    };

    loadSavedItems();

    window.addEventListener('storage', loadSavedItems);
    return () => window.removeEventListener('storage', loadSavedItems);
  }, []);

  useEffect(() => {
    const fetchProductStock = async () => {
      if (editingItem) {
        try {
          const response = await fetch(`/api/products/${editingItem.id}`);
          const data = await response.json();
          if (data.ok) {
            setProductStock(data.product);
            setEditingQuantity(1);
          }
        } catch (error) {
          console.error("Error fetching product stock:", error);
        }
      }
    };

    fetchProductStock();
  }, [editingItem]);

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
      const response = await fetch("/api/admin/notifications");
      const data = await response.json();
      
      // Debug log
      console.log("API Response:", data);
      console.log("Promo Code Input:", promoCode);
      
      if (data.ok && data.promoCodes) {
        // Tìm mã giảm giá trong mảng promoCodes
        const foundPromo = data.promoCodes.find(
          promo => promo.code.toLowerCase() === promoCode.toLowerCase() && promo.isActive
        );
        
        if (foundPromo) {
          setPromoAmount(foundPromo.amount);
          setIsPromoApplied(true);
          setPromoMessage(`Mã giảm giá ${foundPromo.amount.toLocaleString('vi-VN')} VND đã được áp dụng!`);
        } else {
          setPromoMessage("Mã giảm giá không hợp lệ hoặc đã hết hạn");
          setPromoAmount(0);
          setIsPromoApplied(false);
        }
      } else {
        setPromoMessage("Không thể kiểm tra mã giảm giá");
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
    <div className="bg-gray-100">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full h-[300px] sm:h-[400px] bg-cover bg-center text-white flex justify-center items-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`,
        }}
      >
        <h1 className="text-5xl sm:text-6xl font-bold uppercase">SHOPPING BAG</h1>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16">
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
              SHOPPING BAG
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
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
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
                <div key={item.cartItemId || `${item.id}-${item.size}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-start mb-8 pb-12`}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-40 h-40 object-cover mr-6 rounded"
                    />
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <p style={{ 
                          fontSize: "0.9em",
                          fontWeight: "bold",
                          color: "#000000",
                          marginBottom: "6px"
                        }}>{item.name}</p>
                        <p style={{ 
                          fontSize: "0.7em",
                          color: "#000000",
                          fontWeight: "bold"
                        }}>
                          {(item.price * item.quantity).toLocaleString('vi-VN')} VND
                        </p>
                      </div>
                      <p style={{ 
                        fontSize: "0.7em",
                        color: "#000000",
                        marginBottom: "4px"
                      }}>
                        Màu: {item.color || "Đen"}
                      </p>
                      <p style={{ 
                        fontSize: "0.7em",
                        color: "#000000",
                        marginBottom: "4px"
                      }}>
                        Size: {item.size || "M"}
                      </p>
                      <p style={{ 
                        fontSize: "0.7em",
                        fontWeight: "bold",
                        color: "#000000",
                        marginBottom: "4px"
                      }}>
                        {item.status || "ORDER"}
                      </p>
                      <p style={{ 
                        fontSize: "0.7em",
                        color: "#000000",
                        marginBottom: "4px"
                      }}>
                        {item.shippingInfo || "Dự kiến 5 ngày"}
                      </p>
                      <div className="flex items-center mt-4 space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          style={{
                            width: "24px",
                            height: "24px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            border: "1px solid #000000",
                            color: "#000000",
                            fontSize: "0.7em",
                            backgroundColor: "transparent",
                            cursor: "pointer"
                          }}
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span style={{
                          width: "24px",
                          textAlign: "center",
                          fontSize: "0.7em",
                          color: "#000000",
                          border: "1px solid #000000",
                          padding: "2px 0"
                        }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          style={{
                            width: "24px",
                            height: "24px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            border: "1px solid #000000",
                            color: "#000000",
                            fontSize: "0.7em",
                            backgroundColor: "transparent",
                            cursor: "pointer"
                          }}
                          disabled={item.quantity >= (item.currentStock || item.stock?.[item.size] || 0)}
                        >
                          +
                        </button>
                        <span style={{ 
                          fontSize: "0.7em", 
                          color: "#000000",
                          marginLeft: "8px"
                        }}>
                          (Còn {item.currentStock || item.stock?.[item.size] || 0} sản phẩm)
                        </span>
                      </div>
                      <div className="flex space-x-4 mt-4 items-center">
                        <button
                          onClick={() => handleEdit(item)}
                          style={{
                            fontSize: "0.7em",
                            color: "#000000",
                            textDecoration: "underline",
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: "bold"
                          }}
                        >
                          EDIT
                        </button>
                        <span style={{ fontSize: "0.7em", color: "#000000", fontWeight: "bold" }}>|</span>
                        <button
                          onClick={() => handleDelete(item)}
                          style={{
                            fontSize: "0.7em",
                            color: "#000000",
                            textDecoration: "underline",
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: "bold"
                          }}
                          onMouseOver={(e) => e.target.style.color = "#dc2626"}
                          onMouseOut={(e) => e.target.style.color = "#000000"}
                        >
                          REMOVE
                        </button>
                        <span style={{ fontSize: "0.7em", color: "#000000", fontWeight: "bold" }}>|</span>
                        <button
                          onClick={() => handleSaveItem(item)}
                          style={{
                            fontSize: "0.7em",
                            color: "#000000",
                            textDecoration: "underline",
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            fontWeight: "bold"
                          }}
                        >
                          SAVED ITEM
                          <svg
                            className={`w-4 h-4 ml-2 ${savedItems.some(savedItem => savedItem.id === item.id) ? "fill-black" : "fill-gray-400"}`}
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                  {item !== cartItems[cartItems.length - 1] && (
                    <hr className="w-full border-black border-[0.05px] mb-8" />
                  )}
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
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
                          <span>Số lượng:</span>
                          <span>{item.quantity}</span>
                        </div>
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                          fontSize: "0.7em",
                          color: "#000000",
                        }}>
                          <span>Màu:</span>
                          <span>{item.color || "Đen"}</span>
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
                          <span>Thời gian:</span>
                          <span>{item.shippingInfo || "Dự kiến 5 ngày"}</span>
                        </div>
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                          fontSize: "0.7em",
                          color: "#000000",
                        }}>
                          <span>Giá:</span>
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
                    <span>Vận chuyển</span>
                    <span>Miễn phí (Express)</span>
                  </div>
                  {isPromoApplied && (
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                      fontSize: "0.7em",
                      color: "#000000",
                    }}>
                      <span>Giảm giá</span>
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
                    <span>Tổng cộng</span>
                    <span>{calculateTotal()}</span>
                  </div>
                </div>
                <div style={{ 
                  borderTop: "1px solid #000000", 
                  paddingTop: "10px",
                  marginTop: "20px"
                }}>
                  <div style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "15px",
                  }}>
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        // Reset message khi người dùng bắt đầu nhập lại
                        if (promoMessage) {
                          setPromoMessage("");
                        }
                      }}
                      placeholder="Enter promo code"
                      style={{
                        flex: 1,
                        padding: "8px",
                        fontSize: "0.7em",
                        border: "1px solid #000000",
                        color: "#000000",
                      }}
                    />
                    <button
                      onClick={handleApplyPromoCode}
                      style={{
                        padding: "8px 15px",
                        fontSize: "0.7em",
                        backgroundColor: "#000000",
                        color: "#ffffff",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Apply
                    </button>
                    {isPromoApplied && (
                      <button
                        onClick={handleResetPromoCode}
                        style={{
                          padding: "8px 15px",
                          fontSize: "0.7em",
                          backgroundColor: "#dc2626",
                          color: "#ffffff",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  {promoMessage && (
                    <p style={{
                      fontSize: "0.7em",
                      color: isPromoApplied ? "#059669" : "#dc2626",
                      marginBottom: "10px"
                    }}>
                      {promoMessage}
                    </p>
                  )}
                  <div style={{ 
                    borderTop: "1px solid #000000", 
                    borderBottom: "1px solid #000000", 
                    paddingTop: "10px", 
                    paddingBottom: "10px",
                    marginTop: "20px"
                  }}>
                    <p style={{ marginBottom: "10px", fontWeight: "bold", fontSize: "0.8em", color: "#000000" }}>MAY WE HELP?</p>
                    <p style={{ marginBottom: "10px", fontSize: "0.75em", color: "#000000" }}>+61 1300492212</p>
                    <p style={{ marginBottom: "10px", fontSize: "0.75em", color: "#000000" }}>clientservice.au@gucci.com</p>
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
              <p style={{ fontSize: "0.7em", color: "#000000", marginTop: "4px", fontWeight: "bold" }}>AU$ {editingItem.price?.toFixed(2) || "450.00"}</p>
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
                  <p style={{ fontSize: "0.7em", color: "#000000", marginBottom: "4px" }}>Màu: {editingItem.color || "Đen"}</p>
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
  );
}