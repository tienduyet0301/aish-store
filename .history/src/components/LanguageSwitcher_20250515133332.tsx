'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next-intl/client';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-2 py-1 rounded ${locale === 'en' ? 'bg-black text-white' : 'bg-gray-200'}`}
        disabled={isPending}
      >
        EN
      </button>
      <button
        onClick={() => handleLanguageChange('vi')}
        className={`px-2 py-1 rounded ${locale === 'vi' ? 'bg-black text-white' : 'bg-gray-200'}`}
        disabled={isPending}
      >
        VI
      </button>
    </div>
  );
} 