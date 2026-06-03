import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import { DISTRICTS, getRequestDistrict, getRequestAddressDisplay } from '../../constants/locations';
import { translateCategory, translateUrgency, translateStatus } from '../../i18n/donorVolunteerI18n';
import {
    Search,
    MapPin,
    ChevronDown,
    Package,
    Filter,
    FileText,
    User,
    Phone,
} from 'lucide-react';

const URGENCY_OPTIONS = ['Normal', 'Medium', 'High'];
const STATUS_OPTIONS = ['All', 'Active', 'Fulfilled'];

const STATUS_STYLES = {
    Active: 'bg-green-50 text-green-700 border-green-100',
    Fulfilled: 'bg-blue-50 text-blue-700 border-blue-100',
};

const Requests = () => {
    const { t } = useTranslation();
    const [requests, setRequests] = useState([]);
    const [summary, setSummary] = useState({ total: 0, active: 0, fulfilled: 0 });
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [urgencyFilter, setUrgencyFilter] = useState('All Urgency');
    const [districtFilter, setDistrictFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [loadError, setLoadError] = useState('');

    const parseRequestsResponse = (data) => {
        if (Array.isArray(data)) {
            return {
                requests: data,
                summary: {
                    total: data.length,
                    active: data.filter((r) => r.status === 'Active').length,
                    fulfilled: data.filter((r) => r.status === 'Fulfilled').length,
                },
            };
        }
        return {
            requests: data.requests || [],
            summary: data.summary || { total: 0, active: 0, fulfilled: 0 },
        };
    };

    const fetchRequests = async () => {
        setLoading(true);
        setLoadError('');
        const params = statusFilter !== 'All' ? { status: statusFilter } : {};
        try {
            let res;
            try {
                res = await api.get('/admin/requests', { params });
            } catch {
                res = await api.get('/requests/', { params });
            }
            const parsed = parseRequestsResponse(res.data);
            setRequests(parsed.requests);
            setSummary(parsed.summary);
        } catch (err) {
            console.error('Failed to fetch admin requests:', err);
            setRequests([]);
            setLoadError(err.response?.data?.error || t('admin.loadRequestsFailed'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [statusFilter]);

    const filteredRequests = requests.filter((req) => {
        const matchesUrgency = urgencyFilter === 'All Urgency' || req.urgency === urgencyFilter;
        const matchesDistrict = districtFilter === 'All' || getRequestDistrict(req) === districtFilter;
        const term = searchTerm.toLowerCase();
        const matchesSearch =
            term === '' ||
            req.beneficiary_name?.toLowerCase().includes(term) ||
            req.food_type?.toLowerCase().includes(term) ||
            req.description?.toLowerCase().includes(term) ||
            req.items?.some(
                (item) =>
                    item.name?.toLowerCase().includes(term) ||
                    item.category?.toLowerCase().includes(term)
            );
        return matchesUrgency && matchesDistrict && matchesSearch;
    });

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />
            <main
                className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-white min-h-screen`}
            >
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">
                    <header className="mb-6 text-left">
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">
                            {t('admin.requestsTitle')}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">{t('admin.requestsSubtitle')}</p>
                    </header>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        {[
                            { label: t('admin.totalRequests'), value: summary.total },
                            { label: t('admin.activeRequests'), value: summary.active },
                            { label: t('admin.fulfilledRequests'), value: summary.fulfilled },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
                            >
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    {stat.label}
                                </p>
                                <p className="text-3xl font-black text-gray-900 mt-1">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-8">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder={t('admin.searchRequestsPlaceholder')}
                                className="w-full bg-gray-50 border-none rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-green-500/20 outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative min-w-[140px]">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <select
                                className="w-full bg-gray-50 border-none rounded-xl pl-9 pr-8 py-2.5 text-xs font-bold text-gray-700 shadow-sm appearance-none cursor-pointer focus:ring-2 focus:ring-green-500/20 outline-none"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">{t('admin.allStatuses')}</option>
                                <option value="Active">{t('status.active')}</option>
                                <option value="Fulfilled">{t('status.fulfilled')}</option>
                            </select>
                            <ChevronDown
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                size={14}
                            />
                        </div>
                        <div className="relative min-w-[140px]">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <select
                                className="w-full bg-gray-50 border-none rounded-xl pl-9 pr-8 py-2.5 text-xs font-bold text-gray-700 shadow-sm appearance-none cursor-pointer focus:ring-2 focus:ring-green-500/20 outline-none"
                                value={urgencyFilter}
                                onChange={(e) => setUrgencyFilter(e.target.value)}
                            >
                                <option value="All Urgency">{t('donor.requestedFood.allUrgency')}</option>
                                {URGENCY_OPTIONS.map((level) => (
                                    <option key={level} value={level}>
                                        {translateUrgency(level, t)}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                size={14}
                            />
                        </div>
                        <div className="relative min-w-[140px]">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <select
                                className="w-full bg-gray-50 border-none rounded-xl pl-9 pr-8 py-2.5 text-xs font-bold text-gray-700 shadow-sm appearance-none cursor-pointer focus:ring-2 focus:ring-green-500/20 outline-none"
                                value={districtFilter}
                                onChange={(e) => setDistrictFilter(e.target.value)}
                            >
                                <option value="All">{t('donor.requestedFood.allDistricts')}</option>
                                {DISTRICTS.map((d) => (
                                    <option key={d} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                size={14}
                            />
                        </div>
                    </div>

                    {loadError && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm font-bold border border-red-100">
                            {loadError}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center h-64 bg-gray-50/50 rounded-3xl border border-dashed border-gray-100">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
                            <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <FileText className="text-gray-300" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('admin.noRequestsFound')}</h3>
                            <p className="text-gray-500 text-sm">{t('admin.requestsSubtitle')}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredRequests.map((req) => (
                                <RequestRow key={req._id} request={req} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const RequestRow = ({ request }) => {
    const { t } = useTranslation();
    const items = request.items || [];
    const urgencyColors = {
        Normal: 'bg-blue-50 text-blue-500 border-blue-100',
        Medium: 'bg-orange-50 text-orange-500 border-orange-100',
        High: 'bg-red-50 text-red-500 border-red-100',
    };

    return (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span
                            className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${STATUS_STYLES[request.status] || STATUS_STYLES.Active}`}
                        >
                            {translateStatus(request.status, t)}
                        </span>
                        <span
                            className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${urgencyColors[request.urgency] || urgencyColors.Normal}`}
                        >
                            {translateUrgency(request.urgency, t)}
                        </span>
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                            {request.created_at
                                ? new Date(request.created_at).toLocaleDateString()
                                : '—'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-800">
                        <User size={16} className="text-green-600 shrink-0" />
                        <span className="font-bold">{request.beneficiary_name || t('admin.requestBeneficiary')}</span>
                        {request.beneficiary_type && (
                            <span className="text-xs text-gray-400">({request.beneficiary_type})</span>
                        )}
                    </div>
                    {request.beneficiary_contact && (
                        <div className="flex items-center gap-2 text-gray-500 mt-1">
                            <Phone size={14} className="text-gray-400 shrink-0" />
                            <span className="text-xs font-medium">{request.beneficiary_contact}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 text-gray-500 min-w-0">
                    <MapPin size={16} className="text-green-600 shrink-0" />
                    <span className="text-xs font-bold truncate">{getRequestAddressDisplay(request)}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {items.length > 0 ? (
                    items.map((item, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-50"
                        >
                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 font-black text-[10px]">
                                {idx + 1}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[8px] font-black text-green-600 uppercase tracking-tighter bg-green-50 px-1.5 py-0.5 rounded">
                                        {translateCategory(item.category, t)}
                                    </span>
                                    <span className="text-sm font-bold text-gray-800 truncate">
                                        {item.name || t('donor.requestedFood.item')}
                                    </span>
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                                    {t('donor.requestedFood.needed', { qty: item.quantity })}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-50 flex items-center gap-3">
                        <Package size={18} className="text-green-600 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-gray-800">{request.food_type || '—'}</p>
                            <p className="text-[10px] font-bold text-gray-400">
                                {t('donor.requestedFood.quantity', { qty: request.quantity || '—' })}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {request.description && (
                <p className="text-xs text-gray-500 italic border-t border-gray-100 pt-4">
                    &ldquo;{request.description}&rdquo;
                </p>
            )}
        </div>
    );
};

export default Requests;
