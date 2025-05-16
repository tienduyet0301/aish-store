import { useLanguage } from "@/context/LanguageContext";

export default function ProductDetailPage() {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">{t('product.notFound')}</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) {
      toast.error(t('product.pleaseSelectSize'));
      return;
    }
    const sizeQuantity = product[`quantity${selectedSize}` as keyof Product] as number;
    if (quantity > sizeQuantity) {
      toast.error(t('product.onlyLeft', { count: sizeQuantity, size: selectedSize }));
      return;
    }
    // ... existing code ...
    toast.success(t('product.addedToCart'));
  };

  const handleQuantityChange = (value: number) => {
    if (!product || !selectedSize) return;
    const sizeQuantity = product[`quantity${selectedSize}` as keyof Product] as number;
    if (value > sizeQuantity) {
      toast.error(t('product.onlyLeft', { count: sizeQuantity, size: selectedSize }));
      return;
    }
    setQuantity(value);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Breadcrumb */}
      <div className="px-4 py-4 text-sm text-gray-600 mt-16">
        <Link href="/" className="hover:text-black font-semibold uppercase">{t('navbar.home')}</Link>
        <span className="mx-2">/</span>
        <Link href={`/products/${product.category.toLowerCase()}`} className="hover:text-black font-semibold uppercase">{t(`navbar.${product.category.toLowerCase()}`)}</Link>
        <span className="mx-2">/</span>
        <span className="text-black font-semibold uppercase">{product.name}</span>
      </div>
      // ... existing code ...
      <span className="text-black font-medium">
        {selectedSize ? `${selectedSize} - ${t('product.left', { count: product[`quantity${selectedSize}` as keyof Product] })}` : t('product.selectSize')}
      </span>
      // ... existing code ...
      {showSizeOptions && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 shadow-lg">
          {availableSizes.map((size) => {
            const sizeQuantity = product[`quantity${size}` as keyof Product] as number;
            return (
              <button
                key={size}
                onClick={() => {
                  setSelectedSize(size);
                  setShowSizeOptions(false);
                }}
                disabled={sizeQuantity === 0}
                className={`w-full px-4 py-3 text-left border-b border-gray-200 last:border-b-0 transform-none ${
                  sizeQuantity === 0 
                    ? "text-gray-400 cursor-not-allowed" 
                    : size === selectedSize 
                      ? "text-black font-bold bg-gray-100" 
                      : "text-black font-medium hover:bg-gray-50"
                }`}
                style={{ transform: 'none' }}
              >
                {size} - {t('product.left', { count: sizeQuantity })}
              </button>
            );
          })}
        </div>
      )}
      // ... existing code ...
    </div>
  );
} 