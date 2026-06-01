import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { translateStatus, CATEGORY_KEY_MAP, URGENCY_KEY_MAP } from '../../i18n/donorVolunteerI18n';
import api from '../../api/axios';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import { getPostAddressDisplay } from '../../constants/locations';
import {
    ArrowLeft,
    MapPin,
    Calendar,
    Package,
    Clock,
    AlertCircle,
    Repeat,
    Utensils,
    Navigation2
} from 'lucide-react';
import { useDialog } from '../../context/DialogContext';
import DeliveryTrackingCard from '../../components/delivery/DeliveryTrackingCard';
import EscalationActions from '../../components/delivery/EscalationActions';

const BeneficiaryDonationDetail = () => {
    const { t } = useTranslation();
    const { toast, confirmDialog } = useDialog();
    const translateCategory = (c) => {
        const k = CATEGORY_KEY_MAP[c];
        return k ? t(`beneficiary.categories.${k}`) : c;
    };
    const translateUrgency = (u) => {
        const k = URGENCY_KEY_MAP[u];
        return k ? t(`beneficiary.urgency.${k}`) : u;
    };
    const { id } = useParams();
    const navigate = useNavigate();
    const routerLocation = useLocation();
    const [donation, setDonation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const backendUrl = 'http://localhost:5000/uploads/';

    const backPath = routerLocation.state?.from || '/beneficiary/claim';
    const backLabel = backPath === '/beneficiary/history'
        ? t('beneficiary.backToMyClaims')
        : t('beneficiary.backToAvailableFood');

    useEffect(() => {
        fetchDonationDetail();
    }, [id]);

    const fetchDonationDetail = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/food/${id}`);
            setDonation(res.data);
        } catch (err) {
            console.error('Failed to fetch donation details:', err);
            const errorMsg = err.response?.data?.message || t('beneficiary.loadDonationFailed');
            const debugInfo = err.response?.data?.debug;

            if (debugInfo) {
                console.log('Backend Debug Info:', debugInfo);
            }
            toast.error(errorMsg);

            if (err.response?.status !== 403) {
                navigate(backPath);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async () => {
        const ok = await confirmDialog(t('beneficiary.confirmClaim'), { variant: 'danger' });
        if (!ok) return;

        try {
            const res = await api.post(`/food/${id}/claim`);
            toast.success(res.data.message);
            navigate('/beneficiary/history');
        } catch (err) {
            console.error("Claim error:", err);
            toast.error(err.response?.data?.message || t('beneficiary.claimFailed'));
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-white font-sans text-gray-800">
                <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-[#F9FAFB] min-h-screen`}>
                    <Navbar onMenuClick={() => setSidebarOpen(true)} />
                    <div className="flex items-center justify-center h-[80vh]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    </div>
                </main>
            </div>
        );
    }

    if (!donation) return null;

    const foodName = donation.food_type?.split(' - ')[0] || t('beneficiary.foodDonation');
    const foodDesc = donation.food_type?.split(' - ')[1] || donation.description || '';
    const addressDisplay = getPostAddressDisplay(donation);
    const pickupTimes = (donation.location || '').includes(' | ')
        ? (donation.location || '').split(' | ')[1]
        : '';

    const allItemImages = (donation.items || []).reduce((acc, item) => {
        if (item.images && item.images.length > 0) {
            return [...acc, ...item.images];
        }
        return acc;
    }, []);

    const images = (donation.images && donation.images.length > 0) ? donation.images : allItemImages;
    const hasImages = images.length > 0;

    const isExpired = donation.expiry_time && new Date(donation.expiry_time) < new Date();
    
    const getStatusStyles = () => {
        if (isExpired && donation.status === 'Available') return 'bg-gray-100 text-gray-500';
        if (donation.status === 'Available') return 'bg-green-100 text-green-700';
        if (donation.status === 'Pending Pickup') return 'bg-[#98E158] text-white';
        if (donation.status === 'Delivered') return 'bg-green-600 text-white';
        return 'bg-gray-100 text-gray-700';
    };

    const displayStatus = (isExpired && donation.status === 'Available')
        ? t('status.expired')
        : translateStatus(donation.status, t);

    const showDeliveryTracking = donation.delivery && donation.status !== 'Available';

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-white min-h-screen`}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <div className="p-4 md:p-6 max-w-7xl mx-auto">
                    <button
                        onClick={() => navigate(backPath)}
                        className="flex items-center gap-2 text-gray-500 hover:text-green-600 font-bold text-xs mb-8 transition-all group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        {backLabel.toUpperCase()}
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 space-y-8">
                            {hasImages && (
                                <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100">
                                    <div className="aspect-[21/9] bg-gray-50 rounded-[1.5rem] overflow-hidden mb-4 border border-gray-50">
                                        <img
                                            src={images[currentImageIndex].startsWith('http')
                                                ? images[currentImageIndex]
                                                : `${backendUrl}${images[currentImageIndex]}`}
                                            alt={foodName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {images.length > 1 && (
                                        <div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-thin scrollbar-thumb-gray-200">
                                            {images.map((img, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setCurrentImageIndex(i)}
                                                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === currentImageIndex ? 'border-green-500 scale-95' : 'border-transparent opacity-60 hover:opacity-100'
                                                        }`}
                                                >
                                                    <img
                                                        src={img.startsWith('http') ? img : `${backendUrl}${img}`}
                                                        alt={`${foodName} ${i + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            {donation.is_urgent && (
                                                <span className="px-3 py-1 bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 border border-red-100">
                                                    <AlertCircle size={12} />
                                                    {t('beneficiary.urgent')}
                                                </span>
                                            )}
                                            {donation.is_recurring && (
                                                <span className="px-3 py-1 bg-blue-50 text-blue-500 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 border border-blue-100">
                                                    <Repeat size={12} />
                                                    {t('beneficiary.recurring')}
                                                </span>
                                            )}
                                        </div>
                                        <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">{foodName}</h1>
                                        <p className="text-green-600 text-xs font-black uppercase tracking-widest mb-6">
                                            {t('beneficiary.donatedBy')} {donation.donor_name || t('beneficiary.communityPartner')}
                                        </p>
                                        {foodDesc && (
                                            <p className="text-gray-500 text-base font-medium leading-relaxed max-w-2xl italic border-l-4 border-green-50 pl-6 py-2">
                                                "{foodDesc}"
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gray-50/50 rounded-3xl p-6 mb-8 border border-gray-100">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5">{t('beneficiary.packageContents')}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(donation.items || [{ category: foodName, quantity: donation.quantity }]).map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-50 shadow-sm">
                                                <div className="p-2 bg-green-50 rounded-xl">
                                                    <Package size={18} className="text-green-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[8px] font-black text-green-600 uppercase tracking-tighter bg-green-50 px-1.5 py-0.5 rounded">
                                                            {translateCategory(item.category)}
                                                        </span>
                                                        <p className="text-sm font-bold text-gray-900">{item.name || t('beneficiary.item')}</p>
                                                        <p className="text-[11px] font-bold text-gray-400">({item.quantity})</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-2">
                                    {addressDisplay && addressDisplay !== 'Address not set' && (
                                        <div className="flex items-start gap-4">
                                            <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                                                <MapPin size={20} className="text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('beneficiary.pickupLocation')}</p>
                                                <p className="text-sm font-bold text-gray-800">{addressDisplay}</p>
                                            </div>
                                        </div>
                                    )}

                                    {pickupTimes && (
                                        <div className="flex items-start gap-4">
                                            <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100">
                                                <Clock size={20} className="text-purple-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('beneficiary.availableHours')}</p>
                                                <p className="text-sm font-bold text-gray-800">{pickupTimes}</p>
                                            </div>
                                        </div>
                                    )}

                                    {donation.expiry_time && (
                                        <div className="flex items-start gap-4">
                                            <div className="p-2.5 bg-orange-50 rounded-xl border border-orange-100">
                                                <Calendar size={20} className="text-orange-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('beneficiary.bestBefore')}</p>
                                                <p className={`text-sm font-bold ${isExpired ? 'text-red-500' : 'text-gray-800'}`}>
                                                    {new Date(donation.expiry_time).toLocaleString('en-US', {
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                    {isExpired && t('beneficiary.expiredSuffix')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 text-center">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">{t('beneficiary.availability')}</h3>
                                <div className={`inline-block px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-sm ${getStatusStyles()}`}>
                                    {displayStatus}
                                </div>
                                {isExpired && donation.status === 'Available' && (
                                    <p className="mt-4 text-[10px] font-bold text-red-400 uppercase tracking-widest leading-relaxed px-4">
                                        {t('beneficiary.expiryReached')}
                                    </p>
                                )}
                            </div>

                            {showDeliveryTracking && (
                                <DeliveryTrackingCard delivery={donation.delivery} showDropoff />
                            )}

                            {showDeliveryTracking && (
                                <EscalationActions
                                    role="Beneficiary"
                                    postId={id}
                                    delivery={donation.delivery}
                                    onUpdated={fetchDonationDetail}
                                />
                            )}

                            {donation.status === 'Available' && !isExpired && (
                                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 text-center">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">{t('beneficiary.reserveNow')}</h3>
                                    <button
                                        onClick={handleClaim}
                                        className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-green-600/20 active:scale-95"
                                    >
                                        <Navigation2 size={18} className="rotate-90" />
                                        {t('beneficiary.claimThisFood')}
                                    </button>
                                    <p className="mt-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                                        {t('beneficiary.secureForPickup')}
                                    </p>
                                </div>
                            )}

                            <div className="bg-green-900 rounded-[2rem] p-8 shadow-xl text-white">
                                <h3 className="text-[10px] font-black text-green-300 uppercase tracking-widest mb-4">{t('beneficiary.donationMission')}</h3>
                                <p className="text-sm font-medium leading-relaxed mb-6 text-green-50/80">
                                    {t('beneficiary.claimMissionText')}
                                </p>
                                <div className="flex items-center gap-2 text-green-300 font-black text-[10px] uppercase tracking-widest">
                                    <Utensils size={14} />
                                    {t('beneficiary.zeroHungerProject')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BeneficiaryDonationDetail;
