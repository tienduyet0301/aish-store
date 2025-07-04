import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import enTranslations from './messages/en.json';
import viTranslations from './messages/vi.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      vi: {
        translation: viTranslations
      }
    },
    lng: 'vi', // default language
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 