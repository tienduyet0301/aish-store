import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '')
    .replace(/(\s+)/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateOrderCode() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `AISH${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Calculate shipping fee based on province
export const calculateShippingFee = (provinceName: string): number => {
  if (!provinceName) return 0;
  
  // Thành phố Hồ Chí Minh
  const hcmProvinces = [
    'Thành phố Hồ Chí Minh',
    'TP. Hồ Chí Minh',
    'TP Hồ Chí Minh',
    'Hồ Chí Minh'
  ];
  
  const isHCM = hcmProvinces.some(name => 
    provinceName.toLowerCase().includes(name.toLowerCase())
  );
  
  return isHCM ? 22000 : 35000;
};

// Format shipping fee for display
export const formatShippingFee = (fee: number): string => {
  if (fee === 0) return 'Free (Express)';
  return `${fee.toLocaleString('vi-VN')} VND`;
}; 