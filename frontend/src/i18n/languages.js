export const LANGUAGES = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
    { code: 'si', label: 'Sinhala', nativeLabel: 'සිංහල' },
];

const LEGACY_MAP = {
    english: 'en',
    tamil: 'ta',
    sinhala: 'si',
    en: 'en',
    ta: 'ta',
    si: 'si',
};

export const normalizeLanguageCode = (value) => {
    if (!value) return 'en';
    const key = String(value).trim().toLowerCase();
    return LEGACY_MAP[key] || 'en';
};

export const getLanguageByCode = (code) =>
    LANGUAGES.find((lang) => lang.code === normalizeLanguageCode(code)) || LANGUAGES[0];

export const getLanguageLabel = (code) => getLanguageByCode(code).label;

export const getStoredLanguage = () =>
    normalizeLanguageCode(localStorage.getItem('language') || localStorage.getItem('i18nextLng'));

export const persistLanguage = (code) => {
    const normalized = normalizeLanguageCode(code);
    localStorage.setItem('language', normalized);
    localStorage.setItem('i18nextLng', normalized);
    document.documentElement.lang = normalized;
    return normalized;
};

export const getDateLocale = (code) => {
    const map = { en: 'en-US', ta: 'ta-IN', si: 'si-LK' };
    return map[normalizeLanguageCode(code)] || 'en-US';
};
