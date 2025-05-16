'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 rounded ${language === 'en' ? 'bg-black text-white' : 'bg-gray-200'}`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('vi')}
        className={`px-2 py-1 rounded ${language === 'vi' ? 'bg-black text-white' : 'bg-gray-200'}`}
      >
        VI
      </button>
    </div>
  );
} 