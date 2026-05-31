import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { translateStatus, translateUrgency } from '../../i18n/donorVolunteerI18n';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
    Leaf,
    Repeat,
    ChevronRight,
    Package,
    Clock,
    CheckCircle,
    FileText,
    PlusCircle,
    Users,
    List,
    Heart
} from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1488459711635-de89ea219d53?w=100&h=100&fit=crop';

const getStatusStyle = (status) => {
    if (status === 'Delivered') return 'bg-green-100 text-green-700';
    if (status === 'In Transit') return 'bg-amber-100 text-amber-700';
    if (status === 'Pending Pickup') return 'bg-orange-100 text-orange-700';
    if (status === 'Claimed') return 'bg-[#E8F5E9] text-[#1E5144]';
    if (status === 'Available' || status === 'Active') return 'bg-blue-100 text-blue-700';
    if (status === 'Expired') return 'bg-gray-100 text-gray-500';
    return 'bg-gray-100 text-gray-600';
};

const getDisplayStatus = (item) => {
    const isExpired = item.expiry_time && new Date(item.expiry_time) < new Date();
    if (isExpired && item.status === 'Available') return 'Expired';
    return item.status;
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

const getPostImage = (item, backendUrl) => {
    const firstItemImage = item.items?.[0]?.images?.[0];
    if (item.images?.length > 0) {
        const img = item.images[0];
        return img.startsWith('http') ? img : `${backendUrl}${img}`;
    }
    if (firstItemImage) {
        return firstItemImage.startsWith('http') ? firstItemImage : `${backendUrl}${firstItemImage}`;
    }
    return PLACEHOLDER_IMAGE;
};

const Dashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inProgress: 0,
        delivered: 0,
        requestMatches: 0,
        recurringActive: 0,
        openRequests: 0,
    });
    const [recentDonations, setRecentDonations] = useState([]);
    const [inProgressDonations, setInProgressDonations] = useState([]);
    const [communityRequests, setCommunityRequests] = useState([]);
    const [upcomingDonations, setUpcomingDonations] = useState([]);
    const [monthlyData, setMonthlyData] = useState([0, 0, 0, 0, 0, 0]);
    const [monthLabels, setMonthLabels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const backendUrl = 'http://localhost:5000/uploads/';

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/food/donor-stats');
            setStats({
                total: res.data.total_donations,
                active: res.data.active_donations,
                inProgress: res.data.in_progress ?? 0,
                delivered: res.data.delivered_donations,
                requestMatches: res.data.request_matches ?? 0,
                recurringActive: res.data.recurring_active ?? 0,
                openRequests: res.data.open_requests_count ?? 0,
            });
            setRecentDonations(res.data.recent_donations || []);
            setInProgressDonations(res.data.in_progress_donations || []);
            setCommunityRequests(res.data.recent_community_requests || []);
            setUpcomingDonations(res.data.upcoming_donations || []);
            setMonthlyData(res.data.monthly_counts || [0, 0, 0, 0, 0, 0]);
            setMonthLabels(res.data.month_labels || []);
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const displayName = user?.businessName || user?.name?.split(' ')[0] || 'there';

    const statCards = [
        { labelKey: 'donor.dashboard.totalDonations', value: stats.total, icon: Package, bg: 'bg-[#E8F5E9]', color: 'text-[#1E5144]' },
        { labelKey: 'donor.dashboard.activePosts', value: stats.active, icon: Leaf, bg: 'bg-blue-50', color: 'text-blue-600' },
        { labelKey: 'donor.dashboard.inProgress', value: stats.inProgress, icon: Clock, bg: 'bg-orange-50', color: 'text-orange-600' },
        { labelKey: 'donor.dashboard.delivered', value: stats.delivered, icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-600' },
    ];

    const quickActions = [
        { labelKey: 'donor.dashboard.postFood', descKey: 'donor.dashboard.postFoodDesc', icon: PlusCircle, path: '/donor/post', primary: true },
        { labelKey: 'donor.dashboard.requestedFood', descKey: 'donor.dashboard.requestedFoodDesc', icon: FileText, path: '/donor/requestedfood' },
        { labelKey: 'donor.dashboard.myDonations', descKey: 'donor.dashboard.myDonationsDesc', icon: List, path: '/donor/history' },
        { labelKey: 'donor.dashboard.recurring', descKey: 'donor.dashboard.recurringDesc', icon: Users, path: '/donor/recurring' },
    ];

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-white min-h-screen`}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                    <header className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                            {t('donor.dashboard.welcome', { name: displayName })}
                        </h2>
                        <p className="text-gray-500 text-sm font-medium mt-1">
                            {t('donor.dashboard.subtitle')}
                        </p>
                    </header>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E5144]"></div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {statCards.map(({ labelKey, value, icon: Icon, bg, color }) => (
                                    <div key={labelKey} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                        <div className={`inline-flex p-2.5 rounded-xl ${bg} ${color} mb-3`}>
                                            <Icon size={20} />
                                        </div>
                                        <p className="text-2xl font-black text-gray-900">{value}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{t(labelKey)}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-5">
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900">{t('donor.dashboard.recentDonations')}</h3>
                                            <p className="text-sm text-gray-400 font-medium">{t('donor.dashboard.recentDonationsDesc')}</p>
                                        </div>
                                        <button
                                            onClick={() => navigate('/donor/history')}
                                            className="text-xs font-black text-[#1E5144] uppercase tracking-widest hover:underline flex items-center gap-1"
                                        >
                                            {t('common.viewAll')} <ChevronRight size={14} />
                                        </button>
                                    </div>
                                    {recentDonations.length === 0 ? (
                                        <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                            <Package className="mx-auto text-gray-200 mb-3" size={36} />
                                            <p className="text-sm text-gray-400 font-medium">{t('donor.dashboard.noDonationsYet')}</p>
                                            <button
                                                onClick={() => navigate('/donor/post')}
                                                className="mt-3 text-sm font-bold text-[#1E5144] hover:underline"
                                            >
                                                {t('donor.dashboard.postFirstDonation')}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {recentDonations.map((item) => {
                                                const foodName = item.food_type?.split(' - ')[0] || t('donor.dashboard.foodDonation');
                                                const displayStatus = getDisplayStatus(item);
                                                return (
                                                    <button
                                                        key={item._id}
                                                        onClick={() => navigate(`/donor/donation/${item._id}`, { state: { from: '/donor/dashboard' } })}
                                                        className="w-full flex items-center gap-4 p-3 rounded-xl bg-gray-50/80 hover:bg-[#E8F5E9]/50 border border-transparent hover:border-green-100 transition-all text-left group"
                                                    >
                                                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm">
                                                            <img
                                                                src={getPostImage(item, backendUrl)}
                                                                alt={foodName}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-bold text-gray-800 truncate group-hover:text-[#1E5144]">
                                                                {foodName}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 font-bold mt-1">
                                                                {item.is_request_match && item.beneficiary_name
                                                                    ? t('donor.dashboard.requestMatch', { name: item.beneficiary_name })
                                                                    : formatDate(item.created_at, t)}
                                                            </p>
                                                        </div>
                                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${getStatusStyle(displayStatus)}`}>
                                                            {translateStatus(displayStatus, t)}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-[#1E5144] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                                    <Heart size={80} className="absolute -right-4 -top-4 opacity-10" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-green-200 mb-2">{t('donor.dashboard.yourImpact')}</p>
                                    <p className="text-4xl font-black mb-1">{stats.delivered}</p>
                                    <p className="text-sm font-medium text-green-100 mb-4">{t('donor.dashboard.mealsDelivered')}</p>
                                    <div className="space-y-2 pt-4 border-t border-white/10">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-green-200">{t('donor.dashboard.requestsFulfilled')}</span>
                                            <span className="font-bold">{stats.requestMatches}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-green-200">{t('donor.dashboard.activeRecurring')}</span>
                                            <span className="font-bold">{stats.recurringActive}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-green-200">{t('donor.dashboard.openRequests')}</span>
                                            <span className="font-bold">{stats.openRequests}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-5">
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900">{t('donor.dashboard.inProgressTitle')}</h3>
                                            <p className="text-sm text-gray-400 font-medium">{t('donor.dashboard.inProgressDesc')}</p>
                                        </div>
                                    </div>
                                    {inProgressDonations.length === 0 ? (
                                        <p className="text-sm text-gray-400 italic py-4">{t('donor.dashboard.nothingInProgress')}</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {inProgressDonations.map((item) => (
                                                <div key={item._id} className="p-3 rounded-xl bg-orange-50 border border-orange-100 flex items-start gap-3">
                                                    <Clock size={16} className="text-orange-500 mt-0.5 shrink-0" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-bold text-gray-800 truncate">
                                                            {item.food_type?.split(' - ')[0] || t('donor.dashboard.donation')}
                                                        </p>
                                                        <p className="text-[10px] text-orange-600 font-bold uppercase mt-1">
                                                            {translateStatus(item.status, t)}
                                                            {item.beneficiary_name ? ` · ${item.beneficiary_name}` : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-5">
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900">{t('donor.dashboard.communityRequests')}</h3>
                                            <p className="text-sm text-gray-400 font-medium">{t('donor.dashboard.communityRequestsDesc')}</p>
                                        </div>
                                        <button
                                            onClick={() => navigate('/donor/requestedfood')}
                                            className="text-xs font-black text-[#1E5144] uppercase tracking-widest hover:underline flex items-center gap-1"
                                        >
                                            {t('common.viewAll')} <ChevronRight size={14} />
                                        </button>
                                    </div>
                                    {communityRequests.length === 0 ? (
                                        <div className="text-center py-6">
                                            <p className="text-sm text-gray-400 mb-3">{t('donor.dashboard.noOpenRequests')}</p>
                                            <button
                                                onClick={() => navigate('/donor/post')}
                                                className="inline-flex items-center gap-2 text-sm font-bold text-[#1E5144] hover:underline"
                                            >
                                                <PlusCircle size={16} /> {t('donor.dashboard.postDonationInstead')}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {communityRequests.map((req) => (
                                                <button
                                                    key={req.id}
                                                    onClick={() => navigate('/donor/requestedfood')}
                                                    className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#1E5144]/20 hover:bg-[#E8F5E9]/30 transition-all text-left"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-gray-800 truncate">{req.title}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                                                            {req.beneficiary_name}
                                                            {req.district ? ` · ${req.district}` : ''}
                                                        </p>
                                                    </div>
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${
                                                        req.urgency === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {translateUrgency(req.urgency, t)}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-black text-gray-900 mb-1">{t('donor.dashboard.donationHistory')}</h3>
                                    <p className="text-sm text-gray-400 font-medium mb-5">{t('donor.dashboard.donationHistoryDesc')}</p>
                                    <div className="h-36 flex items-end justify-between gap-2 px-1">
                                        {monthlyData.map((count, i) => {
                                            const maxCount = Math.max(...monthlyData, 1);
                                            const heightPercent = (count / maxCount) * 100;
                                            return (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                                    <span className="text-[10px] font-bold text-gray-500">{count}</span>
                                                    <div className="w-full h-24 bg-[#F0FDF4] rounded-t-lg relative overflow-hidden flex items-end">
                                                        <div
                                                            style={{ height: `${heightPercent}%` }}
                                                            className="w-full bg-[#86EFAC] rounded-t-lg transition-all duration-700 hover:bg-[#4ADE80]"
                                                        />
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-bold">
                                                        {monthLabels[i] || ''}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Repeat size={18} className="text-[#1E5144]" />
                                        <h3 className="text-lg font-black text-gray-900">{t('donor.dashboard.upcomingRecurring')}</h3>
                                    </div>
                                    <p className="text-sm text-gray-400 font-medium mb-5">
                                        {t('donor.dashboard.upcomingRecurringDesc')}
                                    </p>
                                    {upcomingDonations.length === 0 ? (
                                        <div className="text-center py-6 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                            <p className="text-sm text-gray-400 mb-3">{t('donor.dashboard.noRecurringSchedules')}</p>
                                            <button
                                                onClick={() => navigate('/donor/recurring')}
                                                className="text-sm font-bold text-[#1E5144] hover:underline"
                                            >
                                                {t('donor.dashboard.setupRecurring')}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {upcomingDonations.map((item, i) => (
                                                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-[#E8F5E9]/40 border border-green-100">
                                                    <span className="text-sm font-bold text-gray-800">{item.title}</span>
                                                    <span className="text-[10px] font-bold text-[#1E5144] uppercase">{item.time}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">{t('donor.dashboard.quickActions')}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {quickActions.map(({ labelKey, descKey, icon: Icon, path, primary }) => (
                                        <button
                                            key={labelKey}
                                            onClick={() => navigate(path)}
                                            className={`p-5 rounded-2xl flex items-center gap-4 transition-all text-left group ${
                                                primary
                                                    ? 'bg-[#1E5144] text-white shadow-lg hover:bg-[#163d33]'
                                                    : 'bg-white border border-gray-100 hover:border-[#1E5144]/30 hover:shadow-md'
                                            }`}
                                        >
                                            <div className={`p-2.5 rounded-xl ${primary ? 'bg-white/10' : 'bg-[#E8F5E9] text-[#1E5144]'}`}>
                                                <Icon size={20} />
                                            </div>
                                            <div>
                                                <p className={`text-sm font-black ${primary ? 'text-white' : 'text-gray-900 group-hover:text-[#1E5144]'}`}>{t(labelKey)}</p>
                                                <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${primary ? 'text-green-100' : 'text-gray-400'}`}>{t(descKey)}</p>
                                            </div>
                                        </button>
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

export default Dashboard;
