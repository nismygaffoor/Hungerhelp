import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    getLanguageLabel,
    normalizeLanguageCode,
    persistLanguage,
} from '../i18n/languages';

export const useLanguage = () => {
    const { t, i18n } = useTranslation();
    const { user, updateUser } = useAuth();

    const changeLanguage = useCallback(async (code) => {
        const normalized = normalizeLanguageCode(code);
        await i18n.changeLanguage(normalized);
        persistLanguage(normalized);

        if (user) {
            try {
                const res = await api.patch('/auth/profile', { language: getLanguageLabel(normalized) });
                if (res.data?.user) {
                    updateUser(res.data.user);
                }
            } catch {
                // Keep UI language even if profile sync fails
            }
        }
    }, [i18n, updateUser, user]);

    return {
        t,
        i18n,
        changeLanguage,
        currentLanguage: normalizeLanguageCode(i18n.language),
    };
};

export default useLanguage;
