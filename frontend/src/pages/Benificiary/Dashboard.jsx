import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { translateStatus, CATEGORY_KEY_MAP, URGENCY_KEY_MAP } from '../../i18n/donorVolunteerI18n';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
    Search,
    List,
    Clock,
    LayoutGrid,
    Package,
    CheckCircle,
    FileText,
    ChevronRight,
    Shield,
    PlusCircle,
    AlertCircle
} from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import { isAccessLocked } from '../../utils/verificationAccess';

const ACTIVE_STATUSES = ['Claimed', 'Pending Pickup', 'In Transit'];

const getStatusStyle = (status) => {
    if (status === 'Delivered') return 'bg-green-100 text-green-700';
    if (status === 'In Transit') return 'bg-amber-100 text-amber-700';
    if (status === 'Pending Pickup') return 'bg-orange-100 text-orange-700';
    if (status === 'Claimed') return 'bg-[#E8F5E9] text-[#1E5144]';
    return 'bg-gray-100 text-gray-600';
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
    const translateCategory = (c) => {
        const k = CATEGORY_KEY_MAP[c];
        return k ? t(`beneficiary.categories.${k}`) : c;
    };
    const translateUrgency = (u) => {
        const k = URGENCY_KEY_MAP[u];
        return k ? t(`beneficiary.urgency.${k}`) : u;
    };
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalClaimed: 0,
        pendingPickups: 0,
        delivered: 0,
        activeRequests: 0,
        fulfilledRequests: 0,
    });
    const [recentClaims, setRecentClaims] = useState([]);
    const [recentRequests, setRecentRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const res = await api.get('/claims/stats');
            setStats({
                totalClaimed: res.data.stats.total_claimed,
                pendingPickups: res.data.stats.pending_pickups,
                delivered: res.data.stats.delivered,
                activeRequests: res.data.stats.active_requests ?? 0,
                fulfilledRequests: res.data.stats.fulfilled_requests ?? 0,
            });
            setRecentClaims(res.data.recent_activity || []);
            setRecentRequests(res.data.recent_requests || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const pendingItems = recentClaims.filter((c) => ACTIVE_STATUSES.includes(c.status));
    const firstName = user?.name?.split(' ')[0] || t('beneficiary.welcomeThere');

    const statCards = [
        { label: t('beneficiary.totalClaims'), value: stats.totalClaimed, icon: Package, bg: 'bg-[#E8F5E9]', color: 'text-[#1E5144]' },
        { label: t('beneficiary.inProgress'), value: stats.pendingPickups, icon: Clock, bg: 'bg-orange-50', color: 'text-orange-600' },
        { label: t('status.delivered'), value: stats.delivered, icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-600' },
        { label: t('beneficiary.activeRequests'), value: stats.activeRequests, icon: FileText, bg: 'bg-blue-50', color: 'text-blue-600' },
    ];

    const quickActions = [
        { label: t('beneficiary.findFood'), desc: t('beneficiary.browseDonations'), icon: Search, path: '/beneficiary/claim' },
        { label: t('beneficiary.myClaimsTitle'), desc: t('beneficiary.trackDeliveries'), icon: List, path: '/beneficiary/history', primary: true },
        { label: t('beneficiary.requestFood'), desc: t('beneficiary.askForItems'), icon: LayoutGrid, path: '/beneficiary/request' },
        { label: t('beneficiary.myRequests'), desc: t('beneficiary.manageRequests'), icon: FileText, path: '/beneficiary/my-requests' },
    ];

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-white min-h-screen`}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                    <header className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                            {t('beneficiary.welcomeBack', { name: firstName })}
                        </h2>
                        <p className="text-gray-500 text-sm font-medium mt-1">
                            {t('beneficiary.dashboardSubtitle')}
                        </p>
                    </header>

                    {isAccessLocked(user) && (
                        <div className="mb-8 flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100">
                            <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-red-800">{t('beneficiary.accessRestricted')}</p>
                                <p className="text-xs text-red-700 mt-1">
                                    {user?.rejection_reason
                                        ? t('beneficiary.rejectedWithReason', { reason: user.rejection_reason })
                                        : t('beneficiary.rejectedNoReason')}
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/beneficiary/profile')}
                                className="text-xs font-black text-red-800 uppercase tracking-widest hover:underline shrink-0"
                            >
                                {t('beneficiary.goToProfile')}
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E5144]"></div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {statCards.map(({ label, value, icon: Icon, bg, color }) => (
                                    <div key={label} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                        <div className={`inline-flex p-2.5 rounded-xl ${bg} ${color} mb-3`}>
                                            <Icon size={20} />
                                        </div>
                                        <p className="text-2xl font-black text-gray-900">{value}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-5">
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900">{t('beneficiary.recentClaims')}</h3>
                                            <p className="text-sm text-gray-400 font-medium">{t('beneficiary.recentClaimsDesc')}</p>
                                        </div>
                                        <button
                                            onClick={() => navigate('/beneficiary/history')}
                                            className="text-xs font-black text-[#1E5144] uppercase tracking-widest hover:underline flex items-center gap-1"
                                        >
                                            {t('common.viewAll')} <ChevronRight size={14} />
                                        </button>
                                    </div>
                                    {recentClaims.length === 0 ? (
                                        <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                            <Package className="mx-auto text-gray-200 mb-3" size={36} />
                                            <p className="text-sm text-gray-400 font-medium">{t('beneficiary.noClaimsYet')}</p>
                                            <button
                                                onClick={() => navigate('/beneficiary/claim')}
                                                className="mt-3 text-sm font-bold text-[#1E5144] hover:underline"
                                            >
                                                {t('beneficiary.browseAvailableFood')}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {recentClaims.map((item) => (
                                                <button
                                                    key={item.post_id}
                                                    onClick={() => navigate(`/beneficiary/donation/${item.post_id}`, { state: { from: '/beneficiary/dashboard' } })}
                                                    className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50/80 hover:bg-[#E8F5E9]/50 border border-transparent hover:border-green-100 transition-all text-left group"
                                                >
                                                    <div className="min-w-0 mr-3">
                                                        <p className="text-sm font-bold text-gray-800 truncate group-hover:text-[#1E5144]">
                                                            {item.title}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 font-bold mt-1">
                                                            {t('beneficiary.fromDonor', { donor: item.donor_name })} · {formatDate(item.time, t)}
                                                        </p>
                                                    </div>
                                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${getStatusStyle(item.status)}`}>
                                                        {translateStatus(item.status, t)}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-[#1E5144] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                                    <Shield size={80} className="absolute -right-4 -top-4 opacity-10" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-green-200 mb-2">{t('beneficiary.yourImpact')}</p>
                                    <p className="text-4xl font-black mb-1">{stats.delivered}</p>
                                    <p className="text-sm font-medium text-green-100 mb-4">{t('beneficiary.mealsDeliveredToYou')}</p>
                                    <div className="space-y-2 pt-4 border-t border-white/10">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-green-200">{t('beneficiary.requestsMatchedStat')}</span>
                                            <span className="font-bold">{stats.fulfilledRequests}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-green-200">{t('beneficiary.currentlyInProgress')}</span>
                                            <span className="font-bold">{stats.pendingPickups}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-5">
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900">{t('beneficiary.inProgress')}</h3>
                                            <p className="text-sm text-gray-400 font-medium">{t('beneficiary.inProgressDesc')}</p>
                                        </div>
                                    </div>
                                    {pendingItems.length === 0 ? (
                                        <p className="text-sm text-gray-400 italic py-4">{t('beneficiary.nothingInProgress')}</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {pendingItems.map((item) => (
                                                <div key={item.post_id} className="p-3 rounded-xl bg-orange-50 border border-orange-100 flex items-start gap-3">
                                                    <Clock size={16} className="text-orange-500 mt-0.5 shrink-0" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-bold text-gray-800 truncate">{item.title}</p>
                                                        <p className="text-[10px] text-orange-600 font-bold uppercase mt-1">{translateStatus(item.status, t)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-5">
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900">{t('beneficiary.myRequests')}</h3>
                                            <p className="text-sm text-gray-400 font-medium">{t('beneficiary.myRequestsDesc')}</p>
                                        </div>
                                        <button
                                            onClick={() => navigate('/beneficiary/my-requests')}
                                            className="text-xs font-black text-[#1E5144] uppercase tracking-widest hover:underline flex items-center gap-1"
                                        >
                                            {t('common.viewAll')} <ChevronRight size={14} />
                                        </button>
                                    </div>
                                    {recentRequests.length === 0 ? (
                                        <div className="text-center py-6">
                                            <p className="text-sm text-gray-400 mb-3">{t('beneficiary.noFoodRequestsYet')}</p>
                                            <button
                                                onClick={() => navigate('/beneficiary/request')}
                                                className="inline-flex items-center gap-2 text-sm font-bold text-[#1E5144] hover:underline"
                                            >
                                                <PlusCircle size={16} /> {t('beneficiary.createRequest')}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {recentRequests.map((req) => (
                                                <div key={req.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-gray-800 truncate">{req.title}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                                                            {req.status === 'Active' ? t('beneficiary.waitingForDonor') : t('beneficiary.donorMatched')} · {translateUrgency(req.urgency)}
                                                        </p>
                                                    </div>
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${
                                                        req.status === 'Fulfilled' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {req.status === 'Active' ? t('beneficiary.open') : t('beneficiary.matched')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">{t('beneficiary.quickActions')}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {quickActions.map(({ label, desc, icon: Icon, path, primary }) => (
                                        <button
                                            key={path}
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
                                                <p className={`text-sm font-black ${primary ? 'text-white' : 'text-gray-900 group-hover:text-[#1E5144]'}`}>{label}</p>
                                                <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${primary ? 'text-green-100' : 'text-gray-400'}`}>{desc}</p>
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
