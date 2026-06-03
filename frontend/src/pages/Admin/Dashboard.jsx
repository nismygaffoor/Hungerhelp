import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { translateStatus } from '../../i18n/donorVolunteerI18n';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import {
    Users,
    Package,
    Truck,
    Loader2,
    ShieldAlert,
    Clock,
    CheckCircle,
    FileText,
    AlertTriangle,
    ArrowRight,
} from 'lucide-react';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1488459711635-de89ea219d53?w=100&h=100&fit=crop';

const STATUS_STYLES = {
    Pending: 'text-orange-600',
    Assigned: 'text-blue-600',
    PickedUp: 'text-amber-600',
    Delivered: 'text-green-600',
    Cancelled: 'text-red-600',
};

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
    const [summary, setSummary] = useState(null);
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
                setSummary(analyticsRes.data?.summary || {});
                setDeliveries(deliveriesRes.data || []);
            } catch (err) {
                console.error('Failed to fetch admin dashboard:', err);
                setError(err.response?.data?.error || t('admin.loadDashboardFailed'));
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [t]);

    const recentDeliveries = deliveries.slice(0, 5);
    const upcomingPickups = deliveries
        .filter((d) => ['Assigned', 'PickedUp', 'Pending'].includes(d.status))
        .slice(0, 5);
    const escalatedCount = deliveries.filter((d) => d.delivery_escalated || d.escalation_stage === 'escalated').length;
    const unassignedCount = deliveries.filter((d) => d.status === 'Pending' && !d.volunteer_id).length;

    const actionItems = [
        {
            label: t('admin.pendingReview'),
            value: summary?.pending_verifications ?? 0,
            hint: t('admin.dashboardVerifyHint'),
            icon: ShieldAlert,
            bg: 'bg-amber-50',
            color: 'text-amber-600',
            path: '/admin/users',
        },
        {
            label: t('admin.activeRequests'),
            value: summary?.active_requests ?? 0,
            hint: t('admin.dashboardRequestsHint'),
            icon: FileText,
            bg: 'bg-blue-50',
            color: 'text-blue-600',
            path: '/admin/requests',
        },
        {
            label: t('admin.unassignedDeliveries'),
            value: unassignedCount,
            hint: t('admin.dashboardDeliveriesHint'),
            icon: Truck,
            bg: 'bg-orange-50',
            color: 'text-orange-600',
            path: '/admin/deliveries',
        },
        {
            label: t('admin.escalatedDeliveries'),
            value: escalatedCount,
            hint: t('admin.dashboardEscalatedHint'),
            icon: AlertTriangle,
            bg: 'bg-red-50',
            color: 'text-red-600',
            path: '/admin/deliveries',
        },
    ];

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-white min-h-screen`}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                    <header className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{t('admin.dashboardTitle')}</h2>
                        <p className="text-gray-500 text-sm font-medium mt-1">{t('admin.dashboardSubtitle')}</p>
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
                    ) : (
                        <>
                            <section className="mb-8">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                                    {t('admin.needsAttention')}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {actionItems.map(({ label, value, hint, icon: Icon, bg, color, path }) => (
                                        <button
                                            key={label}
                                            type="button"
                                            onClick={() => navigate(path)}
                                            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-left hover:shadow-md hover:border-[#1E5144]/20 transition-all group"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className={`inline-flex p-2.5 rounded-xl ${bg} ${color}`}>
                                                    <Icon size={20} />
                                                </div>
                                                <ArrowRight size={16} className="text-gray-300 group-hover:text-[#1E5144] transition-colors" />
                                            </div>
                                            <p className="text-3xl font-black text-gray-900">{value}</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{label}</p>
                                            <p className="text-xs text-gray-500 mt-2">{hint}</p>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {[
                                    { label: t('admin.totalUsers'), value: summary?.total_users ?? 0, icon: Users },
                                    { label: t('admin.foodPosts'), value: summary?.total_posts ?? 0, icon: Package },
                                    { label: t('admin.deliveries'), value: summary?.total_deliveries ?? 0, icon: Truck },
                                    { label: t('admin.fulfilledRequests'), value: summary?.fulfilled_requests ?? 0, icon: CheckCircle },
                                ].map(({ label, value, icon: Icon }) => (
                                    <div key={label} className="bg-[#F9FAFB] p-4 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Icon size={16} className="text-[#1E5144]" />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                                        </div>
                                        <p className="text-xl font-black text-gray-900">{value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                                            {item.volunteer_name || t('admin.awaitingVolunteer')} ·{' '}
                                                            {item.pickup_location?.split('|')[0]?.trim() || t('admin.locationTbd')}
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

                            <p className="text-center text-xs text-gray-400 mt-8">
                                {t('admin.dashboardAnalyticsHint')}{' '}
                                <button type="button" onClick={() => navigate('/admin/stats')} className="font-bold text-[#1E5144] hover:underline">
                                    {t('sidebar.admin.stats')}
                                </button>
                            </p>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
