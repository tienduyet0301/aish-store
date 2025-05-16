interface NoProductsMessageProps {
  resetFilters: () => void;
  noProductsText: string;
  tryAgainText: string;
  resetFiltersText: string;
}

export default function NoProductsMessage({ 
  resetFilters, 
  noProductsText, 
  tryAgainText,
  resetFiltersText 
}: NoProductsMessageProps) {
  return (
    <div className="text-center py-8">
      <p className="text-gray-600 mb-2">{noProductsText}</p>
      <p className="text-gray-500 text-sm mb-4">{tryAgainText}</p>
      <button
        onClick={resetFilters}
        className="text-sm text-black hover:text-gray-600"
      >
        {resetFiltersText}
      </button>
    </div>
  );
}