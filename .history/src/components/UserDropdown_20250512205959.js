"use client";
import { motion } from "framer-motion";
import { useRef, useEffect } from "react";
import { useWishlist } from '../context/WishlistContext';
import { signOut, useSession } from "next-auth/react";

export default function UserDropdown({ isUserOpen, setIsUserOpen, isLoggedIn, navigateWithLoader }) {
  const userRef = useRef(null);
  const { wishlist } = useWishlist();
  const { data: session } = useSession();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userRef.current && !userRef.current.contains(event.target)) {
        setIsUserOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsUserOpen]);

  const handleNavigation = (path) => {
    // Các route yêu cầu đăng nhập
    const protectedRoutes = ['/my-orders', '/settings'];
    
    if (protectedRoutes.includes(path) && !session) {
      // Nếu chưa đăng nhập và cố truy cập route được bảo vệ
      navigateWithLoader('/login');
    } else {
      // Nếu đã đăng nhập hoặc route không yêu cầu đăng nhập
      navigateWithLoader(path);
    }
    setIsUserOpen(false);
  };

  const menuItems = [
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
      label: session ? "Đăng xuất" : "Đăng nhập",
      path: session ? "/logout" : "/login",
      isLogout: session ? true : false
    },
  ];

  return (
    <motion.div
      ref={userRef}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="absolute top-[55px] right-4 sm:right-10 w-fit bg-white shadow-md flex flex-col z-50"
    >
      <div className="px-3 sm:px-4 py-2 sm:py-3">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="py-2 sm:py-3 text-sm sm:text-base font-bold text-gray-800 hover:text-black cursor-pointer"
            onClick={async () => {
              if (item.isLogout) {
                await signOut({ redirect: false });
                navigateWithLoader('/');
              } else {
                handleNavigation(item.path);
              }
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </motion.div>
  );
}