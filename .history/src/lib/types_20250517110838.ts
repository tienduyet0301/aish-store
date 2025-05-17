import { ReactNode } from 'react';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: {
    url: string;
    alt: string;
  }[];
  category: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface LayoutProps {
  children: ReactNode;
  params: {
    slug: string;
  };
} 