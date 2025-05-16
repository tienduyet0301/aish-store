import dynamic from 'next/dynamic';

// HelpPanel
export const LazyHelpPanel = dynamic(() => import('./HelpPanel'), {
  loading: () => <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" />,
  ssr: false
});

// CartDropdown
export const LazyCartDropdown = dynamic(() => import('./CartDropdown'), {
  loading: () => <div className="absolute top-[55px] right-4 sm:right-10 w-72 sm:w-120 h-80 sm:h-100 bg-white shadow-md animate-pulse" />,
  ssr: false
});

// UserDropdown
export const LazyUserDropdown = dynamic(() => import('./UserDropdown'), {
  loading: () => <div className="absolute top-[55px] right-4 sm:right-10 w-48 bg-white shadow-md animate-pulse" />,
  ssr: false
});

// OrderConfirmationModal
export const LazyOrderConfirmationModal = dynamic(() => import('./OrderConfirmationModal'), {
  loading: () => <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" />,
  ssr: false
});

// ProductForm (Admin)
export const LazyProductForm = dynamic(() => import('../app/admin/products/components/ProductForm'), {
  loading: () => <div className="w-full h-[600px] bg-white animate-pulse" />,
  ssr: false
}); 