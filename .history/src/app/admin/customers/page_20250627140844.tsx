"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface User {
  _id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  birthDay?: string;
  birthMonth?: string;
  birthYear?: string;
  email: string;
  provider: string;
  createdAt: string;
}

export default function CustomersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/customers", { cache: "no-store" });
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
    const checkAccess = async () => {
      if (status === "unauthenticated") {
        router.push("/admin/login");
        return;
      }

      if (status === "authenticated") {
        fetchUsers();
      }
    };

    checkAccess();
  }, [session, status]);

  const handleChangePassword = async (userId: string) => {
    if (!newPassword) return;

    try {
      const response = await fetch("/api/admin/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          newPassword,
        }),
      });

      if (response.ok) {
        setMessage("Mật khẩu đã được cập nhật thành công");
        setEditingUser(null);
        setNewPassword("");
      } else {
        setMessage("Có lỗi xảy ra khi cập nhật mật khẩu");
      }
    } catch (error) {
      setMessage("Có lỗi xảy ra khi cập nhật mật khẩu");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/customers/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (response.ok) {
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        setMessage("Tài khoản đã được xóa thành công");
        setDeletingUser(null);
      } else {
        const data = await response.json();
        setMessage(data.message || "Có lỗi xảy ra khi xóa tài khoản");
      }
    } catch (error) {
      setMessage("Có lỗi xảy ra khi xóa tài khoản");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-black">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-16">
          <div className="inline-block">
            <h1 className="text-2xl font-bold text-black">CUSTOMERS</h1>
            <div className="h-[1px] bg-black mt-2"></div>
          </div>
        </div>

        {message && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày sinh</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phương thức đăng nhập</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user, index) => {
                  const displayName = user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.name || '';
                  const displayBirth = user.birthDay && user.birthMonth && user.birthYear ? `${user.birthDay}/${user.birthMonth}/${user.birthYear}` : '';
                  return (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{displayName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{displayBirth}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.provider}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          {editingUser === user._id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Nhập mật khẩu mới"
                                className="p-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-black"
                              />
                              <button
                                onClick={() => handleChangePassword(user._id)}
                                className="px-3 py-1 bg-black text-white text-xs uppercase hover:bg-gray-800 transition-colors"
                              >
                                Lưu
                              </button>
                              <button
                                onClick={() => {
                                  setEditingUser(null);
                                  setNewPassword("");
                                }}
                                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs uppercase hover:bg-gray-200 transition-colors"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingUser(user._id)}
                                className="px-3 py-1 bg-black text-white text-xs uppercase hover:bg-gray-800 transition-colors"
                              >
                                Đổi mật khẩu
                              </button>
                              {deletingUser === user._id ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-red-500 text-xs">Xác nhận xóa?</span>
                                  <button
                                    onClick={() => handleDeleteUser(user._id)}
                                    className="px-3 py-1 bg-red-500 text-white text-xs uppercase hover:bg-red-600 transition-colors"
                                  >
                                    Xóa
                                  </button>
                                  <button
                                    onClick={() => setDeletingUser(null)}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs uppercase hover:bg-gray-200 transition-colors"
                                  >
                                    Hủy
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeletingUser(user._id)}
                                  className="px-3 py-1 bg-red-500 text-white text-xs uppercase hover:bg-red-600 transition-colors"
                                >
                                  Xóa
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 