import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import VerificationReviewModal from '../../components/admin/VerificationReviewModal';
import { UserCheck, ShieldAlert, Mail, User as UserIcon, FileText } from 'lucide-react';

const ROLE_KEYS = { Admin: 'admin', Donor: 'donor', Beneficiary: 'beneficiary', Volunteer: 'volunteer' };

const Users = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [reviewUserId, setReviewUserId] = useState(null);
    const [filter, setFilter] = useState('all');

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUpdated = (action) => {
        setMessage(action === 'rejected' ? t('admin.userRejectedMsg') : t('admin.userVerifiedMsg'));
        fetchUsers();
        setTimeout(() => setMessage(''), 4000);
    };

    const getStatusLabel = (u) => {
        if (u.verification_status === 'rejected') return { text: t('admin.statusRejected'), className: 'text-red-600' };
        if (u.is_verified) return { text: t('admin.statusVerified'), className: 'text-green-600' };
        if (u.verification_status === 'pending') return { text: t('admin.statusDocsSubmitted'), className: 'text-amber-600' };
        return { text: t('status.pending'), className: 'text-gray-400' };
    };

    const filteredUsers = users.filter((u) => {
        if (filter === 'rejected') return u.verification_status === 'rejected';
        if (filter === 'pending') return !u.is_verified && u.role !== 'Admin' && u.verification_status !== 'rejected';
        if (filter === 'submitted') return !u.is_verified && u.role !== 'Admin' && (u.verification_documents?.length || 0) > 0;
        if (filter === 'verified') return u.is_verified && u.role !== 'Admin';
        return true;
    });

    const pendingCount = users.filter((u) => !u.is_verified && u.role !== 'Admin' && u.verification_status !== 'rejected').length;
    const submittedCount = users.filter((u) => !u.is_verified && u.role !== 'Admin' && (u.verification_documents?.length || 0) > 0).length;
    const rejectedCount = users.filter((u) => u.verification_status === 'rejected').length;

    const filterButtons = [
        { id: 'all', label: t('admin.filterAllUsers') },
        { id: 'submitted', label: t('admin.filterDocsReview', { count: submittedCount }) },
        { id: 'pending', label: t('admin.filterUnverified', { count: pendingCount }) },
        { id: 'verified', label: t('admin.filterVerified') },
        { id: 'rejected', label: t('admin.filterRejected', { count: rejectedCount }) },
    ];

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-white min-h-screen`}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <div className="p-4 md:p-6 lg:p-10">
                    <header className="mb-6 text-left">
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">{t('admin.usersTitle')}</h2>
                        <p className="text-gray-500 text-xs mt-1">{t('admin.usersSubtitle')}</p>
                    </header>

                    {message && (
                        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl text-sm font-bold">
                            {message}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-6">
                        {filterButtons.map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => setFilter(id)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                    filter === id
                                        ? 'bg-[#1E5144] text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#F9FAFB] border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('admin.colUser')}</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('admin.colRole')}</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('admin.colStatus')}</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('admin.colDocuments')}</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">{t('admin.colActions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-400">{t('admin.loadingUsers')}</td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-400">{t('admin.noUsersFilter')}</td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((u) => {
                                            const status = getStatusLabel(u);
                                            const docCount = u.verification_documents?.length || 0;
                                            const canReview = u.role !== 'Admin';
                                            const roleLabel = t(`roles.${ROLE_KEYS[u.role] || 'donor'}`);
                                            return (
                                                <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                                <UserIcon size={16} />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-gray-800">{u.name || u.businessName}</div>
                                                                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                                                    <Mail size={10} /> {u.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                                                            u.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                                                            u.role === 'Donor' ? 'bg-blue-100 text-blue-700' :
                                                            u.role === 'Beneficiary' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-green-100 text-green-700'
                                                        }`}>
                                                            {roleLabel}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`flex items-center gap-1 text-[10px] font-bold uppercase ${status.className}`}>
                                                            {u.is_verified ? <UserCheck size={12} /> : <ShieldAlert size={12} />}
                                                            {status.text}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <FileText size={14} className="text-gray-400" />
                                                            <span className={`text-xs font-bold ${docCount > 0 ? 'text-[#1E5144]' : 'text-gray-400'}`}>
                                                                {t('admin.docFiles', { count: docCount })}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {canReview && (
                                                            <button
                                                                onClick={() => setReviewUserId(u._id)}
                                                                className={`text-[10px] font-black px-3 py-1.5 rounded-lg transition-all uppercase tracking-widest ${
                                                                    !u.is_verified && docCount > 0
                                                                        ? 'text-white bg-[#1E5144] hover:bg-[#163d33]'
                                                                        : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                                                                }`}
                                                            >
                                                                {u.is_verified ? t('admin.viewDetails') : t('admin.reviewVerify')}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {reviewUserId && (
                <VerificationReviewModal
                    userId={reviewUserId}
                    onClose={() => setReviewUserId(null)}
                    onUpdated={handleUpdated}
                />
            )}
        </div>
    );
};

export default Users;
