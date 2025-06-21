import { createContext, useContext, useState, ReactNode } from 'react';
import { calculateShippingFee, formatShippingFee } from '@/lib/utils';

interface ShippingInfo {
  email: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
}

interface CheckoutContextType {
  shippingInfo: ShippingInfo | null;
  setShippingInfo: (info: ShippingInfo | null) => void;
  shippingFee: number;
  setShippingFee: (fee: number) => void;
  provinceName: string;
  setProvinceName: (name: string) => void;
  calculateShippingFee: (provinceName: string) => number;
  formatShippingFee: (fee: number) => string;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [provinceName, setProvinceName] = useState<string>("");

  const calculateShipping = (provinceName: string): number => {
    return calculateShippingFee(provinceName);
  };

  const formatShipping = (fee: number): string => {
    return formatShippingFee(fee);
  };

  return (
    <CheckoutContext.Provider
      value={{
        shippingInfo,
        setShippingInfo,
        shippingFee,
        setShippingFee,
        provinceName,
        setProvinceName,
        calculateShippingFee: calculateShipping,
        formatShippingFee: formatShipping,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
} 