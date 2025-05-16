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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      fetchUsers();
    }
  }, [session, status]);

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
      const response = await fetch("/api/admin/users/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setMessage("Tài khoản đã được xóa thành công");
        setDeletingUser(null);
        fetchUsers(); // Refresh danh sách
      } else {
        setMessage("Có lỗi xảy ra khi xóa tài khoản");
      }
    } catch (error) {
      setMessage("Có lỗi xảy ra khi xóa tài khoản");
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
              <th className="px-6 py-3 border-b text-left text-black">STT</th>
              <th className="px-6 py-3 border-b text-left text-black">Tên</th>
              <th className="px-6 py-3 border-b text-left text-black">Email</th>
              <th className="px-6 py-3 border-b text-left text-black">Ngày sinh</th>
              <th className="px-6 py-3 border-b text-left text-black">Phương thức đăng nhập</th>
              <th className="px-6 py-3 border-b text-left text-black">Ngày tạo</th>
              <th className="px-6 py-3 border-b text-left text-black">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => {
              const displayName = user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.name || '';
              const displayBirth = user.birthDay && user.birthMonth && user.birthYear ? `${user.birthDay}/${user.birthMonth}/${user.birthYear}` : '';
              return (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border-b text-black">{index + 1}</td>
                  <td className="px-6 py-4 border-b text-black">{displayName}</td>
                  <td className="px-6 py-4 border-b text-black">{user.email}</td>
                  <td className="px-6 py-4 border-b text-black">{displayBirth}</td>
                  <td className="px-6 py-4 border-b text-black">{user.provider}</td>
                  <td className="px-6 py-4 border-b text-black">
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 border-b text-black">
                    <div className="flex items-center gap-2">
                      {editingUser === user._id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Nhập mật khẩu mới"
                            className="p-2 border rounded"
                          />
                          <button
                            onClick={() => handleChangePassword(user._id)}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                          >
                            Lưu
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(null);
                              setNewPassword("");
                            }}
                            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingUser(user._id)}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          >
                            Đổi mật khẩu
                          </button>
                          {deletingUser === user._id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-red-500">Xác nhận xóa?</span>
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                              >
                                Xóa
                              </button>
                              <button
                                onClick={() => setDeletingUser(null)}
                                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingUser(user._id)}
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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
  );
} 