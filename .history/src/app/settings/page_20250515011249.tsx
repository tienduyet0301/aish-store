'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

interface PasswordErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: string;
}

// Thêm component Modal thông báo lỗi mật khẩu
const PasswordErrorModal: React.FC<PasswordErrorModalProps> = ({ isOpen, onClose, error }) => {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-white p-12 max-w-2xl w-full mx-4 relative pointer-events-auto">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 text-[#0066CC]"
          >
            <svg className="w-4 h-4" viewBox="0 0 14 14">
              <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="currentColor"/>
            </svg>
          </button>

          {/* Modal Content */}
          <div className="text-center mb-12">
            <h2 className="text-2xl font-normal text-black">THÔNG BÁO</h2>
            <div className="flex items-center justify-center my-6">
              <div className="h-[1px] w-full bg-gray-200"></div>
              <div className="mx-4">
                <svg className="w-2 h-2 text-gray-300" viewBox="0 0 8 8">
                  <rect width="8" height="8" transform="rotate(45 4 4)" fill="currentColor"/>
                </svg>
              </div>
              <div className="h-[1px] w-full bg-gray-200"></div>
            </div>
          </div>

          <div className="space-y-8">
            <p className="text-xs text-black text-center leading-relaxed">
              {error}
            </p>

            <div className="text-center">
              <button 
                className="bg-black text-white text-xs uppercase px-8 py-3"
                onClick={onClose}
              >
                ĐÓNG
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isPasswordErrorModalOpen, setIsPasswordErrorModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordChange = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Vui lòng nhập đầy đủ thông tin đổi mật khẩu');
      setIsPasswordErrorModalOpen(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu mới không khớp');
      setIsPasswordErrorModalOpen(true);
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Mật khẩu mới phải có ít nhất 8 ký tự');
      setIsPasswordErrorModalOpen(true);
      return;
    }

    try {
      setIsChangingPassword(true);
      
      const response = await fetch('/api/user/updatePassword', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "Current password is incorrect") {
          setPasswordError('Mật khẩu hiện tại không đúng');
          setIsPasswordErrorModalOpen(true);
        } else {
          throw new Error(data.error || 'Không thể đổi mật khẩu');
        }
        return;
      }

      toast.success('Đổi mật khẩu thành công!');
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError(error instanceof Error ? error.message : 'Không thể đổi mật khẩu. Vui lòng thử lại.');
      setIsPasswordErrorModalOpen(true);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center py-16">
          <div className="inline-block">
            <h1 className="text-2xl font-bold text-black">ACCOUNT SETTINGS</h1>
            <div className="h-[1px] bg-black mt-2"></div>
          </div>
        </div>

        <form className="space-y-24" onClick={(e) => e.stopPropagation()}>
          {/* Password Change Section */}
          <div className="flex">
            <h2 className="text-sm font-bold text-black w-[200px]">ACCOUNT DETAILS</h2>
            <div className="flex-1 space-y-12">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-black mb-2">Password</label>
                <div className="space-y-4">
                  <div className="relative">
                    <input 
                      type={currentPassword ? "password" : "text"}
                      placeholder="Mật khẩu hiện tại"
                      className="w-full p-2 bg-gray-100 border border-gray-200 text-xs text-black"
                      value={currentPassword || ''}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      onBlur={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="relative">
                    <input 
                      type={newPassword ? "password" : "text"}
                      placeholder="Mật khẩu mới"
                      className="w-full p-2 bg-gray-100 border border-gray-200 text-xs text-black"
                      value={newPassword || ''}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onBlur={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="relative">
                    <input 
                      type={confirmPassword ? "password" : "text"}
                      placeholder="Nhập mật khẩu mới"
                      className="w-full p-2 bg-gray-100 border border-gray-200 text-xs text-black"
                      value={confirmPassword || ''}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={(e) => e.stopPropagation()}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword}
                    className={`w-full px-8 py-2 bg-black text-white text-xs uppercase ${isChangingPassword ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isChangingPassword ? 'CHANGING...' : 'CHANGE PASSWORD'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Thêm Modal thông báo lỗi mật khẩu */}
      <PasswordErrorModal 
        isOpen={isPasswordErrorModalOpen}
        onClose={() => setIsPasswordErrorModalOpen(false)}
        error={passwordError}
      />
    </div>
  );
}   