import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { downloadAnalyticsReport } from '../../utils/analyticsReport';
import { translateStatus } from '../../i18n/donorVolunteerI18n';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import {
    Users,
    Package,
    Truck,
    Star,
    Download,
    Loader2,
    TrendingUp,
    CheckCircle,
    FileText,
    ShieldAlert
} from 'lucide-react';

const BarChart = ({ labels, counts, color = 'bg-[#86EFAC]', emptyLabel }) => {
    const max = Math.max(...counts, 1);
    if (counts.every((c) => c === 0)) {
        return <p className="text-sm text-gray-400 text-center py-12">{emptyLabel}</p>;
    }
    return (
        <div className="h-44 flex items-end justify-between gap-2">
            {counts.map((count, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-500">{count}</span>
                    <div className="w-full h-32 bg-[#F0FDF4] rounded-t-lg flex items-end overflow-hidden">
                        <div
                            style={{ height: `${(count / max) * 100}%` }}
                            className={`w-full ${color} rounded-t-lg transition-all hover:opacity-80`}
                        />
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold">{labels[i] || ''}</span>
                </div>
            ))}
        </div>
    );
};

const DonutSegment = ({ percent, offset, color }) => (
    <circle
        cx="18"
        cy="18"
        r="15.9"
        fill="transparent"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={`${percent} 100`}
        strokeDashoffset={offset}
    />
);

