import { useRouter } from 'next/navigation';

interface NoProductsMessageProps {
  resetFilters?: () => void;
}

export default function NoProductsMessage({ resetFilters }: NoProductsMessageProps) {
  const router = useRouter();
  return (
    <div className="min-h-[200px] flex flex-col justify-center items-center text-center py-8">
      <p className="text-black text-lg font-semibold mb-6">Chưa có sản phẩm bạn tìm kiếm</p>
      <button
        onClick={() => router.push('/products')}
        className="text-xs px-4 py-1 bg-black text-white border border-black rounded-none font-medium transition hover:opacity-80"
        style={{ minWidth: 90 }}
      >
        Quay lại
      </button>
    </div>
  );
}