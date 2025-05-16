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
    <div className="min-h-[250px] flex flex-col justify-center items-center text-center py-8">
      <p className="text-gray-700 text-lg font-semibold mb-2">{noProductsText}</p>
      <p className="text-gray-500 text-base mb-4">{tryAgainText}</p>
      <button
        onClick={resetFilters}
        className="text-base px-4 py-2 border border-black rounded hover:bg-black hover:text-white transition"
      >
        {resetFiltersText}
      </button>
    </div>
  );
}