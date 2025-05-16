"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { FaUser, FaShoppingBag, FaHeart, FaSignOutAlt } from "react-icons/fa";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const menuItems = [
    {
      label: "My Profile",
      icon: <FaUser className="w-4 h-4" />,
      onClick: () => router.push("/profile"),
    },
    {
      label: "My Orders",
      icon: <FaShoppingBag className="w-4 h-4" />,
      onClick: () => router.push("/orders"),
    },
    {
      label: "Wishlist",
      icon: <FaHeart className="w-4 h-4" />,
      onClick: () => router.push("/wishlist"),
    },
    {
      label: "Sign Out",
      icon: <FaSignOutAlt className="w-4 h-4" />,
      onClick: handleSignOut,
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-black hover:text-gray-600 transition-colors"
      >
        <span className="text-sm font-medium">
          {session?.user?.name || session?.user?.email || "Account"}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}