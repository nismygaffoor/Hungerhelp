import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { translateStatus, CATEGORY_KEY_MAP, URGENCY_KEY_MAP } from '../../i18n/donorVolunteerI18n';
import {
    Search,
    Clock,
    MapPin,
    Trash2,
    ChevronDown,
    Package,
    Plus,
    Pencil
} from 'lucide-react';
import EditRequestModal from './EditRequestModal';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import { DISTRICTS, getRequestDistrict, getRequestAddressDisplay } from '../../constants/locations';

const STATUS_STYLES = {
    Active: 'bg-amber-50 text-amber-700 border-amber-100',
    Fulfilled: 'bg-green-50 text-green-700 border-green-100',
};

const URGENCY_LEVELS = ['Normal', 'Medium', 'High'];

const MyRequests = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [urgencyFilter, setUrgencyFilter] = useState('All Urgency');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [districtFilter, setDistrictFilter] = useState('All');
    const [editingRequest, setEditingRequest] = useState(null);

    const translateCategory = (c) => {
        const k = CATEGORY_KEY_MAP[c];
        return k ? t(`beneficiary.categories.${k}`) : c;
    };

    const translateUrgency = (u) => {
        const k = URGENCY_KEY_MAP[u];
        return k ? t(`beneficiary.urgency.${k}`) : u;
    };

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const fetchMyRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get('/requests/my-requests');
            setRequests(res.data);
        } catch (err) {
            console.error('Failed to fetch requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t('beneficiary.confirmRemoveRequest'))) return;
        try {
            await api.delete(`/requests/${id}`);
            setRequests(requests.filter(r => r._id !== id));
        } catch (err) {
            alert(err.response?.data?.error || t('beneficiary.deleteRequestFailed'));
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesUrgency = urgencyFilter === 'All Urgency' || req.urgency === urgencyFilter;
        const matchesStatus = statusFilter === 'All Status' || req.status === statusFilter;
        const matchesSearch = searchTerm === '' ||
            (req.food_type?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (req.items?.some(item =>
                item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category?.toLowerCase().includes(searchTerm.toLowerCase())
            ));
        const matchesDistrict = districtFilter === 'All' || getRequestDistrict(req) === districtFilter;
        return matchesUrgency && matchesStatus && matchesSearch && matchesDistrict;
    });

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-white min-h-screen`}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <header className="text-left">
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t('beneficiary.myRequestsTitle')}</h2>
                            <p className="text-gray-500 font-medium mt-1">{t('beneficiary.myRequestsSubtitle')}</p>
                        </header>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="text"
                                    placeholder={t('beneficiary.searchItems')}
                                    className="w-full bg-gray-50 border-none rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="relative min-w-[130px]">
                                <select
                                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm appearance-none cursor-pointer focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="All Status">{t('beneficiary.allStatus')}</option>
                                    <option value="Active">{t('beneficiary.waitingForDonor')}</option>
                                    <option value="Fulfilled">{t('beneficiary.donorMatched')}</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                            </div>
                            <div className="relative min-w-[130px]">
                                <select
                                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm appearance-none cursor-pointer focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                                    value={urgencyFilter}
                                    onChange={(e) => setUrgencyFilter(e.target.value)}
                                >
                                    <option value="All Urgency">{t('beneficiary.allUrgency')}</option>
                                    {URGENCY_LEVELS.map((level) => (
                                        <option key={level} value={level}>{translateUrgency(level)}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                            </div>
                            <div className="relative min-w-[130px]">
                                <select
                                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm appearance-none cursor-pointer focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                                    value={districtFilter}
                                    onChange={(e) => setDistrictFilter(e.target.value)}
                                >
                                    <option value="All">{t('beneficiary.allDistricts')}</option>
                                    {DISTRICTS.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                            </div>
                            <button
                                onClick={() => navigate('/beneficiary/request')}
                                className="bg-green-600 hover:bg-green-700 text-white p-2.5 rounded-xl shadow-lg shadow-green-600/20 transition-all transform active:scale-95"
                                title={t('beneficiary.newRequest')}
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-100">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center bg-gray-50/30 rounded-[2.5rem] border border-dashed border-gray-200">
                            <div className="bg-white p-6 rounded-3xl shadow-sm mb-6">
                                <Package size={48} className="text-gray-200" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('beneficiary.noRequestsFound')}</h3>
                            <p className="text-gray-400 font-medium max-w-xs mx-auto leading-relaxed">
                                {searchTerm || urgencyFilter !== 'All Urgency' || statusFilter !== 'All Status' || districtFilter !== 'All'
                                    ? t('beneficiary.adjustFilters')
                                    : t('beneficiary.noRequestsPosted')}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredRequests.map((req) => (
                                <RequestCard
                                    key={req._id}
                                    request={req}
                                    onEdit={() => setEditingRequest(req)}
                                    onDelete={() => handleDelete(req._id)}
                                />
                            ))}
                        </div>
                    )}

                    <EditRequestModal
                        request={editingRequest}
                        isOpen={!!editingRequest}
                        onClose={() => setEditingRequest(null)}
                        onUpdated={fetchMyRequests}
                    />
                </div>
            </main>
        </div>
    );
};

const RequestCard = ({ request, onEdit, onDelete }) => {
    const { t } = useTranslation();

    const translateCategory = (c) => {
        const k = CATEGORY_KEY_MAP[c];
        return k ? t(`beneficiary.categories.${k}`) : c;
    };

    const translateUrgency = (u) => {
        const k = URGENCY_KEY_MAP[u];
        return k ? t(`beneficiary.urgency.${k}`) : u;
    };

    const getStatusLabel = (status) => {
        if (status === 'Active') return t('beneficiary.waitingForDonor');
        if (status === 'Fulfilled') return t('beneficiary.donorMatched');
        return translateStatus(status, t);
    };

    const items = request.items || [];
    const urgencyColors = {
        Normal: 'bg-blue-50 text-blue-500 border-blue-100',
        Medium: 'bg-orange-50 text-orange-500 border-orange-100',
        High: 'bg-red-50 text-red-500 border-red-100',
    };
    const statusClassName = STATUS_STYLES[request.status] || STATUS_STYLES.Active;
    const isActive = request.status === 'Active';

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-green-100 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4 gap-2">
                <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${statusClassName}`}>
                        {getStatusLabel(request.status)}
                    </span>
                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${urgencyColors[request.urgency] || urgencyColors.Normal}`}>
                        {t('beneficiary.urgencyLabel', { level: translateUrgency(request.urgency) })}
                    </span>
                </div>
                {isActive && (
                    <div className="flex gap-1 shrink-0">
                        <button
                            onClick={onEdit}
                            className="p-2 text-gray-400 hover:text-[#1E5144] hover:bg-green-50 rounded-xl transition-all"
                            title={t('beneficiary.editRequest')}
                        >
                            <Pencil size={16} />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title={t('beneficiary.deleteRequest')}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>

            {request.status === 'Fulfilled' && (
                <p className="text-[10px] font-medium text-green-600 bg-green-50 rounded-xl px-3 py-2 mb-4">
                    {t('beneficiary.donorMatchedTrack')}
                </p>
            )}

            <div className="space-y-2 mb-6">
                {items.length > 0 ? (
                    items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-green-600 uppercase tracking-tighter bg-green-50 px-1.5 py-0.5 rounded">
                                {translateCategory(item.category)}
                            </span>
                            <h4 className="text-sm font-bold text-gray-800 truncate">
                                {item.name || t('beneficiary.item')} <span className="text-gray-400 font-medium">({item.quantity})</span>
                            </h4>
                        </div>
                    ))
                ) : (
                    <h4 className="text-sm font-bold text-gray-800">{request.food_type} ({request.quantity})</h4>
                )}
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-50">
                <div className="flex items-center gap-3 text-gray-400">
                    <MapPin size={14} className="shrink-0" />
                    <span className="text-xs font-bold truncate">{getRequestAddressDisplay(request)}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                    <Clock size={14} className="shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                        {new Date(request.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </span>
                </div>
            </div>

            {request.description && (
                <div className="mt-4 p-3 bg-gray-50 rounded-2xl border border-gray-50">
                    <p className="text-[10px] font-medium text-gray-500 line-clamp-2 italic">
                        "{request.description}"
                    </p>
                </div>
            )}

            {isActive && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                    <button
                        onClick={onEdit}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-[#1E5144] bg-green-50 hover:bg-green-100 transition-all"
                    >
                        <Pencil size={14} />
                        {t('common.edit')}
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-all"
                    >
                        <Trash2 size={14} />
                        {t('common.delete')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyRequests;
