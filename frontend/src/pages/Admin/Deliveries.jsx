import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import { translateStatus } from '../../i18n/donorVolunteerI18n';
import { Truck, MapPin, Loader2, CheckCircle, XCircle, Package, AlertTriangle, UserPlus } from 'lucide-react';
import { useDialog } from '../../context/DialogContext';

const STATUS_STYLES = {
    Pending: 'bg-orange-100 text-orange-700',
    Assigned: 'bg-blue-100 text-blue-700',
    PickedUp: 'bg-amber-100 text-amber-700',
    Delivered: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
};

const Deliveries = () => {
    const { t } = useTranslation();
    const { toast, confirmDialog } = useDialog();
    const [deliveries, setDeliveries] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [assignSelections, setAssignSelections] = useState({});
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
            await api.post('/admin/deliveries/process-escalations').catch(() => {});
            const [deliveriesRes, usersRes] = await Promise.all([
                api.get('/admin/deliveries'),
                api.get('/admin/users'),
            ]);
            setDeliveries(deliveriesRes.data);
            setVolunteers((usersRes.data || []).filter((u) => u.role === 'Volunteer'));
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
        const ok = await confirmDialog(t(confirmKeys[status]), { variant: 'danger' });
        if (!ok) return;

        setActionId(taskId);
        try {
            await api.patch(`/admin/deliveries/${taskId}/status`, { status });
            setMessage(status === 'Cancelled' ? t('admin.deliveryCancelled') : t('admin.deliveryUpdated'));
            fetchDeliveries();
        } catch (err) {
            toast.error(err.response?.data?.error || t('admin.updateDeliveryFailed'));
        } finally {
            setActionId(null);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const assignVolunteer = async (taskId) => {
        const volunteerId = assignSelections[taskId];
        if (!volunteerId) {
            toast.warning(t('admin.selectVolunteerFirst'));
            return;
        }

        const ok = await confirmDialog(t('admin.confirmAssignVolunteer'), { variant: 'danger' });
        if (!ok) return;

        setActionId(taskId);
        try {
            const res = await api.post(`/admin/deliveries/${taskId}/assign`, { volunteer_id: volunteerId });
            toast.success(res.data.message);
            fetchDeliveries();
        } catch (err) {
            toast.error(err.response?.data?.error || t('admin.assignVolunteerFailed'));
        } finally {
            setActionId(null);
        }
    };

    const displayTaskStatus = (status) => {
        if (status === 'PickedUp') return t('status.inTransit');
        return translateStatus(status, t);
    };

    const needsAssign = (task) => task.status === 'Pending' && !task.volunteer_id;

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
                                <div key={task._id} className={`bg-white border rounded-2xl p-5 shadow-sm ${task.escalation_stage === 'escalated' && needsAssign(task) ? 'border-amber-300 bg-amber-50/30' : 'border-gray-100'}`}>
                                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <Truck size={18} className="text-[#1E5144]" />
                                                <h3 className="text-sm font-black text-gray-900">{task.food_type || t('admin.foodDelivery')}</h3>
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[task.status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {displayTaskStatus(task.status)}
                                                </span>
                                                {task.escalation_stage === 'escalated' && needsAssign(task) && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 uppercase">
                                                        <AlertTriangle size={12} />
                                                        {t('admin.needsAttention')}
                                                    </span>
                                                )}
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

                                        <div className="flex flex-col gap-2 shrink-0 min-w-[220px]">
                                            {needsAssign(task) && (
                                                <div className="flex flex-col gap-2 p-3 bg-white border border-gray-100 rounded-xl">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase">{t('admin.assignVolunteer')}</label>
                                                    <select
                                                        value={assignSelections[task._id] || ''}
                                                        onChange={(e) => setAssignSelections((prev) => ({ ...prev, [task._id]: e.target.value }))}
                                                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                                    >
                                                        <option value="">{t('admin.selectVolunteer')}</option>
                                                        {volunteers.map((vol) => (
                                                            <option key={vol._id} value={vol._id}>
                                                                {vol.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={() => assignVolunteer(task._id)}
                                                        disabled={actionId === task._id}
                                                        className="flex items-center justify-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-[#1E5144] text-white hover:bg-[#163d33] disabled:opacity-50"
                                                    >
                                                        <UserPlus size={14} />
                                                        {t('admin.assignBtn')}
                                                    </button>
                                                </div>
                                            )}

                                            {task.status !== 'Delivered' && task.status !== 'Cancelled' && (
                                                <div className="flex flex-wrap gap-2">
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
