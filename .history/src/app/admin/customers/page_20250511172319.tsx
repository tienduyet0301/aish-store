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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [message, setMessage] = useState("");

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

  const handleChangePassword = async () => {
    if (!selectedUser || !newPassword) return;

    try {
      const response = await fetch("/api/admin/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser._id,
          newPassword,
        }),
      });

      if (response.ok) {
        setMessage("Mật khẩu đã được cập nhật thành công");
        setShowPasswordModal(false);
        setNewPassword("");
      } else {
        setMessage("Có lỗi xảy ra khi cập nhật mật khẩu");
      }
    } catch (error) {
      setMessage("Có lỗi xảy ra khi cập nhật mật khẩu");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-20 p-6">
      <h1 className="text-2xl font-bold mb-6 text-black">Danh sách khách hàng</h1>
      {message && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 border-b text-left text-black">Tên</th>
              <th className="px-6 py-3 border-b text-left text-black">Email</th>
              <th className="px-6 py-3 border-b text-left text-black">Phương thức đăng nhập</th>
              <th className="px-6 py-3 border-b text-left text-black">Ngày tạo</th>
              <th className="px-6 py-3 border-b text-left text-black">Thao tác</th>
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
                <td className="px-6 py-4 border-b text-black">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowPasswordModal(true);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Đổi mật khẩu
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal thay đổi mật khẩu */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Đổi mật khẩu cho {selectedUser.name}</h2>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword("");
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Hủy
              </button>
              <button
                onClick={handleChangePassword}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 