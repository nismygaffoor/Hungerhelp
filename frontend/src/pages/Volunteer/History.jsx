import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { translateStatus } from '../../i18n/donorVolunteerI18n';
import api from '../../api/axios';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import {
    MapPin,
    Package,
    Truck,
    CheckCircle,
    Clock,
    AlertCircle
} from 'lucide-react';

const STATUS_STYLES = {
    Assigned: 'bg-blue-50 text-blue-700',
    PickedUp: 'bg-amber-50 text-amber-700',
    Delivered: 'bg-green-50 text-green-700',
};

const History = () => {
    const { t } = useTranslation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState('');

    const fetchMyTasks = async () => {
        try {
            setError('');
            const res = await api.get('/delivery/my-tasks');
            setTasks(res.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || t('volunteer.history.loadFailed'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyTasks();
    }, []);

    const formatLocation = (location) => {
        if (!location) return t('volunteer.dashboard.notSpecified');
        return location.split('|')[0].trim();
    };

    const getDisplayStatus = (status) => {
        if (status === 'PickedUp') return 'In Transit';
        return status;
    };

    const handleStatusUpdate = async (taskId, newStatus) => {
        const confirmKey = newStatus === 'PickedUp'
            ? 'volunteer.history.markPickedUpConfirm'
            : 'volunteer.history.markDeliveredConfirm';
        if (!confirm(t(confirmKey))) return;

        setUpdatingId(taskId);
        try {
            const res = await api.patch(`/delivery/${taskId}/status`, { status: newStatus });
            alert(res.data.message);
            setTasks(tasks.map(task =>
                task._id === taskId ? { ...task, status: newStatus } : task
            ));
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || t('volunteer.history.updateFailed'));
        } finally {
            setUpdatingId(null);
        }
    };

    const activeTasks = tasks.filter(task => task.status !== 'Delivered');
    const completedTasks = tasks.filter(task => task.status === 'Delivered');

    const renderTaskCard = (task, showActions = false) => (
        <div key={task._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900">
                            {task.food_type || t('volunteer.history.foodDonation')}
                        </h3>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${STATUS_STYLES[task.status] || 'bg-gray-50 text-gray-600'}`}>
                            {translateStatus(getDisplayStatus(task.status), t)}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-start gap-2">
                            <MapPin size={16} className="text-green-600 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('volunteer.history.pickup')}</p>
                                <p className="font-bold text-gray-800">{formatLocation(task.pickup_location)}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <MapPin size={16} className="text-[#1E5144] mt-0.5 shrink-0" />
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('volunteer.history.dropoff')}</p>
                                <p className="font-bold text-gray-800">{formatLocation(task.dropoff_location)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {showActions && (
                    <div className="flex flex-col gap-2 w-full lg:w-auto shrink-0">
                        {task.status === 'Assigned' && (
                            <button
                                onClick={() => handleStatusUpdate(task._id, 'PickedUp')}
                                disabled={updatingId === task._id}
                                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-amber-500 text-white hover:bg-amber-600 transition-all disabled:opacity-60"
                            >
                                {updatingId === task._id ? t('volunteer.history.updating') : t('volunteer.history.markPickedUp')}
                            </button>
                        )}
                        {task.status === 'PickedUp' && (
                            <button
                                onClick={() => handleStatusUpdate(task._id, 'Delivered')}
                                disabled={updatingId === task._id}
                                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#1E5144] text-white hover:bg-[#163d33] transition-all disabled:opacity-60"
                            >
                                {updatingId === task._id ? t('volunteer.history.updating') : t('volunteer.history.markDelivered')}
                            </button>
                        )}
                    </div>
                )}

                {!showActions && (
                    <CheckCircle size={28} className="text-green-500 shrink-0" />
                )}
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-white min-h-screen`}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">
                    <header className="mb-8 text-left">
                        <h2 className="text-3xl font-bold text-gray-900 leading-tight">{t('volunteer.history.title')}</h2>
                        <p className="text-gray-500 text-sm font-medium mt-1">
                            {t('volunteer.history.subtitle')}
                        </p>
                    </header>

                    {error && (
                        <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center p-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
                            <Truck size={48} className="text-gray-300 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('volunteer.history.noDeliveries')}</h3>
                            <p className="text-gray-500">
                                {t('volunteer.history.emptyHint')}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {activeTasks.length > 0 && (
                                <section>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Clock size={20} className="text-amber-500" />
                                        {t('volunteer.history.activeDeliveries', { count: activeTasks.length })}
                                    </h3>
                                    <div className="space-y-4">
                                        {activeTasks.map(task => renderTaskCard(task, true))}
                                    </div>
                                </section>
                            )}

                            {completedTasks.length > 0 && (
                                <section>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Package size={20} className="text-green-600" />
                                        {t('volunteer.history.completed', { count: completedTasks.length })}
                                    </h3>
                                    <div className="space-y-4">
                                        {completedTasks.map(task => renderTaskCard(task, false))}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default History;
