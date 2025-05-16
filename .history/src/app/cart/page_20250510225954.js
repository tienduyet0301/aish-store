"use client";
import { motion } from "framer-motion";
import { useCart } from "../../context/CartContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const styles = {
  emptyCart: {
    textAlign: "center",
    padding: "40px",
  },
  emptyCartTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  emptyCartText: {
    color: "#666",
    marginBottom: "20px",
  },
  continueShopping: {
    display: "inline-block",
    padding: "10px 20px",
    backgroundColor: "#000",
    color: "white",
    textDecoration: "none",
    borderRadius: "4px",
  },
  cartItem: {
    display: "flex",
    alignItems: "center",
    padding: "20px",
    borderBottom: "1px solid #e0e0e0",
    gap: "20px",
  },
  productInfo: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flex: 1,
  },
  productImage: {
    objectFit: "cover",
    borderRadius: "4px",
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: "16px",
    marginBottom: "8px",
  },
  productPrice: {
    fontSize: "14px",
    color: "#666",
  },
  quantityControl: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  quantityButton: {
    width: "30px",
    height: "30px",
    border: "1px solid #e0e0e0",
    backgroundColor: "white",
    cursor: "pointer",
  },
  quantity: {
    width: "40px",
    textAlign: "center",
  },
  removeButton: {
    padding: "8px 16px",
    backgroundColor: "#ff4444",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default function Cart() {
  const {
    cartItems: cart,
    removeItem: removeFromCart,
    updateQuantity,
  } = useCart();
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

  const sizes = ["M", "L", "XL"];

  const calculateTotal = () => {
    const subtotal = cart
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
      updateQuantity(item.id, newQuantity, item.size);
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

    const currentItem = cart.find(item => item.id === editingItem.id);
    if (currentItem) {
      const sizeQuantity = currentItem.stock?.[newSize] || 0;
      setEditingQuantity(Math.min(editingQuantity, sizeQuantity));
    }
  };

  const handleSaveChanges = () => {
    if (editingItem && selectedSize) {
      const currentItem = cart.find(item => item.id === editingItem.id);
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
      removeFromCart(itemToDelete.id);
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

  const handleApplyPromoCode = async () => {
    try {
      const response = await fetch("/api/admin/notifications");
      const data = await response.json();
      
      if (data.ok) {
        const foundPromoCode = data.promoCodes.find(
          (promo) => promo.code === promoCode.trim() && promo.isActive
        );

        if (foundPromoCode) {
          setPromoAmount(foundPromoCode.amount);
          setIsPromoApplied(true);
          setPromoMessage(`Mã giảm giá ${foundPromoCode.amount.toLocaleString('vi-VN')} VND đã được áp dụng!`);
        } else {
          setPromoMessage("Mã giảm giá không hợp lệ hoặc đã hết hạn");
          setPromoAmount(0);
          setIsPromoApplied(false);
        }
      } else {
        setPromoMessage("Có lỗi xảy ra khi kiểm tra mã giảm giá");
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

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Bạn không có sản phẩm nào trong shopping bag cả.");
      return;
    }
    router.push("/checkout");
  };

  if (cart.length === 0) {
    return (
      <div style={styles.emptyCart}>
        <h1 style={styles.emptyCartTitle}>Giỏ hàng trống</h1>
        <p style={styles.emptyCartText}>
          Bạn chưa có sản phẩm nào trong giỏ hàng.
        </p>
        <Link href="/" style={styles.continueShopping}>
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

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
            {/* Hiển thị thông báo lỗi nếu có */}
            {cart.some(item => item.error) && (
              <div style={{ color: '#d32d2f', marginBottom: 24, fontSize: '1em' }}>
                {cart.filter(item => item.error).map(item => item.error).join(' ')}
              </div>
            )}
            {cart.map((item, idx) => (
              <div key={item.id} style={{ padding: '32px 0', borderBottom: idx < cart.length - 1 ? '1px solid #e0e0e0' : 'none', display: 'flex', gap: 32, alignItems: 'flex-start' }}>
                {/* Ảnh sản phẩm */}
                <div style={{ minWidth: 180, maxWidth: 220, flex: '0 0 180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={180}
                    height={180}
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                  />
                </div>
                {/* Thông tin sản phẩm */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 20, marginBottom: 8 }}>{item.name}</div>
                  <div style={{ color: '#666', fontSize: 14, marginBottom: 4 }}>Style# {item.sku || item.style || 'N/A'}</div>
                  <div style={{ color: '#666', fontSize: 14, marginBottom: 12 }}>Variation: {item.variation || item.color || 'N/A'}</div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: item.available ? '#000' : '#d32d2f', textTransform: 'uppercase' }}>
                    {item.available ? 'AVAILABLE' : 'PRE-ORDER'}
                  </div>
                  <div style={{ fontSize: 14, color: '#222', marginBottom: 16 }}>
                    {item.available
                      ? 'Enjoy complimentary express shipping and returns.\nYou will be notified when your item is shipped.'
                      : 'Estimated to ship within ten business days.'}
                  </div>
                  <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginTop: 8 }}>
                    <button
                      onClick={() => handleEdit(item)}
                      style={{ background: 'none', border: 'none', color: '#000', fontWeight: 500, textDecoration: 'underline', cursor: 'pointer', fontSize: 14 }}
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      style={{ background: 'none', border: 'none', color: '#000', fontWeight: 500, textDecoration: 'underline', cursor: 'pointer', fontSize: 14 }}
                    >
                      REMOVE
                    </button>
                    <button
                      onClick={() => handleSaveItem(item)}
                      style={{ background: 'none', border: 'none', color: '#000', fontWeight: 500, textDecoration: 'underline', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <span style={{ fontSize: 18, color: '#d32d2f' }}>&#9829;</span> SAVED ITEMS
                    </button>
                  </div>
                </div>
                {/* Giá và số lượng */}
                <div style={{ minWidth: 160, textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16 }}>
                  <div style={{ fontWeight: 500, fontSize: 20, marginBottom: 12 }}>AU$ {item.price?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  <div>
                    <label htmlFor={`qty-${item.id}`} style={{ fontSize: 13, color: '#222', marginRight: 8 }}>QTY:</label>
                    <select
                      id={`qty-${item.id}`}
                      value={item.quantity}
                      onChange={e => handleQuantityChange(item, Number(e.target.value))}
                      style={{ padding: '6px 12px', fontSize: 15, border: '1px solid #ccc', borderRadius: 4 }}
                    >
                      {[...Array(10).keys()].map(i => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
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
                {cart.map((item) => (
                  <div key={item.id} style={{
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
                  <span>Tổng phụ</span>
                  <span>{(cart.reduce((total, item) => total + item.price * item.quantity, 0)).toLocaleString('vi-VN')} VND</span>
                </div>
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
                    onChange={(e) => setPromoCode(e.target.value)}
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