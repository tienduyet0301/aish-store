"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  name: string;
  email: string;
  provider: string;
  createdAt: string;
}

export default function CustomersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Tự động refresh mỗi 30 giây
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-20 p-6">
      <h1 className="text-2xl font-bold mb-6 text-black">Danh sách khách hàng</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 border-b text-left text-black">Tên</th>
              <th className="px-6 py-3 border-b text-left text-black">Email</th>
              <th className="px-6 py-3 border-b text-left text-black">Phương thức đăng nhập</th>
              <th className="px-6 py-3 border-b text-left text-black">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-b text-black">{user.name}</td>
                <td className="px-6 py-4 border-b text-black">{user.email}</td>
                <td className="px-6 py-4 border-b text-black">{user.provider}</td>
                <td className="px-6 py-4 border-b text-black">
                  {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 