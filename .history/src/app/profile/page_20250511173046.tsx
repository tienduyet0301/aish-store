"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.email) {
      // Lấy thông tin profile từ database
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setProfile({
              name: data.name || "",
              email: data.email || "",
              phone: data.phone || "",
              address: data.address || "",
            });
          }
        })
        .catch((error) => console.error("Error fetching profile:", error));
    }
  }, [session, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        setMessage("Thông tin đã được cập nhật thành công");
      } else {
        setMessage("Có lỗi xảy ra khi cập nhật thông tin");
      }
    } catch (error) {
      setMessage("Có lỗi xảy ra khi cập nhật thông tin");
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-20 p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-black">Thông tin tài khoản</h1>
      {message && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Họ tên</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
          <textarea
            value={profile.address}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Cập nhật thông tin
        </button>
      </form>
    </div>
  );
} 