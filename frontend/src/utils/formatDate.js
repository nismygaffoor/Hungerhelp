import { getDateLocale, getStoredLanguage } from '../i18n/languages';

export const formatLocalizedDate = (value, options = {}) => {
    if (!value) return '';
    try {
        return new Date(value).toLocaleDateString(getDateLocale(getStoredLanguage()), options);
    } catch {
        return '';
    }
};

export const formatLocalizedDateTime = (value, options = {}) => {
    if (!value) return '';
    try {
        return new Date(value).toLocaleString(getDateLocale(getStoredLanguage()), options);
    } catch {
        return '';
    }
};
