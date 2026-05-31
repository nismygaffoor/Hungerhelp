import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { translateStatus } from '../../i18n/donorVolunteerI18n';
import { downloadAnalyticsReport } from '../../utils/analyticsReport';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import {
    Users,
    Package,
    Truck,
    Download,
    Loader2,
    ShieldAlert,
    Clock,
    CheckCircle,
} from 'lucide-react';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1488459711635-de89ea219d53?w=100&h=100&fit=crop';

const STATUS_STYLES = {
    Pending: 'text-orange-600',
    Assigned: 'text-blue-600',
    PickedUp: 'text-amber-600',
    Delivered: 'text-green-600',
    Cancelled: 'text-red-600',
};

const categoryColors = ['#F97316', '#10B981', '#3B82F6', '#FACC15', '#EF4444', '#8B5CF6', '#06B6D4', '#9CA3AF'];

const BarChart = ({ labels, counts, color = 'bg-[#86EFAC]', emptyLabel }) => {
    const max = Math.max(...counts, 1);
    if (!counts.length || counts.every((c) => c === 0)) {
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

const DualBarChart = ({ labels, primary, secondary, emptyLabel }) => {
    const max = Math.max(...primary, ...secondary, 1);
    if (!labels.length || (primary.every((c) => c === 0) && secondary.every((c) => c === 0))) {
        return <p className="text-sm text-gray-400 text-center py-12">{emptyLabel}</p>;
    }
    return (
        <div className="h-44 flex items-end justify-between gap-2">
            {labels.map((label, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="flex gap-0.5 h-32 items-end w-full justify-center">
                        <div
                            style={{ height: `${((primary[i] || 0) / max) * 100}%` }}
                            className="w-2.5 bg-[#1E5144] rounded-t-sm"
                            title={`Claims: ${primary[i] || 0}`}
                        />
                        <div
                            style={{ height: `${((secondary[i] || 0) / max) * 100}%` }}
                            className="w-2.5 bg-[#86EFAC] rounded-t-sm"
                            title={`Deliveries: ${secondary[i] || 0}`}
                        />
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold">{label}</span>
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

const formatDate = (value, t) => {
    if (!value) return t('common.recently');
    try {
        return new Date(value).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    } catch {
        return t('common.recently');
    }
};

const Dashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [analytics, setAnalytics] = useState(null);
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true);
            setError('');
            try {
                const [analyticsRes, deliveriesRes] = await Promise.all([
                    api.get('/admin/analytics'),
                    api.get('/admin/deliveries'),
                ]);
                setAnalytics(analyticsRes.data);
                setDeliveries(deliveriesRes.data);
            } catch (err) {
                console.error('Failed to fetch admin dashboard:', err);
                setError(err.response?.data?.error || t('admin.loadDashboardFailed'));
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const summary = analytics?.summary || {};
    const categories = analytics?.food_categories || [];
    const categoryTotal = categories.reduce((s, c) => s + c.count, 0) || 1;

    let donutOffset = 0;
    const donutSegments = categories.slice(0, 5).map((cat, i) => {
        const percent = Math.round((cat.count / categoryTotal) * 100);
        const seg = { percent, offset: -donutOffset, color: categoryColors[i % categoryColors.length] };
        donutOffset += percent;
        return seg;
    });

    const recentDeliveries = deliveries.slice(0, 5);
    const upcomingPickups = deliveries.filter((d) => ['Assigned', 'PickedUp', 'Pending'].includes(d.status)).slice(0, 5);

    const handleDownload = () => {
        if (!analytics) return;
        downloadAnalyticsReport(analytics);
    };

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-white min-h-screen`}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                    <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{t('admin.dashboardTitle')}</h2>
                            <p className="text-gray-500 text-sm font-medium mt-1">{t('admin.dashboardSubtitle')}</p>
                        </div>
                        <button
                            onClick={handleDownload}
                            disabled={!analytics}
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
                    ) : analytics && (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {[
                                    {
                                        label: t('admin.totalUsers'),
                                        value: summary.total_users ?? 0,
                                        sub: `${summary.verified_users ?? 0} ${t('admin.verified')}`,
                                        icon: Users,
                                        bg: 'bg-[#E8F5E9]',
                                        color: 'text-[#1E5144]',
                                        action: null,
                                    },
                                    {
                                        label: t('admin.foodPosts'),
                                        value: summary.total_posts ?? 0,
                                        sub: `${summary.delivered_posts ?? 0} ${t('admin.delivered')}`,
                                        icon: Package,
                                        bg: 'bg-blue-50',
                                        color: 'text-blue-600',
                                        action: () => navigate('/admin/posts'),
                                    },
                                    {
                                        label: t('admin.deliveries'),
                                        value: summary.total_deliveries ?? 0,
                                        sub: `${summary.delivery_completion_rate ?? 0}% ${t('admin.completion')}`,
                                        icon: Truck,
                                        bg: 'bg-orange-50',
                                        color: 'text-orange-600',
                                        action: () => navigate('/admin/deliveries'),
                                    },
                                    {
                                        label: t('admin.pendingReview'),
                                        value: summary.pending_verifications ?? 0,
                                        sub: `${summary.rejected_users ?? 0} ${t('admin.rejected')}`,
                                        icon: ShieldAlert,
                                        bg: 'bg-amber-50',
                                        color: 'text-amber-600',
                                        action: () => navigate('/admin/users'),
                                    },
                                ].map(({ label, value, sub, icon: Icon, bg, color, action }) => (
                                    <button
                                        key={label}
                                        type="button"
                                        onClick={action || undefined}
                                        className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-left ${action ? 'hover:shadow-md hover:border-[#1E5144]/20 transition-all cursor-pointer' : ''}`}
                                    >
                                        <div className={`inline-flex p-2.5 rounded-xl ${bg} ${color} mb-3`}>
                                            <Icon size={20} />
                                        </div>
                                        <p className="text-2xl font-black text-gray-900">{value}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{label}</p>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1">{sub}</p>
                                    </button>
                                ))}
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
                                <h3 className="text-lg font-black text-gray-900 mb-1">{t('admin.donationTrends')}</h3>
                                <p className="text-sm text-gray-400 font-medium mb-5">{t('admin.donationTrendsDesc')}</p>
                                <BarChart
                                    labels={analytics.monthly_donations?.labels}
                                    counts={analytics.monthly_donations?.counts || []}
                                    color="bg-[#1E5144]"
                                    emptyLabel={t('common.noData')}
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-black text-gray-900 mb-1">{t('admin.claimsVsDeliveries')}</h3>
                                    <p className="text-sm text-gray-400 font-medium mb-5">{t('admin.monthlyComparison')}</p>
                                    <DualBarChart
                                        labels={analytics.monthly_claims?.labels || analytics.monthly_deliveries?.labels || []}
                                        primary={analytics.monthly_claims?.counts || []}
                                        secondary={analytics.monthly_deliveries?.counts || []}
                                        emptyLabel={t('common.noData')}
                                    />
                                    <div className="flex justify-center gap-6 mt-4">
                                        <LegendItem color="bg-[#1E5144]" label={t('admin.claims')} />
                                        <LegendItem color="bg-[#86EFAC]" label={t('admin.deliveries')} />
                                    </div>
                                </div>

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
                                                    <span className="text-[10px] text-gray-400">Total</span>
                                                    <span className="text-lg font-black">{categoryTotal}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                {categories.slice(0, 6).map((cat, i) => (
                                                    <div key={cat.name} className="flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <div
                                                                className="w-2 h-2 rounded-full shrink-0"
                                                                style={{ backgroundColor: categoryColors[i % categoryColors.length] }}
                                                            />
                                                            <span className="text-xs font-bold text-gray-700 truncate">{cat.name}</span>
                                                        </div>
                                                        <span className="text-xs font-black text-gray-900 shrink-0">{cat.count}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="text-lg font-black text-gray-900">{t('admin.recentDeliveries')}</h3>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/admin/deliveries')}
                                            className="text-xs font-bold text-[#1E5144] hover:underline"
                                        >
                                            {t('common.viewAll')}
                                        </button>
                                    </div>
                                    {recentDeliveries.length === 0 ? (
                                        <p className="text-sm text-gray-400 text-center py-8">{t('admin.noDeliveries')}</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {recentDeliveries.map((item) => (
                                                <div key={item._id} className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm shrink-0">
                                                        <img src={PLACEHOLDER_IMAGE} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-bold text-gray-800 truncate">
                                                            {item.food_type || t('admin.foodDonation')}
                                                        </h4>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                            {item.volunteer_name || t('admin.unassigned')} · {formatDate(item.created_at, t)}
                                                        </p>
                                                    </div>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest shrink-0 ${STATUS_STYLES[item.status] || 'text-gray-500'}`}>
                                                        {translateStatus(item.status, t)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-2 mb-5">
                                        <Clock size={18} className="text-[#1E5144]" />
                                        <h3 className="text-lg font-black text-gray-900">{t('admin.activePickups')}</h3>
                                    </div>
                                    {upcomingPickups.length === 0 ? (
                                        <div className="text-center py-8">
                                            <CheckCircle size={28} className="mx-auto text-green-500 mb-2" />
                                            <p className="text-sm text-gray-400">{t('admin.noPickups')}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {upcomingPickups.map((item) => (
                                                <div
                                                    key={item._id}
                                                    className="flex justify-between items-center py-3 px-4 rounded-xl bg-[#F9FAFB] border border-gray-50"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-gray-800 truncate">
                                                            {item.food_type || t('admin.foodDonation')}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                                            {item.volunteer_name || t('admin.awaitingVolunteer')} · {item.pickup_location?.split('|')[0]?.trim() || t('admin.locationTbd')}
                                                        </p>
                                                    </div>
                                                    <span className={`text-[10px] font-black uppercase shrink-0 ml-3 ${STATUS_STYLES[item.status] || 'text-gray-500'}`}>
                                                        {translateStatus(item.status === 'PickedUp' ? 'In Transit' : item.status, t)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

const LegendItem = ({ color, label }) => (
    <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-[11px] font-semibold text-gray-500">{label}</span>
    </div>
);

export default Dashboard;
