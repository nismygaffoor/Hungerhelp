import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { ChevronDown, Send } from 'lucide-react';
import {
    StarRatingInput,
    FeedbackLoading,
    FeedbackCard,
    EmptyFeedback,
    getFeedbackCategoryLabel,
} from './FeedbackShared';

const ROLE_OPTIONS = ['All', 'Donor', 'Beneficiary', 'Volunteer', 'Admin'];

const FeedbackPageContent = ({ config }) => {
    const { t } = useTranslation();
    const [rating, setRating] = useState(0);
    const [category, setCategory] = useState(config.categories?.[0] || 'Other');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [stats, setStats] = useState(null);
    const [roleFilter, setRoleFilter] = useState('All');

    const getRoleLabel = (role) => {
        if (role === 'All') return t('feedback.allRoles');
        return t(`roles.${role.toLowerCase()}`);
    };

    const fetchFeedback = async () => {
        setLoading(true);
        try {
            if (config.isAdmin) {
                const params = roleFilter !== 'All' ? { role: roleFilter } : {};
                const res = await api.get('/feedback/', { params });
                setItems(res.data.feedback || []);
                setStats(res.data.stats || null);
            } else {
                const res = await api.get('/feedback/my');
                setItems(res.data || []);
            }
        } catch (err) {
            console.error('Failed to load feedback', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, [config.isAdmin, roleFilter]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating || !message.trim()) {
            alert(t('feedback.ratingRequiredAlert'));
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/feedback/', { rating, category, message: message.trim() });
            setRating(0);
            setMessage('');
            setCategory(config.categories?.[0] || 'Other');
            alert(t('feedback.thankYouAlert'));
            fetchFeedback();
        } catch (err) {
            alert(err.response?.data?.error || t('feedback.submitFailed'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            <header className="mb-8 text-left">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t(config.titleKey)}</h2>
                <p className="text-gray-500 text-sm font-medium mt-1">{t(config.subtitleKey)}</p>
            </header>

            {config.isAdmin ? (
                <div className="space-y-8">
                    {stats && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-2xl font-black text-gray-900">{stats.total ?? 0}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{t('feedback.totalFeedback')}</p>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-2xl font-black text-gray-900">{stats.avg_rating ?? 0}</p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{t('feedback.averageRating')}</p>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-sm font-bold text-gray-700 leading-relaxed">
                                    {Object.keys(stats.by_role || {}).length > 0
                                        ? Object.entries(stats.by_role).map(([role, data]) => (
                                            <span key={role} className="block">
                                                {t('feedback.roleBreakdown', { role, count: data.count, avg: data.avg_rating })}
                                            </span>
                                        ))
                                        : t('feedback.noBreakdownYet')}
                                </p>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{t('feedback.byRole')}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <div className="relative min-w-[160px]">
                            <select
                                className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm cursor-pointer focus:ring-2 focus:ring-gray-500/20 outline-none"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                {ROLE_OPTIONS.map((role) => (
                                    <option key={role} value={role}>{getRoleLabel(role)}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                        </div>
                    </div>

                    {loading ? (
                        <FeedbackLoading />
                    ) : items.length === 0 ? (
                        <EmptyFeedback message={t('feedback.noFeedbackYet')} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {items.map((item) => (
                                <FeedbackCard key={item.id} item={item} showUser accent={config.accent} />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-5">
                        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
                            <h3 className="text-lg font-black text-gray-900">{t('feedback.submitFeedback')}</h3>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t('feedback.yourRating')}</label>
                                <StarRatingInput value={rating} onChange={setRating} accent={config.accent} />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('feedback.category')}</label>
                                <div className="relative">
                                    <select
                                        className="w-full appearance-none bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 outline-none cursor-pointer"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        {config.categories.map((cat) => (
                                            <option key={cat} value={cat}>{getFeedbackCategoryLabel(cat, t)}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('feedback.yourMessage')}</label>
                                <textarea
                                    rows={5}
                                    placeholder={t('feedback.messagePlaceholder')}
                                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-green-500/20 focus:outline-none resize-none"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-60"
                                style={{ backgroundColor: config.accent }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = config.accentHover; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = config.accent; }}
                            >
                                {submitting ? t('feedback.submitting') : (
                                    <>
                                        <Send size={16} />
                                        {t('feedback.submitFeedback')}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-7">
                        <h3 className="text-lg font-black text-gray-900 mb-4">{t('feedback.previousFeedback')}</h3>
                        {loading ? (
                            <FeedbackLoading />
                        ) : items.length === 0 ? (
                            <EmptyFeedback message={t('feedback.noPreviousFeedback')} />
                        ) : (
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <FeedbackCard key={item.id} item={item} accent={config.accent} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackPageContent;
