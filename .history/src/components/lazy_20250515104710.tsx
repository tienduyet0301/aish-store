import dynamic from 'next/dynamic';

// Product Images
export const LazyProductImage = dynamic(() => import('./ProductImage'), {
  loading: () => <div className="w-full h-full bg-gray-200 animate-pulse" />,
  ssr: true
});

// Product Detail Images
export const LazyProductDetailImage = dynamic(() => import('./ProductDetailImage'), {
  loading: () => <div className="w-full h-[600px] bg-gray-200 animate-pulse" />,
  ssr: true
});

// Modals
export const LazyHelpPanel = dynamic(() => import('./HelpPanel'), {
  loading: () => <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" />,
  ssr: false
});

export const LazyOrderConfirmationModal = dynamic(() => import('./OrderConfirmationModal'), {
  loading: () => <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" />,
  ssr: false
});

// Footer Components
export const LazyFooter = dynamic(() => import('./Footer'), {
  loading: () => <div className="w-full h-60 bg-gray-100 animate-pulse" />,
  ssr: true
});

// Admin Components
export const LazyProductForm = dynamic(() => import('../app/admin/products/components/ProductForm').then(mod => mod.ProductForm), {
  loading: () => <div className="w-full h-[600px] bg-white animate-pulse" />,
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

// CartModal
export const LazyCartModal = dynamic(() => import('./CartModal'), {
  loading: () => <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" />,
  ssr: false
});

export const LazyReviewModal = dynamic(() => import('./ReviewModal'), {
  loading: () => <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" />,
  ssr: false
});

// Newsletter
export const LazyNewsletter = dynamic(() => import('./Newsletter'), {
  loading: () => <div className="w-full h-40 bg-gray-100 animate-pulse" />,
  ssr: true
}); 