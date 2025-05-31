import { createContext, useContext, useState, ReactNode } from 'react';

interface Address {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
}

interface AddressContextType {
  address: Address;
  setAddress: (address: Address) => void;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export function AddressProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<Address>({
    fullName: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    detail: '',
  });

  return (
    <AddressContext.Provider value={{ address, setAddress }}>
      {children}
    </AddressContext.Provider>
  );
}

export function useAddress() {
  const context = useContext(AddressContext);
  if (context === undefined) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
} 