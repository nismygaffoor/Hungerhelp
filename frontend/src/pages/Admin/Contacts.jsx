import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import { useDialog } from '../../context/DialogContext';
import { Search, Mail, User, MessageSquare, ChevronDown } from 'lucide-react';

const STATUS_OPTIONS = ['All', 'new', 'read', 'replied'];

const STATUS_STYLES = {
    new: 'bg-amber-50 text-amber-700 border-amber-100',
    read: 'bg-blue-50 text-blue-700 border-blue-100',
    replied: 'bg-green-50 text-green-700 border-green-100',
};

const Contacts = () => {
    const { t } = useTranslation();
    const { toast } = useDialog();
    const [messages, setMessages] = useState([]);
    const [stats, setStats] = useState({ total: 0, new: 0, read: 0, replied: 0 });
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [loadError, setLoadError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    const fetchMessages = async () => {
        setLoading(true);
        setLoadError('');
        const params = statusFilter !== 'All' ? { status: statusFilter } : {};
        try {
            const res = await api.get('/contact/', { params });
            setMessages(res.data.messages || []);
            setStats(res.data.stats || { total: 0, new: 0, read: 0, replied: 0 });
        } catch (err) {
            console.error('Failed to fetch contact messages:', err);
            setMessages([]);
            setLoadError(err.response?.data?.error || t('admin.loadContactsFailed'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [statusFilter]);

    const handleStatusChange = async (messageId, status) => {
        setUpdatingId(messageId);
        try {
            await api.patch(`/contact/${messageId}/status`, { status });
            toast.success(t('admin.contactStatusUpdated'));
            fetchMessages();
        } catch (err) {
            toast.error(err.response?.data?.error || t('admin.contactStatusUpdateFailed'));
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredMessages = messages.filter((item) => {
        const term = searchTerm.toLowerCase();
        if (!term) return true;
        return (
            item.name?.toLowerCase().includes(term) ||
            item.email?.toLowerCase().includes(term) ||
            item.subject?.toLowerCase().includes(term) ||
            item.message?.toLowerCase().includes(term)
        );
    });

    const formatDate = (value) => {
        if (!value) return '—';
        return new Date(value).toLocaleString();
    };

    const statCards = [
        { labelKey: 'admin.contactStatTotal', value: stats.total },
        { labelKey: 'admin.contactStatNew', value: stats.new },
        { labelKey: 'admin.contactStatRead', value: stats.read },
        { labelKey: 'admin.contactStatReplied', value: stats.replied },
    ];

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />
            <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-white min-h-screen`}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">
                    <header className="mb-6 text-left">
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">
                            {t('admin.contactsTitle')}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">{t('admin.contactsSubtitle')}</p>
                    </header>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {statCards.map(({ labelKey, value }) => (
                            <div key={labelKey} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t(labelKey)}</p>
                                <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('admin.searchContacts')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 outline-none text-sm font-medium"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none w-full md:w-48 px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:border-green-500 outline-none text-sm font-bold bg-white"
                            >
                                {STATUS_OPTIONS.map((status) => (
                                    <option key={status} value={status}>
                                        {status === 'All' ? t('admin.allStatuses') : t(`admin.contactStatus.${status}`)}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {loading ? (
                        <p className="text-center text-gray-400 py-16 font-bold">{t('common.loading')}</p>
                    ) : loadError ? (
                        <p className="text-center text-red-500 py-16 font-bold">{loadError}</p>
                    ) : filteredMessages.length === 0 ? (
                        <p className="text-center text-gray-400 py-16 font-bold">{t('admin.noContacts')}</p>
                    ) : (
                        <div className="space-y-4">
                            {filteredMessages.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className="inline-flex items-center gap-2 text-sm font-black text-gray-900">
                                                    <User size={16} className="text-[#1E5144]" />
                                                    {item.name}
                                                </span>
                                                <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-500">
                                                    <Mail size={14} />
                                                    {item.email}
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-800">{item.subject || t('admin.contactGeneralInquiry')}</p>
                                            <p className="text-xs text-gray-400 font-medium">{formatDate(item.created_at)}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border ${STATUS_STYLES[item.status] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                                                {t(`admin.contactStatus.${item.status}`)}
                                            </span>
                                            <select
                                                value={item.status}
                                                disabled={updatingId === item.id}
                                                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                                className="text-xs font-bold px-3 py-2 rounded-lg border border-gray-200 bg-white outline-none"
                                            >
                                                <option value="new">{t('admin.contactStatus.new')}</option>
                                                <option value="read">{t('admin.contactStatus.read')}</option>
                                                <option value="replied">{t('admin.contactStatus.replied')}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                                        <MessageSquare size={18} className="text-[#1E5144] shrink-0 mt-0.5" />
                                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{item.message}</p>
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

export default Contacts;
