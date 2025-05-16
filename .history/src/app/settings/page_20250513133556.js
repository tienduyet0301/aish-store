'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

// Thêm component Modal
const DeactivateModal = ({ isOpen, onClose }) => {
  const [reason, setReason] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  return (
    <>
      {/* Lớp overlay - không cần background đậm vì nền đã tối */}
      <div 
        className="fixed inset-0 z-40 bg-gray-900 bg-opacity-40"
        onClick={() => {
          onClose();
          setIsDropdownOpen(false);
        }}
      />

      {/* Modal Container */}
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
                className="bg-black text-white text-xs uppercase px-8 py-3"
                onClick={() => {
                  if (!reason || reason === 'select') {
                    alert('Please select a reason before deactivating your account.');
                    return;
                  }
                  console.log('Deactivating account with reason:', reason);
                  onClose();
                  setIsDropdownOpen(false);
                }}
              >
                DEACTIVATE MY ACCOUNT
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
  const [initialData, setInitialData] = useState({
    firstName: '',
    lastName: '',
    country: 'Việt Nam',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    email: '',
  });
  const [formData, setFormData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  // Load user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const data = await response.json();
            const userData = {
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              country: data.country || 'Việt Nam',
              birthDay: data.birthDay || '',
              birthMonth: data.birthMonth || '',
              birthYear: data.birthYear || '',
              email: data.email || '',
            };
            setInitialData(userData);
            setFormData(userData);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          toast.error('Failed to load user data');
        }
      }
    };

    loadUserData();
  }, [session]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setInitialData(formData);
        toast.success('Profile updated successfully');
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isChecked) {
      alert('Please accept the privacy settings before saving changes.');
      return;
    }

    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Kiểm tra trước khi sử dụng localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('userSettings', JSON.stringify(formData));
      }
      
      setInitialData(formData);
      alert('Changes saved successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation(); // Thêm stopPropagation
    setFormData(initialData);
  }, [initialData]);

  const validateDay = (value) => {
    const day = parseInt(value);
    if (isNaN(day) || day < 1 || day > 31) return formData.birthDay;
    return value;
  };

  const validateMonth = (value) => {
    const month = parseInt(value);
    if (isNaN(month) || month < 1 || month > 12) return formData.birthMonth;
    return value;
  };

  const validateYear = (value) => {
    const year = parseInt(value);
    if (isNaN(year) || year < 0 || year > 9999) return formData.birthYear;
    return value;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 pt-32">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">SETTINGS</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Personal Information</h2>
              
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              {/* Birth Date Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <div className="grid grid-cols-3 gap-4 mt-1">
                  <input
                    type="text"
                    placeholder="Day"
                    value={formData.birthDay}
                    onChange={(e) => handleInputChange('birthDay', e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                  <input
                    type="text"
                    placeholder="Month"
                    value={formData.birthMonth}
                    onChange={(e) => handleInputChange('birthMonth', e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                  <input
                    type="text"
                    placeholder="Year"
                    value={formData.birthYear}
                    onChange={(e) => handleInputChange('birthYear', e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-black text-white px-8 py-3 text-sm uppercase hover:bg-gray-800 transition-colors"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          {/* Deactivate Account Button */}
          <div className="mt-12 text-center">
            <button
              onClick={() => setIsDeactivateModalOpen(true)}
              className="text-red-600 text-sm hover:underline"
            >
              Deactivate Account
            </button>
          </div>
        </div>
      </div>

      {/* Deactivate Modal */}
      <DeactivateModal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
      />
    </div>
  );
} 