import React from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full h-16 bg-white shadow z-50 flex items-center px-6">
        <span className="font-bold text-lg tracking-wider">ADMIN PANEL</span>
      </nav>

      {/* Wrapper for sidebar and main content */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside className="w-56 bg-gray-100 min-h-[calc(100vh-64px)] p-6 border-r border-gray-200">
          <ul className="space-y-4">
            <li>
              <Link href="/admin/products" className="text-black font-medium hover:text-blue-600 transition">Quản lý sản phẩm</Link>
            </li>
            <li>
              <Link href="/admin/orders" className="text-black font-medium hover:text-blue-600 transition">Quản lý đơn hàng</Link>
            </li>
            <li>
              <Link href="/admin/users" className="text-black font-medium hover:text-blue-600 transition">Quản lý người dùng</Link>
            </li>
            {/* Thêm các mục khác nếu cần */}
          </ul>
        </aside>
        {/* Main content */}
        <main className="flex-1 p-8 bg-white min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full h-16 bg-gray-200 flex items-center justify-center text-gray-600 text-sm mt-auto">
        © {new Date().getFullYear()} Admin Panel. All rights reserved.
      </footer>
    </div>
  );
} 