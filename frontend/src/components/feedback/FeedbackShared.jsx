import { Star, Loader2, MessageSquare, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getDateLocale } from '../../i18n/languages';
import { FEEDBACK_CATEGORY_KEYS } from '../../constants/feedbackConfig';

export const getFeedbackCategoryLabel = (category, t) => {
    const key = FEEDBACK_CATEGORY_KEYS[category] || 'other';
    return t(`feedback.categories.${key}`);
};

export const StarRatingInput = ({ value, onChange, accent = '#1E5144' }) => {
    const { t } = useTranslation();

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    className="p-1 transition-transform hover:scale-110"
                    aria-label={t('feedback.rateStars', { star })}
                >
                    <Star
                        size={28}
                        className={star <= value ? 'fill-current' : 'text-gray-200'}
                        style={star <= value ? { color: accent } : undefined}
                    />
                </button>
            ))}
        </div>
    );
};

export const StarRatingDisplay = ({ rating, size = 14, accent = '#1E5144' }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                size={size}
                className={star <= rating ? 'fill-current' : 'text-gray-200'}
                style={star <= rating ? { color: accent } : undefined}
            />
        ))}
    </div>
);

export const FeedbackLoading = () => (
    <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-green-600" size={40} />
    </div>
);

export const FeedbackCard = ({ item, showUser = false, accent = '#1E5144' }) => {
    const { t, i18n } = useTranslation();

    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                    {showUser && (
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-gray-50 rounded-xl">
                                <User size={14} className="text-gray-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">{item.user_name || t('feedback.defaultUser')}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t(`roles.${(item.user_role || '').toLowerCase()}`, item.user_role)}</p>
                            </div>
                        </div>
                    )}
                    <span
                        className="inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg mb-2"
                        style={{ backgroundColor: `${accent}15`, color: accent }}
                    >
                        {getFeedbackCategoryLabel(item.category, t)}
                    </span>
                    <StarRatingDisplay rating={item.rating} accent={accent} />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {item.created_at
                        ? new Date(item.created_at).toLocaleDateString(getDateLocale(i18n.language), {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                          })
                        : '—'}
                </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{item.message}</p>
        </div>
    );
};

export const EmptyFeedback = ({ message }) => (
    <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
        <MessageSquare className="mx-auto text-gray-200 mb-4" size={40} />
        <p className="text-gray-400 font-medium">{message}</p>
    </div>
);
