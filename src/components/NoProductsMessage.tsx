import { useRouter } from 'next/navigation';
import { useLanguage } from "@/context/LanguageContext";

export default function NoProductsMessage() {
  const router = useRouter();
  const { t } = useLanguage();
  return (
    <div className="min-h-[200px] flex flex-col justify-center items-center text-center py-8">
      <p className="text-black text-lg font-semibold mb-6">{t('products.filter.noProductsSimple')}</p>
      <button
        onClick={() => router.push('/products')}
        className="text-xs px-4 py-1 bg-black text-white border border-black rounded-none font-medium transition hover:opacity-80"
        style={{ minWidth: 90 }}
      >
        {t('common.back')}
      </button>
    </div>
  );
}