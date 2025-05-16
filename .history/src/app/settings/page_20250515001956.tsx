'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChangePasswordForm from "@/components/ChangePasswordForm";

interface DeactivateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  country: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  email: string;
}

// Thêm component Modal
const DeactivateModal: React.FC<DeactivateModalProps> = ({ isOpen, onClose }) => {
  const [reason, setReason] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  // Điều chỉnh thứ tự các lý do
  const reasons = [
    { id: 'select', label: 'Select' },
    { id: 'security', label: 'Security concerns' },
    { id: 'personal', label: 'Personal reasons' },
    { id: 'service', label: 'Service issue' },
    { id: 'unsatisfied', label: 'Unsatisfied with a product' },
    { id: 'no_content', label: 'No useful contents' },
    { id: 'not_interested', label: 'Not interested in AISH anymore' },
    { id: 'billing', label: 'Billing issue' },
    { id: 'other', label: 'Other' },
  ];

  const handleDeactivate = async () => {
    if (!reason || reason === 'select') {
      toast.error('Vui lòng chọn lý do hủy tài khoản');
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch('/api/user/deactivate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error('Không thể hủy tài khoản');
      }

      toast.success('Tài khoản đã được hủy thành công');
      // Đăng xuất và chuyển về trang chủ
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      console.error('Error deactivating account:', error);
      toast.error('Có lỗi xảy ra khi hủy tài khoản');
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
        onClick={() => {
          onClose();
          setIsDropdownOpen(false);
        }}
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
            <h2 className="text-2xl font-normal text-black">DEACTIVATE ACCOUNT</h2>
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
              We're sorry that you want to deactivate your AISH account. By deactivating your AISH account, you will not be able to access your data. If you would like us to delete all of your related information please contact{' '}
              <span className="text-black">"privacy@aish.com"</span>.
            </p>

            {/* Box chứa phần chọn lý do */}
            <div className="bg-[#f5f5f5] p-8">
              <div className="space-y-4">
                <p className="text-xs text-black">
                  To help us better serve our clients, please share your reason for deactivating your account:
                </p>
                {/* Select dropdown */}
                <div className="relative">
                  <button
                    className="w-full p-3 text-left text-xs text-black bg-white border border-gray-200 flex justify-between items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDropdownOpen(!isDropdownOpen);
                    }}
                  >
                    <span>{reason && reason !== 'select' ? reasons.find(r => r.id === reason)?.label : 'Select'}</span>
                    <svg 
                      className="w-3 h-3"
                      viewBox="0 0 24 24"
                    >
                      <path d="M7 10l5 5 5-5z" fill="currentColor"/>
                    </svg>
                  </button>

                  {/* Dropdown menu - bỏ hết animation */}
                  {isDropdownOpen && (
                    <div 
                      className="absolute top-full left-0 right-0 bg-white border border-gray-200"
                      style={{
                        maxHeight: '144px',
                        overflowY: 'auto',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                      }}
                    >
                      <style jsx>{`
                        div::-webkit-scrollbar {
                          display: none;
                        }
                      `}</style>
                      {reasons.map((item) => (
                        <button
                          key={item.id}
                          className={`
                            w-full text-left p-3 text-xs text-black 
                            ${item.id === 'select' ? 'text-gray-400' : ''}
                            h-9 hover:bg-[#f5f5f5]
                            transition-none
                          `}
                          style={{ transform: 'none' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.id !== 'select') {
                              setReason(item.id);
                              setIsDropdownOpen(false);
                            }
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center">
              <button 
                className={`bg-black text-white text-xs uppercase px-8 py-3 ${(!reason || reason === 'select' || isDeleting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleDeactivate}
                disabled={!reason || reason === 'select' || isDeleting}
              >
                {isDeleting ? 'DEACTIVATING...' : 'DEACTIVATE MY ACCOUNT'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="space-y-10 divide-y divide-gray-900/10">
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div className="px-4 sm:px-0">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Cài đặt</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Quản lý thông tin tài khoản và bảo mật
            </p>
          </div>

          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <div className="px-4 py-6 sm:p-8">
              <div className="max-w-2xl space-y-10">
                <div>
                  <h3 className="text-base font-semibold leading-7 text-gray-900">
                    Đổi mật khẩu
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Cập nhật mật khẩu của bạn để bảo vệ tài khoản
                  </p>
                </div>

                <ChangePasswordForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 