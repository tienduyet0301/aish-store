'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface DeactivateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: string;
}

interface InfoErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: string;
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

// Thêm component Modal thông báo lỗi thông tin
const InfoErrorModal: React.FC<InfoErrorModalProps> = ({ isOpen, onClose, error }) => {
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
  const [initialData, setInitialData] = useState<FormData>({
    firstName: '',
    lastName: '',
    country: 'Việt Nam',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    email: '',
  });
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    country: 'Việt Nam',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isPasswordErrorModalOpen, setIsPasswordErrorModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isInfoErrorModalOpen, setIsInfoErrorModalOpen] = useState(false);
  const [infoError, setInfoError] = useState('');

  // Load user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to fetch user data');
        }
        const data = await response.json();
        
        // Format the data to match our form structure
        const formattedData = {
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          country: 'Việt Nam',
          birthDay: data.birthDay || '',
          birthMonth: data.birthMonth || '',
          birthYear: data.birthYear || '',
          email: data.email || '',
        };
        
        // Set both initial and form data
        setInitialData(formattedData);
        setFormData(formattedData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setInfoError('Không thể tải dữ liệu người dùng. Vui lòng thử lại sau.');
        setIsInfoErrorModalOpen(true);
      }
    };

    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value || '' // Đảm bảo giá trị không bao giờ là undefined
    }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  }, []);

  const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!isChecked) {
      setInfoError('Vui lòng chấp nhận cài đặt bảo mật trước khi lưu thay đổi.');
      setIsInfoErrorModalOpen(true);
      return;
    }

    // Kiểm tra email hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setInfoError('Email không hợp lệ');
      setIsInfoErrorModalOpen(true);
      return;
    }

    // Kiểm tra xem có thay đổi gì không
    const hasChanges = 
      formData.firstName !== initialData.firstName ||
      formData.lastName !== initialData.lastName ||
      formData.birthDay !== initialData.birthDay ||
      formData.birthMonth !== initialData.birthMonth ||
      formData.birthYear !== initialData.birthYear ||
      formData.email !== initialData.email;

    if (!hasChanges) {
      setInfoError('Không có thay đổi nào để lưu');
      setIsInfoErrorModalOpen(true);
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          birthDay: formData.birthDay,
          birthMonth: formData.birthMonth,
          birthYear: formData.birthYear,
          email: formData.email,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Không thể cập nhật thông tin người dùng');
      }

      // Sau khi lưu thành công, gọi lại API để lấy dữ liệu mới nhất
      const fetchUserData = async () => {
        try {
          const response = await fetch('/api/user/profile');
          if (!response.ok) throw new Error('Không thể tải lại dữ liệu');
          const data = await response.json();
          setInitialData(data);
          setFormData(data);
        } catch (err) {
          setInfoError('Không thể tải lại dữ liệu mới');
          setIsInfoErrorModalOpen(true);
        }
      };
      await fetchUserData();
      toast.success('Lưu thay đổi thành công!');
    } catch (error) {
      console.error('Error saving changes:', error);
      setInfoError(error instanceof Error ? error.message : 'Không thể lưu thay đổi. Vui lòng thử lại.');
      setIsInfoErrorModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const validateDay = (value: string) => {
    const day = parseInt(value);
    if (isNaN(day) || day < 1 || day > 31) return formData.birthDay;
    return value;
  };

  const validateMonth = (value: string) => {
    const month = parseInt(value);
    if (isNaN(month) || month < 1 || month > 12) return formData.birthMonth;
    return value;
  };

  const validateYear = (value: string) => {
    const year = parseInt(value);
    if (isNaN(year) || year < 0 || year > 9999) return formData.birthYear;
    return value;
  };

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

        <form onSubmit={handleSubmit} className="space-y-24" onClick={(e) => e.stopPropagation()}>
          {/* Your Information Section */}
          <div className="flex">
            <h2 className="text-sm font-bold text-black w-[200px]">YOUR INFORMATION</h2>
            <div className="flex-1 space-y-12">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-black mb-2">First Name</label>
                  <input 
                    type="text"
                    className="w-full p-2 bg-gray-100 border border-gray-200 text-xs text-black"
                    value={formData.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    onBlur={(e) => e.stopPropagation()}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-black mb-2">Last Name</label>
                  <input 
                    type="text"
                    className="w-full p-2 bg-gray-100 border border-gray-200 text-xs text-black"
                    value={formData.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    onBlur={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-black mb-2">Country/Region</label>
                <input 
                  type="text"
                  className="w-full p-2 bg-gray-100 border border-gray-200 text-xs text-black"
                  value={formData.country || ''}
                  disabled
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-black mb-2">Birthdate</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <input 
                      type="number"
                      placeholder="DD"
                      min="1"
                      max="31"
                      className="w-full p-2 bg-gray-100 border border-gray-200 text-xs text-black"
                      value={formData.birthDay || ''}
                      onChange={(e) => handleInputChange('birthDay', validateDay(e.target.value))}
                      onBlur={(e) => e.stopPropagation()}
                    />
                    <div className="text-[10px] text-gray-500 mt-1">Day (1-31)</div>
                  </div>
                  <div>
                    <input 
                      type="number"
                      placeholder="MM"
                      min="1"
                      max="12"
                      className="w-full p-2 bg-gray-100 border border-gray-200 text-xs text-black"
                      value={formData.birthMonth || ''}
                      onChange={(e) => handleInputChange('birthMonth', validateMonth(e.target.value))}
                      onBlur={(e) => e.stopPropagation()}
                    />
                    <div className="text-[10px] text-gray-500 mt-1">Month (1-12)</div>
                  </div>
                  <div>
                    <input 
                      type="number"
                      placeholder="YYYY"
                      min="0"
                      max="9999"
                      className="w-full p-2 bg-gray-100 border border-gray-200 text-xs text-black"
                      value={formData.birthYear || ''}
                      onChange={(e) => handleInputChange('birthYear', validateYear(e.target.value))}
                      onBlur={(e) => e.stopPropagation()}
                    />
                    <div className="text-[10px] text-gray-500 mt-1">Year (0-9999)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details Section */}
          <div className="flex">
            <h2 className="text-sm font-bold text-black w-[200px]">ACCOUNT DETAILS</h2>
            <div className="flex-1 space-y-12">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-black mb-2">Email</label>
                <input 
                  type="email"
                  className="w-full p-2 bg-gray-100 border border-gray-200 text-xs text-black"
                  value={formData.email}
                  disabled
                />
              </div>

              {/* Password Change Section */}
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

          {/* Privacy Settings Section */}
          <div className="flex">
            <h2 className="text-sm font-bold text-black w-[200px]">PRIVACY SETTINGS</h2>
            <div className="flex-1 space-y-6">
              <div className="flex items-start gap-4">
                <input 
                  type="checkbox"
                  className="mt-1"
                  checked={isChecked}
                  onChange={(e) => {
                    e.stopPropagation();
                    setIsChecked(e.target.checked);
                  }}
                />
                <p className="text-xs text-black">
                  I would like to receive updates (including by email, SMS, MMS, social media, phone, physical letter) about AISH new activities, exclusive products, tailored services and to have a personalised client experience based on my interests.
                </p>
              </div>
              <p className="text-xs text-black">
                Privacy laws may grant you certain rights such as the right to access, delete, modify and rectify your data, or to restrict or object to processing, as well as the right to data portability. You can also lodge a complaint with your competent regulator. You can withdraw your consent or delete your profile at any time. For further information regarding our privacy practices and your rights, please contact us at{' '}
                <a href="mailto:privacy@aish.com" className="underline">privacy@aish.com</a>.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between">
            <button 
              type="button"
              className={`px-8 py-3 bg-black text-white text-xs uppercase ${(!isChecked || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleSave}
              disabled={!isChecked || isLoading}
            >
              {isLoading ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
            <button 
              type="button"
              className="text-xs text-black uppercase font-semibold underline underline-offset-4"
              onClick={() => setIsDeactivateModalOpen(true)}
            >
              DEACTIVATE ACCOUNT
            </button>
          </div>
        </form>
      </div>

      {/* Thêm Modal */}
      <DeactivateModal 
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
      />

      {/* Thêm Modal thông báo lỗi mật khẩu */}
      <PasswordErrorModal 
        isOpen={isPasswordErrorModalOpen}
        onClose={() => setIsPasswordErrorModalOpen(false)}
        error={passwordError}
      />

      {/* Thêm Modal thông báo lỗi thông tin */}
      <InfoErrorModal 
        isOpen={isInfoErrorModalOpen}
        onClose={() => setIsInfoErrorModalOpen(false)}
        error={infoError}
      />
    </div>
  );
}

export const metadata = {
  title: 'Account Setting | AISH',
  description: 'Quản lý tài khoản AISH của bạn. Cập nhật thông tin cá nhân, đổi mật khẩu và tùy chỉnh cài đặt bảo mật.',
};   