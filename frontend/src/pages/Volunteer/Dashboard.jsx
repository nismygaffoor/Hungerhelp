import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { translateStatus } from '../../i18n/donorVolunteerI18n';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
    Package,
    Truck,
    CheckCircle,
    Clock,
    ChevronRight,
    Heart,
    List,
    MapPin,
    User
} from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';

const getStatusStyle = (status) => {
    if (status === 'Delivered') return 'bg-green-100 text-green-700';
    if (status === 'In Transit') return 'bg-amber-100 text-amber-700';
    if (status === 'Assigned') return 'bg-blue-100 text-blue-700';
    if (status === 'Pending') return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-600';
};

const Dashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalDeliveries: 0,
        completed: 0,
        active: 0,
        assigned: 0,
        inTransit: 0,
        availableTasks: 0,
    });
    const [recentDeliveries, setRecentDeliveries] = useState([]);
    const [activeDeliveries, setActiveDeliveries] = useState([]);
    const [availablePreview, setAvailablePreview] = useState([]);
    const [weeklyCounts, setWeeklyCounts] = useState([0, 0, 0, 0, 0, 0, 0]);
    const [dayLabels, setDayLabels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);

    const formatLocation = (location) => {
        if (!location) return t('volunteer.dashboard.notSpecified');
        return location.split('|')[0].trim();
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const res = await api.get('/delivery/stats');
            setStats({
                totalDeliveries: res.data.stats.total_deliveries,
                completed: res.data.stats.completed,
                active: res.data.stats.active,
                assigned: res.data.stats.assigned ?? 0,
                inTransit: res.data.stats.in_transit ?? 0,
                availableTasks: res.data.stats.available_tasks ?? 0,
            });
            setRecentDeliveries(res.data.recent_deliveries || []);
            setActiveDeliveries(res.data.active_deliveries || []);
            setAvailablePreview(res.data.available_preview || []);
            setWeeklyCounts(res.data.weekly_counts || [0, 0, 0, 0, 0, 0, 0]);
            setDayLabels(res.data.day_labels || []);
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const firstName = user?.name?.split(' ')[0] || t('beneficiary.welcomeThere');

    const statCards = [
        { labelKey: 'volunteer.dashboard.totalDeliveries', value: stats.totalDeliveries, icon: Package, bg: 'bg-[#E8F5E9]', color: 'text-[#1E5144]' },
        { labelKey: 'volunteer.dashboard.active', value: stats.active, icon: Clock, bg: 'bg-orange-50', color: 'text-orange-600' },
        { labelKey: 'volunteer.dashboard.completed', value: stats.completed, icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-600' },
        { labelKey: 'volunteer.dashboard.availableTasks', value: stats.availableTasks, icon: Truck, bg: 'bg-blue-50', color: 'text-blue-600' },
    ];

    const quickActions = [
        { labelKey: 'volunteer.dashboard.tasks', descKey: 'volunteer.dashboard.tasksDesc', icon: Truck, path: '/volunteer/tasks', primary: true },
        { labelKey: 'volunteer.dashboard.myDeliveries', descKey: 'volunteer.dashboard.myDeliveriesDesc', icon: List, path: '/volunteer/history' },
        { labelKey: 'volunteer.dashboard.yourProfile', descKey: 'volunteer.dashboard.yourProfileDesc', icon: User, path: '/volunteer/profile' },
    ];

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-white min-h-screen`}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                    <header className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                            {t('volunteer.dashboard.welcome', { name: firstName })}
                        </h2>
                        <p className="text-gray-500 text-sm font-medium mt-1">
                            {t('volunteer.dashboard.subtitle')}
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
                                            <h3 className="text-lg font-black text-gray-900">{t('volunteer.dashboard.recentDeliveries')}</h3>
                                            <p className="text-sm text-gray-400 font-medium">{t('volunteer.dashboard.recentDeliveriesDesc')}</p>
                                        </div>
                                        <button
                                            onClick={() => navigate('/volunteer/history')}
                                            className="text-xs font-black text-[#1E5144] uppercase tracking-widest hover:underline flex items-center gap-1"
                                        >
                                            {t('common.viewAll')} <ChevronRight size={14} />
                                        </button>
                                    </div>
                                    {recentDeliveries.length === 0 ? (
                                        <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                            <Truck className="mx-auto text-gray-200 mb-3" size={36} />
                                            <p className="text-sm text-gray-400 font-medium">{t('volunteer.dashboard.noDeliveriesYet')}</p>
                                            <button
                                                onClick={() => navigate('/volunteer/tasks')}
                                                className="mt-3 text-sm font-bold text-[#1E5144] hover:underline"
                                            >
                                                {t('volunteer.dashboard.browseTasks')}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {recentDeliveries.map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => navigate('/volunteer/history')}
                                                    className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50/80 hover:bg-[#E8F5E9]/50 border border-transparent hover:border-green-100 transition-all text-left group"
                                                >
                                                    <div className="min-w-0 mr-3">
                                                        <p className="text-sm font-bold text-gray-800 truncate group-hover:text-[#1E5144]">
                                                            {item.title}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 font-bold mt-1">
                                                            {formatLocation(item.pickup_location)} → {formatLocation(item.dropoff_location)}
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
                                    <Heart size={80} className="absolute -right-4 -top-4 opacity-10" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-green-200 mb-2">{t('volunteer.dashboard.yourImpact')}</p>
                                    <p className="text-4xl font-black mb-1">{stats.completed}</p>
                                    <p className="text-sm font-medium text-green-100 mb-4">{t('volunteer.dashboard.deliveriesCompleted')}</p>
                                    <div className="space-y-2 pt-4 border-t border-white/10">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-green-200">{t('volunteer.dashboard.awaitingPickup')}</span>
                                            <span className="font-bold">{stats.assigned}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-green-200">{t('volunteer.dashboard.inTransit')}</span>
                                            <span className="font-bold">{stats.inTransit}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-green-200">{t('volunteer.dashboard.openTasksNearby')}</span>
                                            <span className="font-bold">{stats.availableTasks}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-5">
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900">{t('volunteer.dashboard.activeDeliveries')}</h3>
                                            <p className="text-sm text-gray-400 font-medium">{t('volunteer.dashboard.activeDeliveriesDesc')}</p>
                                        </div>
                                    </div>
                                    {activeDeliveries.length === 0 ? (
                                        <p className="text-sm text-gray-400 italic py-4">{t('volunteer.dashboard.noActiveDeliveries')}</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {activeDeliveries.map((item) => (
                                                <div key={item.id} className="p-3 rounded-xl bg-orange-50 border border-orange-100 flex items-start gap-3">
                                                    <Clock size={16} className="text-orange-500 mt-0.5 shrink-0" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-bold text-gray-800 truncate">{item.title}</p>
                                                        <p className="text-[10px] text-orange-600 font-bold uppercase mt-1">
                                                            {translateStatus(item.status, t)}
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
                                            <h3 className="text-lg font-black text-gray-900">{t('volunteer.dashboard.availableTasksTitle')}</h3>
                                            <p className="text-sm text-gray-400 font-medium">{t('volunteer.dashboard.availableTasksDesc')}</p>
                                        </div>
                                        <button
                                            onClick={() => navigate('/volunteer/tasks')}
                                            className="text-xs font-black text-[#1E5144] uppercase tracking-widest hover:underline flex items-center gap-1"
                                        >
                                            {t('common.viewAll')} <ChevronRight size={14} />
                                        </button>
                                    </div>
                                    {availablePreview.length === 0 ? (
                                        <div className="text-center py-6">
                                            <p className="text-sm text-gray-400 mb-3">{t('volunteer.dashboard.noPendingTasks')}</p>
                                            <button
                                                onClick={() => navigate('/volunteer/history')}
                                                className="inline-flex items-center gap-2 text-sm font-bold text-[#1E5144] hover:underline"
                                            >
                                                <List size={16} /> {t('volunteer.dashboard.checkDeliveries')}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {availablePreview.map((task) => (
                                                <button
                                                    key={task.id}
                                                    onClick={() => navigate('/volunteer/tasks')}
                                                    className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#1E5144]/20 hover:bg-[#E8F5E9]/30 transition-all text-left"
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-bold text-gray-800 truncate">{task.title}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 flex items-center gap-1">
                                                            <MapPin size={10} />
                                                            {formatLocation(task.pickup_location)}
                                                        </p>
                                                    </div>
                                                    {task.is_urgent && (
                                                        <span className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0 bg-red-100 text-red-700">
                                                            {t('volunteer.dashboard.urgent')}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
                                <h3 className="text-lg font-black text-gray-900 mb-1">{t('volunteer.dashboard.weeklyDeliveries')}</h3>
                                <p className="text-sm text-gray-400 font-medium mb-5">{t('volunteer.dashboard.weeklyDeliveriesDesc')}</p>
                                <div className="h-36 flex items-end justify-between gap-2 px-1">
                                    {weeklyCounts.map((count, i) => {
                                        const maxCount = Math.max(...weeklyCounts, 1);
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
                                                    {dayLabels[i] || ''}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">{t('volunteer.dashboard.quickActions')}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
