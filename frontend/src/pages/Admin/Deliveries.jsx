import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import { translateStatus } from '../../i18n/donorVolunteerI18n';
import { Truck, MapPin, Loader2, CheckCircle, XCircle, Package } from 'lucide-react';

const STATUS_STYLES = {
    Pending: 'bg-orange-100 text-orange-700',
    Assigned: 'bg-blue-100 text-blue-700',
    PickedUp: 'bg-amber-100 text-amber-700',
    Delivered: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
};

const Deliveries = () => {
    const { t } = useTranslation();
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [message, setMessage] = useState('');

    const formatLocation = (location) => {
        if (!location) return t('admin.notSpecified');
        return location.split('|')[0].trim();
    };

    const fetchDeliveries = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/deliveries');
            setDeliveries(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const updateStatus = async (taskId, status) => {
        const confirmKeys = {
            PickedUp: 'admin.confirmPickedUp',
            Delivered: 'admin.confirmDelivered',
            Cancelled: 'admin.confirmCancel',
        };
        if (!confirm(t(confirmKeys[status]))) return;

        setActionId(taskId);
        try {
            await api.patch(`/admin/deliveries/${taskId}/status`, { status });
            setMessage(status === 'Cancelled' ? t('admin.deliveryCancelled') : t('admin.deliveryUpdated'));
            fetchDeliveries();
        } catch (err) {
            alert(err.response?.data?.error || t('admin.updateDeliveryFailed'));
        } finally {
            setActionId(null);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const displayTaskStatus = (status) => {
        if (status === 'PickedUp') return t('status.inTransit');
        return translateStatus(status, t);
    };

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-white min-h-screen`}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">
                    <header className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900">{t('admin.deliveriesTitle')}</h2>
                        <p className="text-gray-500 text-sm mt-1">{t('admin.deliveriesSubtitle')}</p>
                    </header>

                    {message && (
                        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl text-sm font-bold">{message}</div>
                    )}

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-[#1E5144]" size={36} />
                        </div>
                    ) : deliveries.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">{t('admin.noDeliveriesYet')}</div>
                    ) : (
                        <div className="space-y-4">
                            {deliveries.map((task) => (
                                <div key={task._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <Truck size={18} className="text-[#1E5144]" />
                                                <h3 className="text-sm font-black text-gray-900">{task.food_type || t('admin.foodDelivery')}</h3>
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[task.status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {displayTaskStatus(task.status)}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                                <div className="flex items-start gap-2">
                                                    <MapPin size={14} className="text-green-600 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase">{t('admin.pickup')}</p>
                                                        <p className="font-bold text-gray-800">{formatLocation(task.pickup_location)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <MapPin size={14} className="text-[#1E5144] mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase">{t('admin.dropoff')}</p>
                                                        <p className="font-bold text-gray-800">{formatLocation(task.dropoff_location)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-bold">
                                                {t('admin.volunteerLabel', { name: task.volunteer_name || t('admin.unassigned') })}
                                            </p>
                                        </div>

                                        {task.status !== 'Delivered' && task.status !== 'Cancelled' && (
                                            <div className="flex flex-wrap gap-2 shrink-0">
                                                {task.status === 'Assigned' && (
                                                    <button
                                                        onClick={() => updateStatus(task._id, 'PickedUp')}
                                                        disabled={actionId === task._id}
                                                        className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
                                                    >
                                                        <Package size={14} /> {t('admin.pickedUpBtn')}
                                                    </button>
                                                )}
                                                {(task.status === 'Assigned' || task.status === 'PickedUp') && (
                                                    <button
                                                        onClick={() => updateStatus(task._id, 'Delivered')}
                                                        disabled={actionId === task._id}
                                                        className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-[#1E5144] text-white hover:bg-[#163d33] disabled:opacity-50"
                                                    >
                                                        <CheckCircle size={14} /> {t('admin.markDelivered')}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => updateStatus(task._id, 'Cancelled')}
                                                    disabled={actionId === task._id}
                                                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                                                >
                                                    <XCircle size={14} /> {t('common.cancel')}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Deliveries;
