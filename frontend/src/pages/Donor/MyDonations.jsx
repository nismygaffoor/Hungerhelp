import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
    Trash2,
    ChevronDown,
    Search,
    Edit2,
    MoreVertical
} from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import EditDonationModal from './EditDonationModal';
import { translateStatus, translateCategory, FOOD_CATEGORIES } from '../../i18n/donorVolunteerI18n';

const STATUS_OPTIONS = ['Available', 'Claimed', 'Pending Pickup', 'In Transit', 'Delivered', 'Expired'];

const MyDonations = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [myPosts, setMyPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [typeFilter, setTypeFilter] = useState('Food Type');

    const backendUrl = 'http://localhost:5000/uploads/';

    useEffect(() => {
        fetchMyPosts();
    }, []);

    const fetchMyPosts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/food/my-posts');
            setMyPosts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredPosts = myPosts.filter(post => {
        const isExpired = post.expiry_time && new Date(post.expiry_time) < new Date();
        const effectiveStatus = (isExpired && post.status === 'Available') ? 'Expired' : post.status;

        const matchesStatus = statusFilter === 'All Status' || effectiveStatus === statusFilter;

        const matchesType = typeFilter === 'Food Type' ||
            (post.items?.some(item => item.category === typeFilter)) ||
            (post.food_type?.split(' - ')[0] === typeFilter);

        const matchesSearch = searchTerm === '' ||
            (post.food_type?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (post.items?.some(item =>
                item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category?.toLowerCase().includes(searchTerm.toLowerCase())
            ));

        return matchesStatus && matchesType && matchesSearch;
    });

    const handleDelete = async (id) => {
        if (!confirm(t('donor.myDonations.deleteConfirm'))) return;
        try {
            await api.delete(`/food/${id}`);
            fetchMyPosts();
        } catch (err) {
            alert(t('donor.myDonations.deleteFailed'));
        }
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setIsEditing(true);
    };

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-white min-h-screen`}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                    <div className="flex flex-col gap-4 mb-8 mt-2 px-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{t('donor.myDonations.title')}</h1>

                        <div className="flex items-center justify-end gap-3 flex-wrap">
                            <div className="relative group min-w-[130px]">
                                <select
                                    className={`w-full bg-white border rounded-xl px-3 py-2 text-xs font-bold shadow-sm appearance-none cursor-pointer focus:ring-2 focus:ring-green-500/20 transition-all outline-none ${statusFilter !== 'All Status' ? 'border-green-600 text-green-600' : 'border-gray-100 text-gray-700'}`}
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="All Status">{t('donor.myDonations.allStatus')}</option>
                                    {STATUS_OPTIONS.map((status) => (
                                        <option key={status} value={status}>{translateStatus(status, t)}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                            </div>
                            <div className="relative group min-w-[130px]">
                                <select
                                    className={`w-full bg-white border rounded-xl px-3 py-2 text-xs font-bold shadow-sm appearance-none cursor-pointer focus:ring-2 focus:ring-green-500/20 transition-all outline-none ${typeFilter !== 'Food Type' ? 'border-green-600 text-green-600' : 'border-gray-100 text-gray-700'}`}
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                >
                                    <option value="Food Type">{t('donor.myDonations.foodType')}</option>
                                    {FOOD_CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{translateCategory(cat, t)}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                            </div>
                            <div className="relative min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="text"
                                    placeholder={t('donor.myDonations.searchPlaceholder')}
                                    className="w-full bg-white border border-gray-100 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-green-500/20 outline-none transition-all placeholder:text-gray-300"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {loading ? (
                            <div className="flex items-center justify-center p-20 bg-white rounded-[2.5rem] shadow-sm border border-white">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                            </div>
                        ) : filteredPosts.length === 0 ? (
                            <div className="p-20 text-center flex flex-col items-center bg-white rounded-[2.5rem] shadow-sm border border-white">
                                <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                                    <Search size={48} className="text-gray-200" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{t('donor.myDonations.noDonationsFound')}</h3>
                                <p className="text-gray-400 font-medium max-w-xs mx-auto">{t('donor.myDonations.noDonationsHint')}</p>
                                <button
                                    onClick={() => { setSearchTerm(''); setStatusFilter('All Status'); setTypeFilter('Food Type'); }}
                                    className="mt-4 text-green-600 font-bold text-sm hover:underline"
                                >
                                    {t('donor.myDonations.clearFilters')}
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {filteredPosts.map(post => (
                                    <DonationCard
                                        key={post._id}
                                        post={post}
                                        onEdit={() => handleEdit(post)}
                                        onDelete={() => handleDelete(post._id)}
                                        onView={() => navigate(`/donor/donation/${post._id}`)}
                                        backendUrl={backendUrl}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <EditDonationModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                item={selectedItem}
                onUpdate={fetchMyPosts}
            />
        </div>
    );
};

const DonationCard = ({ post, onEdit, onDelete, onView, backendUrl }) => {
    const { t } = useTranslation();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const items = post.items || [];
    let displayImages = items.flatMap(item => item.images || []);

    if (displayImages.length === 0 && post.images) {
        displayImages = [...post.images];
    }

    while (displayImages.length < 4) {
        displayImages.push('https://images.unsplash.com/photo-1488459711635-de89ea219d53?w=200&h=200&fit=crop');
    }

    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row items-center gap-6 group relative">
            <div className="w-32 h-32 rounded-2xl overflow-hidden grid grid-cols-2 gap-0.5 shadow-sm group-hover:scale-105 transition-transform duration-500 flex-shrink-0 bg-gray-50 border border-gray-50">
                {displayImages.slice(0, 4).map((img, i) => (
                    <img
                        key={i}
                        src={img.startsWith('http') ? img : `${backendUrl}${img}`}
                        alt="food"
                        className="w-full h-full object-cover"
                    />
                ))}
            </div>

            <div className="flex-1 text-left">
                <div className="mb-2">
                    {items.length > 0 ? (
                        <div className="space-y-1">
                            {items.slice(0, 3).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-black text-green-600 uppercase tracking-tighter bg-green-50 px-1.5 py-0.5 rounded">
                                        {translateCategory(item.category, t)}
                                    </span>
                                    <h4 className="text-sm font-bold text-gray-800 leading-tight">
                                        {item.name || t('donor.myDonations.item')} <span className="text-gray-400 font-medium">({item.quantity})</span>
                                    </h4>
                                </div>
                            ))}
                            {items.length > 2 && <p className="text-[10px] font-bold text-gray-400">{t('donor.myDonations.moreItems', { count: items.length - 2 })}</p>}
                        </div>
                    ) : (
                        <h4 className="text-sm font-black text-gray-800 leading-tight">
                            {post.food_type?.split(' - ')[0]} - {post.quantity}
                        </h4>
                    )}
                </div>

                <div className="space-y-1">
                    {post.beneficiary_name ? (
                        <p className="text-[11px] font-bold text-[#1E5144] flex items-center gap-1.5 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            {post.is_request_match ? t('donor.myDonations.requestMatch') : ''}{t('donor.myDonations.matchedWith', { name: post.beneficiary_name })}
                        </p>
                    ) : (() => {
                        const target = post.destination_name || post.destination_type || post.destination;
                        return target ? (
                            <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                {t('donor.myDonations.for', { target })}
                            </p>
                        ) : null;
                    })()}

                    {post.expiry_time && (
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1">
                            {t('donor.myDonations.expire')} {new Date(post.expiry_time).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }).replace(',', '')}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex flex-col items-end gap-1.5">
                    {(() => {
                        const isExpired = post.expiry_time && new Date(post.expiry_time) < new Date();
                        let displayStatus = post.status;
                        if (isExpired && post.status === 'Available') displayStatus = 'Expired';

                        return (
                            <span className={`w-[110px] py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm text-center ${
                                displayStatus === 'Available' ? 'bg-[#E8F5E9] text-[#2E7D32]' :
                                displayStatus === 'Active' ? 'bg-blue-100 text-blue-700' :
                                displayStatus === 'Claimed' ? 'bg-[#E8F5E9] text-[#1E5144]' :
                                displayStatus === 'Pending Pickup' ? 'bg-[#98E158] text-white' :
                                displayStatus === 'In Transit' ? 'bg-amber-100 text-amber-700' :
                                displayStatus === 'Delivered' ? 'bg-[#43A047] text-white' :
                                displayStatus === 'Expired' ? 'bg-gray-100 text-gray-500' :
                                'bg-[#43A047] text-white'
                            }`}>
                                {translateStatus(displayStatus, t)}
                            </span>
                        );
                    })()}

                    {(post.is_recurring || post.parent_recurring_id) && (
                        <span className="w-[110px] bg-[#D1D5DB] text-gray-500 text-[10px] font-black py-1.5 rounded-full shadow-sm uppercase tracking-widest text-center">
                            {post.parent_recurring_id ? t('donor.myDonations.recurringInstance') : t('donor.myDonations.recurring')}
                        </span>
                    )}

                    <button
                        onClick={onView}
                        className="w-[110px] py-1.5 bg-[#D1D5DB] hover:bg-gray-300 text-gray-700 text-[10px] font-black rounded-full transition-all uppercase tracking-widest shadow-sm"
                    >
                        {t('donor.myDonations.viewDetails')}
                    </button>
                </div>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                        className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-all"
                    >
                        <MoreVertical size={18} />
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-150">
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(); setMenuOpen(false); }}
                                className="w-full text-left px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <Edit2 size={16} /> {t('donor.myDonations.editDonation')}
                            </button>
                            <div className="h-px bg-gray-50 my-1"></div>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(); setMenuOpen(false); }}
                                className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <Trash2 size={16} /> {t('common.delete')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyDonations;
