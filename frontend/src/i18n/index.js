import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ta from './locales/ta.json';
import si from './locales/si.json';
import { getStoredLanguage, persistLanguage } from './languages';

const initialLanguage = getStoredLanguage();
persistLanguage(initialLanguage);

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        ta: { translation: ta },
        si: { translation: si },
    },
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
});

export default i18n;
