import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import {
    Search,
    MapPin,
    ChevronDown,
    Package,
    ArrowRight,
    Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import { DISTRICTS, getRequestDistrict, getRequestAddressDisplay } from '../../constants/locations';
import { translateCategory, translateUrgency } from '../../i18n/donorVolunteerI18n';

const URGENCY_OPTIONS = ['Normal', 'Medium', 'High'];

const RequestedFood = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [urgencyFilter, setUrgencyFilter] = useState('All Urgency');
    const [districtFilter, setDistrictFilter] = useState('All');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get('/requests/');
            setRequests(res.data);
        } catch (err) {
            console.error('Failed to fetch requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesUrgency = urgencyFilter === 'All Urgency' || req.urgency === urgencyFilter;
        const matchesSearch = searchTerm === '' ||
            (req.food_type?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (req.items?.some(item =>
                item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category?.toLowerCase().includes(searchTerm.toLowerCase())
            ));
        const matchesDistrict = districtFilter === 'All' || getRequestDistrict(req) === districtFilter;
        return matchesUrgency && matchesSearch && matchesDistrict;
    });

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-white min-h-screen`}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <header className="text-left">
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t('donor.requestedFood.title')}</h2>
                            <p className="text-gray-500 font-medium mt-1">{t('donor.requestedFood.subtitle')}</p>
                        </header>

                        <div className="flex items-center gap-3">
                            <div className="relative min-w-[240px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="text"
                                    placeholder={t('donor.requestedFood.searchPlaceholder')}
                                    className="w-full bg-gray-50 border-none rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="relative group min-w-[150px]">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <select
                                    className="w-full bg-gray-50 border-none rounded-xl pl-9 pr-8 py-2.5 text-xs font-bold text-gray-700 shadow-sm appearance-none cursor-pointer focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                                    value={urgencyFilter}
                                    onChange={(e) => setUrgencyFilter(e.target.value)}
                                >
                                    <option value="All Urgency">{t('donor.requestedFood.allUrgency')}</option>
                                    {URGENCY_OPTIONS.map((level) => (
                                        <option key={level} value={level}>{translateUrgency(level, t)}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                            </div>
                            <div className="relative group min-w-[150px]">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <select
                                    className="w-full bg-gray-50 border-none rounded-xl pl-9 pr-8 py-2.5 text-xs font-bold text-gray-700 shadow-sm appearance-none cursor-pointer focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                                    value={districtFilter}
                                    onChange={(e) => setDistrictFilter(e.target.value)}
                                >
                                    <option value="All">{t('donor.requestedFood.allDistricts')}</option>
                                    {DISTRICTS.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                            </div>
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
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('donor.requestedFood.noActiveRequests')}</h3>
                            <p className="text-gray-400 font-medium max-w-xs mx-auto leading-relaxed">
                                {searchTerm || urgencyFilter !== 'All Urgency' || districtFilter !== 'All'
                                    ? t('donor.requestedFood.adjustFilters')
                                    : t('donor.requestedFood.noRequestsNow')}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredRequests.map((req) => (
                                <RequestCard
                                    key={req._id}
                                    request={req}
                                    onMatch={() => navigate('/donor/post', {
                                        state: {
                                            matchRequest: {
                                                requestId: req._id,
                                                beneficiaryId: req.beneficiary_id,
                                                items: req.items,
                                                beneficiaryName: req.beneficiary_name || t('donor.postFood.beneficiary'),
                                                beneficiaryType: req.beneficiary_type || 'Individual'
                                            }
                                        }
                                    })}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const RequestCard = ({ request, onMatch }) => {
    const { t } = useTranslation();
    const items = request.items || [];
    const urgencyColors = {
        'Normal': 'bg-blue-50 text-blue-500 border-blue-100',
        'Medium': 'bg-orange-50 text-orange-500 border-orange-100',
        'High': 'bg-red-50 text-red-500 border-red-100'
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-green-100 transition-all duration-300 group flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${urgencyColors[request.urgency] || urgencyColors.Normal}`}>
                    {t('donor.requestedFood.urgencyLabel', { level: translateUrgency(request.urgency, t) })}
                </span>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                    {new Date(request.created_at).toLocaleDateString()}
                </span>
            </div>

            <div className="space-y-3 mb-6 flex-1">
                {items.length > 0 ? (
                    items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-2xl border border-gray-50 group-hover:bg-white transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 font-black text-[10px]">
                                {idx + 1}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-black text-green-600 uppercase tracking-tighter bg-green-50 px-1.5 py-0.5 rounded">
                                        {translateCategory(item.category, t)}
                                    </span>
                                    <h4 className="text-sm font-bold text-gray-800 truncate">
                                        {item.name || t('donor.requestedFood.item')}
                                    </h4>
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 mt-0.5">{t('donor.requestedFood.needed', { qty: item.quantity })}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-3 bg-gray-50/50 rounded-2xl border border-gray-50">
                        <h4 className="text-sm font-bold text-gray-800">{request.food_type}</h4>
                        <p className="text-[10px] font-bold text-gray-400 mt-0.5">{t('donor.requestedFood.quantity', { qty: request.quantity })}</p>
                    </div>
                )}
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-100 mt-auto">
                <div className="flex items-center gap-3 text-gray-500">
                    <MapPin size={16} className="text-green-600 shrink-0" />
                    <span className="text-xs font-bold truncate">{getRequestAddressDisplay(request)}</span>
                </div>

                {request.description && (
                    <p className="text-[11px] font-medium text-gray-400 leading-relaxed italic line-clamp-2">
                        &ldquo;{request.description}&rdquo;
                    </p>
                )}

                <button
                    onClick={onMatch}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-[#1E5144] text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-green-600/10 active:scale-95"
                >
                    {t('donor.requestedFood.matchDonation')}
                    <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
};

export default RequestedFood;
