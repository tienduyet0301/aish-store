"use client";
import { motion } from "framer-motion";
import { useRef, useEffect } from "react";
import { useWishlist } from '../context/WishlistContext';
import { signOut } from "next-auth/react";

export default function UserDropdown({ isUserOpen, setIsUserOpen, isLoggedIn, navigateWithLoader }) {
  const userRef = useRef(null);
  const { wishlist } = useWishlist();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userRef.current && !userRef.current.contains(event.target)) {
        setIsUserOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsUserOpen]);

  const menuItems = isLoggedIn
    ? [
        {
          label: 'Đơn hàng của tôi',
          path: '/my-orders',
        },
        {
          label: `Sản phẩm đã lưu (${wishlist.length})`,
          path: '/saved-items',
        },
        { 
          label: "Account Settings",
          path: "/settings" 
        },
        { 
          label: "Đăng xuất", 
          path: "/logout",
          isLogout: true
        },
      ]
    : [
        { 
          label: "Đăng nhập", 
          path: "/login" 
        },
        { 
          label: "Đơn hàng của tôi", 
          path: "/my-orders" 
        },
        { 
          label: "Sản phẩm đã lưu", 
          path: "/saved-items" 
        },
        { 
          label: "Tài khoản", 
          path: "/settings" 
        },
      ];

  return (
    <motion.div
      ref={userRef}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="absolute top-[55px] right-4 sm:right-10 w-fit bg-white shadow-md flex flex-col z-50" // Giảm padding ở mobile
    >
      <div className="px-3 sm:px-4 py-2 sm:py-3"> {/* Giảm padding */}
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="py-2 sm:py-3 text-sm sm:text-base font-bold text-gray-800 hover:text-black cursor-pointer" // Chữ nhỏ hơn ở mobile
            onClick={async () => {
              if (item.isLogout) {
                await signOut({ callbackUrl: '/' });
              } else {
                navigateWithLoader(item.path);
              }
              setIsUserOpen(false);
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </motion.div>
  );
}