const Stats = () => {
    const { t } = useTranslation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/admin/analytics');
            setData(res.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || t('admin.loadAnalyticsFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!data) return;
        downloadAnalyticsReport(data);
    };

    const summary = data?.summary || {};
    const impact = data?.impact || {};
    const categories = data?.food_categories || [];
    const categoryTotal = categories.reduce((s, c) => s + c.count, 0) || 1;
    const categoryColors = ['#F97316', '#10B981', '#3B82F6', '#FACC15', '#EF4444', '#8B5CF6', '#06B6D4', '#9CA3AF'];

    let donutOffset = 0;
    const donutSegments = categories.slice(0, 5).map((cat, i) => {
        const percent = Math.round((cat.count / categoryTotal) * 100);
        const seg = { percent, offset: -donutOffset, color: categoryColors[i % categoryColors.length] };
        donutOffset += percent;
        return seg;
    });

    const roleEntries = Object.entries(summary.users_by_role || {});
    const statusEntries = Object.entries(summary.posts_by_status || {});

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-white min-h-screen`}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                    <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{t('admin.statsTitle')}</h2>
                            <p className="text-gray-500 text-sm font-medium mt-1">
                                {t('admin.statsSubtitle')}
                            </p>
                        </div>
                        <button
                            onClick={handleDownload}
                            disabled={!data}
                            className="flex items-center gap-2 bg-[#1E5144] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#163d33] disabled:opacity-50 transition-all"
                        >
                            <Download size={16} />
                            {t('common.downloadCsvReport')}
                        </button>
                    </header>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center py-24">
                            <Loader2 className="animate-spin text-[#1E5144]" size={40} />
                        </div>
                    ) : data && (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {[
                                    { label: t('admin.totalUsers'), value: summary.total_users, icon: Users, bg: 'bg-[#E8F5E9]', color: 'text-[#1E5144]' },
                                    { label: t('admin.foodPosts'), value: summary.total_posts, icon: Package, bg: 'bg-blue-50', color: 'text-blue-600' },
                                    { label: t('admin.deliveries'), value: summary.total_deliveries, icon: Truck, bg: 'bg-orange-50', color: 'text-orange-600' },
                                    { label: t('admin.avgRating'), value: summary.avg_feedback_rating || '—', icon: Star, bg: 'bg-amber-50', color: 'text-amber-600' },
                                ].map(({ label, value, icon: Icon, bg, color }) => (
                                    <div key={label} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                        <div className={`inline-flex p-2.5 rounded-xl ${bg} ${color} mb-3`}>
                                            <Icon size={20} />
                                        </div>
                                        <p className="text-2xl font-black text-gray-900">{value}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-[#1E5144] rounded-2xl p-6 text-white shadow-lg mb-8">
                                <p className="text-[10px] font-black uppercase tracking-widest text-green-200 mb-4">{t('admin.communityImpact')}</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {[
                                        { label: t('admin.mealsDelivered'), value: impact.meals_delivered },
                                        { label: t('admin.claimsMade'), value: impact.claims_made },
                                        { label: t('admin.deliveriesDone'), value: impact.deliveries_completed },
                                        { label: t('admin.requestsMatched'), value: impact.requests_fulfilled },
                                    ].map(({ label, value }) => (
                                        <div key={label}>
                                            <p className="text-3xl font-black">{value ?? 0}</p>
                                            <p className="text-xs text-green-100 mt-1">{label}</p>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-green-200 mt-4 pt-4 border-t border-white/10">
                                    {t('admin.deliveryCompletionRate')}: <span className="font-bold text-white">{summary.delivery_completion_rate ?? 0}%</span>
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-black text-gray-900 mb-1">{t('admin.donationTrends')}</h3>
                                    <p className="text-sm text-gray-400 font-medium mb-5">{t('admin.donationTrendsDesc')}</p>
                                    <BarChart labels={data.monthly_donations?.labels} counts={data.monthly_donations?.counts || []} emptyLabel={t('common.noData')} />
                                </div>
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-black text-gray-900 mb-1">{t('admin.deliveryActivity')}</h3>
                                    <p className="text-sm text-gray-400 font-medium mb-5">{t('admin.deliveryActivityDesc')}</p>
                                    <BarChart
                                        labels={data.monthly_deliveries?.labels}
                                        counts={data.monthly_deliveries?.counts || []}
                                        color="bg-[#4ADE80]"
                                        emptyLabel={t('common.noData')}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-black text-gray-900 mb-5">{t('admin.usersByRole')}</h3>
                                    <div className="space-y-3">
                                        {roleEntries.length === 0 ? (
                                            <p className="text-sm text-gray-400">{t('admin.noUsersYet')}</p>
                                        ) : roleEntries.map(([role, count]) => (
                                            <div key={role} className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-gray-700">{t(`roles.${role.toLowerCase()}`, { defaultValue: role })}</span>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            style={{ width: `${(count / summary.total_users) * 100}%` }}
                                                            className="h-full bg-[#1E5144] rounded-full"
                                                        />
                                                    </div>
                                                    <span className="text-sm font-black text-gray-900 w-6 text-right">{count}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-black text-gray-900 mb-5">{t('admin.postStatus')}</h3>
                                    <div className="space-y-3">
                                        {statusEntries.length === 0 ? (
                                            <p className="text-sm text-gray-400">{t('admin.noPostsYet')}</p>
                                        ) : statusEntries.map(([status, count]) => (
                                            <div key={status} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                                                <span className="text-xs font-bold text-gray-700">{translateStatus(status, t)}</span>
                                                <span className="text-sm font-black text-[#1E5144]">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-black text-gray-900 mb-5">{t('admin.verification')}</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50">
                                            <CheckCircle size={18} className="text-green-600" />
                                            <div>
                                                <p className="text-xs text-gray-500">{t('admin.statusVerified')}</p>
                                                <p className="text-lg font-black text-gray-900">{summary.verified_users ?? 0}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50">
                                            <FileText size={18} className="text-amber-600" />
                                            <div>
                                                <p className="text-xs text-gray-500">{t('admin.pendingReview')}</p>
                                                <p className="text-lg font-black text-gray-900">{summary.pending_verifications ?? 0}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50">
                                            <ShieldAlert size={18} className="text-red-600" />
                                            <div>
                                                <p className="text-xs text-gray-500">{t('admin.statusRejected')}</p>
                                                <p className="text-lg font-black text-gray-900">{summary.rejected_users ?? 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-black text-gray-900 mb-1">{t('admin.foodCategories')}</h3>
                                    <p className="text-sm text-gray-400 font-medium mb-5">{t('admin.categoryBreakdown')}</p>
                                    {categories.length === 0 ? (
                                        <p className="text-sm text-gray-400 text-center py-8">{t('admin.noCategoryData')}</p>
                                    ) : (
                                        <div className="flex items-center gap-8">
                                            <div className="relative w-36 h-36 shrink-0">
                                                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                                    <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#E5E7EB" strokeWidth="4" />
                                                    {donutSegments.map((seg, i) => (
                                                        <DonutSegment key={i} {...seg} />
                                                    ))}
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-[10px] text-gray-400">{t('admin.total')}</span>
                                                    <span className="text-lg font-black">{categoryTotal}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                {categories.slice(0, 6).map((cat, i) => (
                                                    <div key={cat.name} className="flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: categoryColors[i % categoryColors.length] }} />
                                                            <span className="text-xs font-bold text-gray-700 truncate">{cat.name}</span>
                                                        </div>
                                                        <span className="text-xs font-black text-gray-900 shrink-0">{cat.count}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-black text-gray-900 mb-1">{t('admin.newRegistrations')}</h3>
                                    <p className="text-sm text-gray-400 font-medium mb-5">{t('admin.newRegistrationsDesc')}</p>
                                    <BarChart
                                        labels={data.monthly_registrations?.labels}
                                        counts={data.monthly_registrations?.counts || []}
                                        color="bg-[#1E5144]"
                                        emptyLabel={t('admin.noRegistrationData')}
                                    />
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2 mb-5">
                                    <TrendingUp size={20} className="text-[#1E5144]" />
                                    <h3 className="text-lg font-black text-gray-900">{t('admin.requestsFeedbackSummary')}</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: t('admin.totalRequests'), value: summary.total_requests },
                                        { label: t('admin.activeRequests'), value: summary.active_requests },
                                        { label: t('admin.fulfilledRequests'), value: summary.fulfilled_requests },
                                        { label: t('admin.feedbackSubmissions'), value: summary.total_feedback },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center">
                                            <p className="text-2xl font-black text-[#1E5144]">{value ?? 0}</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Stats;
