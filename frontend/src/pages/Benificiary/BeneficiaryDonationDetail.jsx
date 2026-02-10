import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
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

const BeneficiaryDonationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const routerLocation = useLocation();
    const [donation, setDonation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const backendUrl = 'http://localhost:5000/uploads/';

    // Determine back link based on state or default to /beneficiary/claim
    const backPath = routerLocation.state?.from || '/beneficiary/claim';
    const backLabel = backPath === '/beneficiary/history' ? 'Back to My Claims' : 'Back to Available Food';

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
            const errorMsg = err.response?.data?.message || 'Failed to load donation details';
            const debugInfo = err.response?.data?.debug;

            if (debugInfo) {
                console.log('Backend Debug Info:', debugInfo);
                alert(`${errorMsg}\n\nDebug: ${JSON.stringify(debugInfo)}`);
            } else {
                alert(errorMsg);
            }

            if (err.response?.status !== 403) {
                navigate(backPath);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async () => {
        if (!confirm("Are you sure you want to claim this food?")) return;

        try {
            const res = await api.post(`/food/${id}/claim`);
            alert(res.data.message);
            navigate('/beneficiary/history');
        } catch (err) {
            console.error("Claim error:", err);
            alert(err.response?.data?.message || "Failed to claim food");
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-white font-sans text-gray-800">
                <Sidebar />
                <main className="flex-1 ml-0 md:ml-64 bg-[#F9FAFB] min-h-screen">
                    <Navbar />
                    <div className="flex items-center justify-center h-[80vh]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    </div>
                </main>
            </div>
        );
    }

    if (!donation) return null;

    const foodName = donation.food_type?.split(' - ')[0] || 'Food Donation';
    const foodDesc = donation.food_type?.split(' - ')[1] || donation.description || '';
    const [location, pickupTimes] = (donation.location || '').split(' | ');

    // Collect all images from items
    const allItemImages = (donation.items || []).reduce((acc, item) => {
        if (item.images && item.images.length > 0) {
            return [...acc, ...item.images];
        }
        return acc;
    }, []);

    const images = (donation.images && donation.images.length > 0) ? donation.images : allItemImages;
    const hasImages = images.length > 0;

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar />

            <main className="flex-1 ml-0 md:ml-64 bg-[#F9FAFB] min-h-screen">
                <Navbar />

                <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(backPath)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-bold text-sm mb-6 transition-all group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        {backLabel}
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Images & Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Image Gallery */}
                            {hasImages && (
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
                                    <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-4">
                                        <img
                                            src={images[currentImageIndex].startsWith('http')
                                                ? images[currentImageIndex]
                                                : `${backendUrl}${images[currentImageIndex]}`}
                                            alt={foodName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {images.length > 1 && (
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
                                            {images.map((img, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setCurrentImageIndex(i)}
                                                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${i === currentImageIndex ? 'border-green-500' : 'border-transparent'
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

                            {/* Main Details Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex-1">
                                        <h1 className="text-2xl font-black text-gray-900 mb-2">{foodName}</h1>
                                        <div className="flex items-center gap-2 text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">
                                            <span>Donated by {donation.donor_name || "Unknown Donor"}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {donation.is_urgent && (
                                            <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-1">
                                                <AlertCircle size={14} />
                                                Urgent
                                            </span>
                                        )}
                                        {donation.is_recurring && (
                                            <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-1">
                                                <Repeat size={14} />
                                                Recurring
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {foodDesc && (
                                    <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 italic text-gray-600 text-sm">
                                        "{foodDesc}"
                                    </div>
                                )}

                                {/* Items Breakdown */}
                                <div className="border-t border-b border-gray-100 py-6 mb-6">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Donated Items</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(donation.items || [{ category: foodName, quantity: donation.quantity }]).map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                                    <Package size={18} className="text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{item.category}</p>
                                                    <p className="text-xs font-medium text-gray-500">{item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {location && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <MapPin size={20} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</p>
                                                <p className="text-sm font-bold text-gray-900 mt-1">{location}</p>
                                            </div>
                                        </div>
                                    )}

                                    {pickupTimes && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <Clock size={20} className="text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pickup Times</p>
                                                <p className="text-sm font-bold text-gray-900 mt-1">{pickupTimes}</p>
                                            </div>
                                        </div>
                                    )}

                                    {donation.expiry_time && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-orange-100 rounded-lg">
                                                <Calendar size={20} className="text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Expiry Time</p>
                                                <p className="text-sm font-bold text-gray-900 mt-1">
                                                    {new Date(donation.expiry_time).toLocaleString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Status & Actions */}
                        <div className="space-y-6">
                            {/* Status Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Status</h3>
                                <div className={`px-4 py-3 rounded-xl font-bold text-sm text-center ${donation.status === 'Available' ? 'bg-green-100 text-green-700' :
                                        donation.status === 'Pending Pickup' ? 'bg-[#98E158] text-white' :
                                            donation.status === 'Delivered' ? 'bg-green-600 text-white' :
                                                'bg-gray-100 text-gray-700'
                                    }`}>
                                    {donation.status}
                                </div>
                            </div>

                            {/* Action Button */}
                            {donation.status === 'Available' && (
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Ready to help?</h3>
                                    <button
                                        onClick={handleClaim}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-base rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95"
                                    >
                                        <Navigation2 size={20} className="rotate-90" />
                                        Claim Now
                                    </button>
                                    {/* <p className="text-[10px] text-center text-gray-400 mt-4 px-2 italic">
                                        By claiming, you commit to picking up this donation at the specified location and time.
                                    </p> */}
                                </div>
                            )}

                            {/* Help Card */}
                            <div className="bg-green-900 rounded-2xl p-6 shadow-lg text-white">
                                <h3 className="text-xs font-black text-green-300 uppercase tracking-widest mb-3">Donor Info</h3>
                                <p className="text-sm leading-relaxed mb-4">
                                    This donation is provided by <strong>{donation.donor_name}</strong>.
                                    {/* Please ensure you have transport ready before claiming. */}
                                </p>
                                <div className="flex items-center gap-2 text-green-300 font-bold text-[10px] uppercase tracking-wider">
                                    <Utensils size={14} />
                                    Fighting Food Waste
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
