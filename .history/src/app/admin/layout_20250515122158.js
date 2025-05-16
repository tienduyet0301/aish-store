"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiShoppingBag,
  FiImage,
  FiShoppingCart,
  FiUsers,
  FiBell,
} from "react-icons/fi";

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  const menuItems = [
    { name: "QUẢN LÝ SẢN PHẨM", path: "/admin/products", icon: FiShoppingBag },
    { name: "BANNERS", path: "/admin/banners", icon: FiImage },
    { name: "ĐƠN HÀNG", path: "/admin/orders", icon: FiShoppingCart },
    { name: "KHÁCH HÀNG", path: "/admin/customers", icon: FiUsers },
    { name: "THÔNG BÁO & GIẢM GIÁ", path: "/admin/notifications", icon: FiBell },
  ];

  if (pathname === "/admin/login") {
    return children;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-screen flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800 text-center mt-16">ADMIN AISH</h1>
          </div>
          <nav className="flex-1 px-4 py-6">
            <div className="space-y-2 mt-16">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center px-6 py-3 text-gray-700 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? "bg-gray-100 text-gray-900 font-semibold"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? "text-gray-900" : "text-gray-500"
                      }`}
                    />
                    <span className="ml-4 text-sm font-semibold">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
      {/* Footer */}
      <footer className="w-full h-16 bg-white border-t border-gray-200 flex items-center justify-center text-gray-600 text-sm">
        © {new Date().getFullYear()} AISH Admin Panel. All rights reserved.
      </footer>
    </div>
  );
} 