import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import { translateStatus } from '../../i18n/donorVolunteerI18n';
import { Package, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const STATUS_STYLES = {
    Available: 'bg-green-100 text-green-700',
    Active: 'bg-blue-100 text-blue-700',
    Claimed: 'bg-amber-100 text-amber-700',
    Delivered: 'bg-purple-100 text-purple-700',
    Rejected: 'bg-red-100 text-red-700',
    Expired: 'bg-gray-100 text-gray-500',
};

const Posts = () => {
    const { t } = useTranslation();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);
    const [filter, setFilter] = useState('all');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [message, setMessage] = useState('');

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/posts');
            setPosts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleReject = async (postId) => {
        if (!confirm(t('admin.confirmRejectPost'))) return;
        setActionId(postId);
        try {
            await api.post(`/admin/posts/${postId}/reject`);
            setMessage(t('admin.postRejected'));
            fetchPosts();
        } catch (err) {
            alert(err.response?.data?.error || t('admin.rejectPostFailed'));
        } finally {
            setActionId(null);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleApprove = async (postId) => {
        setActionId(postId);
        try {
            await api.post(`/admin/posts/${postId}/approve`);
            setMessage(t('admin.postApproved'));
            fetchPosts();
        } catch (err) {
            alert(err.response?.data?.error || t('admin.approvePostFailed'));
        } finally {
            setActionId(null);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const filtered = posts.filter((p) => {
        if (filter === 'rejected') return p.status === 'Rejected';
        if (filter === 'active') return ['Available', 'Active', 'Claimed', 'Pending Pickup', 'In Transit'].includes(p.status);
        return true;
    });

    const filterLabels = {
        all: t('admin.filterAllPosts'),
        active: t('admin.filterActive'),
        rejected: t('admin.filterRejectedPosts'),
    };

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-white min-h-screen`}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">
                    <header className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900">{t('admin.postsTitle')}</h2>
                        <p className="text-gray-500 text-sm mt-1">{t('admin.postsSubtitle')}</p>
                    </header>

                    {message && (
                        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl text-sm font-bold">{message}</div>
                    )}

                    <div className="flex gap-2 mb-6">
                        {['all', 'active', 'rejected'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                                    filter === f ? 'bg-[#1E5144] text-white' : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                {filterLabels[f]}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-[#1E5144]" size={36} />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">{t('admin.noPostsFound')}</div>
                    ) : (
                        <div className="space-y-4">
                            {filtered.map((post) => {
                                const foodName = post.food_type?.split(' - ')[0] || t('admin.foodDonation');
                                const isRejected = post.status === 'Rejected';
                                return (
                                    <div key={post._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4 min-w-0">
                                            <div className="p-3 bg-[#E8F5E9] rounded-xl shrink-0">
                                                <Package size={20} className="text-[#1E5144]" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-black text-gray-900 truncate">{foodName}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {t('admin.donorLabel', { name: post.donor_name, qty: post.quantity || 'N/A' })}
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-1">{post.location || post.city || t('admin.noLocation')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[post.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {translateStatus(post.status, t)}
                                            </span>
                                            {isRejected ? (
                                                <button
                                                    onClick={() => handleApprove(post._id)}
                                                    disabled={actionId === post._id}
                                                    className="flex items-center gap-1 text-xs font-black text-green-700 bg-green-50 px-3 py-2 rounded-lg hover:bg-green-100 disabled:opacity-50"
                                                >
                                                    <CheckCircle size={14} /> {t('admin.approve')}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleReject(post._id)}
                                                    disabled={actionId === post._id}
                                                    className="flex items-center gap-1 text-xs font-black text-red-700 bg-red-50 px-3 py-2 rounded-lg hover:bg-red-100 disabled:opacity-50"
                                                >
                                                    <XCircle size={14} /> {t('admin.reject')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Posts;
