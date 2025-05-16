"use client";

import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Trang quản trị</h1>
      <div className="grid gap-4">
        <Link
          href="/admin/products"
          className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold">Quản lý sản phẩm</h2>
          <p className="text-gray-600">Xem và quản lý danh sách sản phẩm</p>
        </Link>
      </div>
    </div>
  );
} 