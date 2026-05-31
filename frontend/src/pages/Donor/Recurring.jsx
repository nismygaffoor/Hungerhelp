import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import { Plus, Edit2, Pause, Play, Trash2, X, Camera, Loader2, ArrowRight, MoreVertical, Eye, Edit } from 'lucide-react';
import {
    translateCategory,
    translateDay,
    translateFrequency,
    translateBeneficiaryType,
} from '../../i18n/donorVolunteerI18n';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import EditDonationModal from './EditDonationModal';

const Recurring = () => {
    const { t } = useTranslation();
    const [recurringItems, setRecurringItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [openMenuId, setOpenMenuId] = useState(null);
    const backendUrl = 'http://localhost:5000/uploads/';
    const navigate = useNavigate();
    const menuRef = useRef(null);

    const getTargetDisplay = (item) => {
        if (item.destination_name) return item.destination_name;
        if (item.destination_type) return translateBeneficiaryType(item.destination_type, t);
        return item.destination || null;
    };

    useEffect(() => {
        fetchRecurring();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchRecurring = async () => {
        setLoading(true);
        try {
            const res = await api.get('/food/my-recurring');
            setRecurringItems(res.data);
        } catch (err) {
            console.error("Failed to fetch recurring donations:", err);
        } finally {
            setLoading(false);
        }
    };

    const getNextUpcomingDonation = () => {
        const activeItems = recurringItems.filter(item => item.status === 'Active');
        if (activeItems.length === 0) return null;

        const dayMap = {
            'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
            'thursday': 4, 'friday': 5, 'saturday': 6, 'everyday': -1
        };

        const today = new Date().getDay();

        return activeItems.reduce((next, current) => {
            const currentDayStr = current.day.toLowerCase();
            const nextDayStr = next.day.toLowerCase();

            if (currentDayStr === 'everyday') return current;
            if (nextDayStr === 'everyday') return next;

            const currentTarget = dayMap[currentDayStr] ?? 0;
            const nextTarget = dayMap[nextDayStr] ?? 0;

            const currentDist = (currentTarget - today + 7) % 7;
            const nextDist = (nextTarget - today + 7) % 7;

            return currentDist < nextDist ? current : next;
        }, activeItems[0]);
    };

    const nextDonation = getNextUpcomingDonation();

    const handleToggleStatus = async (item) => {
        const newStatus = item.status === 'Active' ? 'Paused' : 'Active';
        try {
            await api.patch(`/food/${item._id}/status`, { status: newStatus });
            fetchRecurring();
        } catch (err) {
            alert(t('donor.recurring.statusFailed'));
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t('donor.recurring.removeConfirm'))) return;
        try {
            await api.delete(`/food/${id}`);
            fetchRecurring();
            setOpenMenuId(null);
        } catch (err) {
            alert(t('donor.recurring.deleteFailed'));
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
                <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">
                    <header className="mb-8 px-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{t('donor.recurring.title')}</h1>
                        <h2 className="text-lg font-bold text-gray-800 mt-6 mb-4">{t('donor.recurring.sectionTitle')}</h2>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-12 xl:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-visible">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center p-20 gap-4">
                                    <Loader2 className="animate-spin text-green-600" size={32} />
                                    <p className="text-gray-400 font-bold">{t('donor.recurring.connecting')}</p>
                                </div>
                            ) : recurringItems.length === 0 ? (
                                <div className="p-20 text-center flex flex-col items-center">
                                    <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                                        <Plus size={48} className="text-gray-200" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{t('donor.recurring.noRecurring')}</h3>
                                    <p className="text-gray-400 font-medium max-w-xs mx-auto">{t('donor.recurring.noRecurringHint')}</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {recurringItems.map((item) => (
                                        <div key={item._id} className="flex items-center justify-between p-3 hover:bg-gray-50/80 rounded-2xl transition-all group border-b border-gray-50 last:border-0">
                                            <div className="flex items-center gap-5 flex-1">
                                                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 bg-gray-100">
                                                    {(() => {
                                                        const firstItemImage = item.items?.[0]?.images?.[0];
                                                        const imgSrc = (item.images && item.images.length > 0)
                                                            ? `${backendUrl}${item.images[0]}`
                                                            : (firstItemImage ? `${backendUrl}${firstItemImage}` : 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=100&h=100&fit=crop');
                                                        
                                                        return (
                                                            <img
                                                                src={imgSrc}
                                                                alt={item.food_type}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            />
                                                        );
                                                    })()}
                                                </div>
                                                    <div className="text-[11px] font-bold text-gray-500 space-y-1">
                                                        {(item.items && item.items.length > 0) ? (
                                                            item.items.map((fi, idx) => (
                                                                <p key={idx} className="flex items-center gap-1.5">
                                                                    <span className="text-[9px] font-black text-green-600 uppercase tracking-tighter bg-green-50 px-1 rounded">
                                                                        {translateCategory(fi.category, t)}
                                                                    </span>
                                                                    <span className="text-gray-900">{fi.name || t('donor.recurring.item')}</span>
                                                                    <span className="text-gray-400 font-medium">({fi.quantity})</span>
                                                                </p>
                                                            ))
                                                        ) : (
                                                            <>
                                                                <p className="text-gray-900 font-black text-sm mb-1">{item.food_type?.split(' - ')[0] || t('donor.recurring.foodDonation')}</p>
                                                                <p>{item.quantity} {translateFrequency(item.frequency, t)}</p>
                                                            </>
                                                        )}
                                                        <p className="pt-1 text-gray-400">
                                                            {t('donor.recurring.repeats')} <span className="text-gray-600">{translateDay(item.day, t)}</span>
                                                        </p>
                                                        {(() => {
                                                            const target = getTargetDisplay(item);
                                                            return target ? (
                                                                <p className="text-gray-400 font-medium italic">{target}</p>
                                                            ) : null;
                                                        })()}
                                                    </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <button
                                                        onClick={() => navigate(`/donor/donation/${item._id}`)}
                                                        className="w-[110px] py-1.5 bg-[#76B56E] hover:bg-green-600 text-white text-[11px] font-black rounded-full transition-all uppercase tracking-widest shadow-sm"
                                                    >
                                                        {t('donor.recurring.viewDetails')}
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(item)}
                                                        className={`w-[110px] py-1.5 text-[11px] font-black rounded-full transition-all uppercase tracking-widest shadow-sm ${
                                                            item.status === 'Active' 
                                                            ? 'bg-[#E5E7EB] text-gray-500 hover:bg-gray-300' 
                                                            : 'bg-[#E5E7EB] text-[#3F51B5] hover:bg-indigo-100'
                                                        }`}
                                                    >
                                                        {item.status === 'Active' ? t('donor.recurring.pause') : t('donor.recurring.activate')}
                                                    </button>
                                                </div>

                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenMenuId(openMenuId === item._id ? null : item._id);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-all"
                                                    >
                                                        <MoreVertical size={20} />
                                                    </button>

                                                    {openMenuId === item._id && (
                                                        <div 
                                                            ref={menuRef}
                                                            className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-150"
                                                        >
                                                            <button
                                                                onClick={() => {
                                                                    handleEdit(item);
                                                                    setOpenMenuId(null);
                                                                }}
                                                                className="w-full text-left px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            >
                                                                <Edit size={16} /> {t('donor.recurring.editDonation')}
                                                            </button>
                                                            <div className="h-px bg-gray-50 my-1"></div>
                                                            <button
                                                                onClick={() => handleDelete(item._id)}
                                                                className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                            >
                                                                <Trash2 size={16} /> {t('common.delete')}
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

                        <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">{t('donor.recurring.quickActions')}</h3>
                                <button
                                    onClick={() => navigate('/donor/post')}
                                    className="w-full py-4 px-6 bg-[#76B56E] hover:bg-[#65a35e] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-base text-center"
                                >
                                    {t('donor.recurring.createNew')} <ArrowRight size={18} />
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">{t('donor.recurring.upcomingDonation')}</h3>

                                {nextDonation ? (
                                    <div className="space-y-10">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 bg-gray-50">
                                                {(() => {
                                                    const firstItemImage = nextDonation.items?.[0]?.images?.[0];
                                                    const imgSrc = (nextDonation.images && nextDonation.images.length > 0)
                                                        ? `${backendUrl}${nextDonation.images[0]}`
                                                        : (firstItemImage ? `${backendUrl}${firstItemImage}` : "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=100&h=100&fit=crop");
                                                    
                                                    return (
                                                        <img
                                                            src={imgSrc}
                                                            alt="Food"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    );
                                                })()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 leading-relaxed line-clamp-1 uppercase tracking-tight">
                                                    {nextDonation.food_type?.split(' - ')[0]}
                                                </p>
                                                <p className="text-xs font-bold text-gray-400">{nextDonation.quantity} {translateFrequency(nextDonation.frequency, t)}</p>
                                                {(() => {
                                                    const target = getTargetDisplay(nextDonation);
                                                    return target ? (
                                                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{target}</p>
                                                    ) : null;
                                                })()}
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-gray-50">
                                            <div>
                                                <p className="text-gray-900 font-bold text-base leading-tight">
                                                    {t('donor.recurring.pickupDay')} <span className="text-[#76B56E] font-extrabold ml-1 uppercase">{translateDay(nextDonation.day, t)}</span>
                                                </p>
                                                <p className="text-gray-300 font-bold text-[10px] tracking-tight mt-2 uppercase">
                                                    {t('donor.recurring.pickupTime')} <span className="font-medium text-gray-400 px-1">
                                                        {nextDonation.location?.split(' | ')[1] || t('donor.recurring.flexible')}
                                                    </span>
                                                </p>
                                            </div>

                                            <div className="flex gap-4 pt-4">
                                                <button
                                                    onClick={() => navigate(`/donor/donation/${nextDonation._id}`)}
                                                    className="flex-1 py-3 bg-[#E5E7EB] hover:bg-gray-300 text-gray-500 text-sm font-bold rounded-2xl transition-all"
                                                >
                                                    {t('donor.recurring.viewDetails')}
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(nextDonation)}
                                                    className={`flex-1 py-3 font-bold text-sm rounded-2xl transition-all shadow-sm ${
                                                        nextDonation.status === 'Active'
                                                        ? 'bg-[#76B56E] hover:bg-[#65a35e] text-white'
                                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                                    }`}
                                                >
                                                    {nextDonation.status === 'Active' ? t('donor.recurring.pause') : t('donor.recurring.activate')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-10 text-center">
                                        <p className="text-gray-400 font-bold text-sm">{t('donor.recurring.noUpcoming')}</p>
                                        <p className="text-gray-300 text-[10px] mt-2 italic px-4">{t('donor.recurring.activateHint')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <EditDonationModal
                    isOpen={isEditing}
                    onClose={() => setIsEditing(false)}
                    item={selectedItem}
                    onUpdate={fetchRecurring}
                />
            </main>
        </div>
    );
};

export default Recurring;
