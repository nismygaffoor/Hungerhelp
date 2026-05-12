import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    Edit2,
    Trash2,
    CheckCircle,
    XCircle
} from 'lucide-react';
import EditDonationModal from './EditDonationModal';

const DonationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [donation, setDonation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const backendUrl = 'http://localhost:5000/uploads/';

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
            alert('Failed to load donation details');
            navigate('/donor/history');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Delete this donation?")) return;
        try {
            await api.delete(`/food/${id}`);
            navigate('/donor/history');
        } catch (err) {
            alert("Failed to delete");
        }
    };

    const handleUpdate = () => {
        fetchDonationDetail();
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-white font-sans text-gray-800">
                <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'} bg-white min-h-screen`}>
                    <Navbar onMenuClick={() => setSidebarOpen(true)} />
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

    // Check if the donation has expired
    const isExpired = donation.expiry_time && new Date(donation.expiry_time) < new Date();
    
    // Recurring posts stored as 'Available' should display as 'Active'
    // If non-recurring and past expiry, display as 'Expired'
    let displayStatus = donation.status;
    if (isExpired && donation.status === 'Available') {
        displayStatus = 'Expired';
    } else if (donation.is_recurring && donation.status === 'Available') {
        displayStatus = 'Active';
    }

    const statusColors = {
        'Available': 'bg-green-100 text-green-700',
        'Active': 'bg-blue-100 text-blue-700',
        'Paused': 'bg-amber-100 text-amber-700',
        'Pending Pickup': 'bg-[#98E158] text-white',
        'Delivered': 'bg-purple-100 text-purple-700',
        'Cancelled': 'bg-red-100 text-red-700',
        'Expired': 'bg-gray-100 text-gray-500'
    };

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-white min-h-screen`}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <div className="p-4 md:p-6 max-w-7xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/donor/history')}
                        className="flex items-center gap-2 text-gray-500 hover:text-green-600 font-bold text-xs mb-8 transition-all group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        BACK TO HISTORY
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column - Images & Main Info */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Image Gallery */}
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
                                        <div className="flex gap-3 overflow-x-auto pb-2 px-1">
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

                            {/* Main Details Card */}
                            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            {donation.is_urgent && (
                                                <span className="px-3 py-1 bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 border border-red-100">
                                                    <AlertCircle size={12} />
                                                    Urgent
                                                </span>
                                            )}
                                            {donation.is_recurring && (
                                                <span className="px-3 py-1 bg-blue-50 text-blue-500 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 border border-blue-100">
                                                    <Repeat size={12} />
                                                    Recurring
                                                </span>
                                            )}
                                        </div>
                                        <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">{foodName}</h1>
                                        {foodDesc && (
                                            <p className="text-gray-500 text-base font-medium leading-relaxed max-w-2xl">{foodDesc}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Items Breakdown */}
                                <div className="bg-gray-50/50 rounded-3xl p-6 mb-8 border border-gray-100">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5">Package Contents</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(donation.items || [{ category: foodName, quantity: donation.quantity }]).map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-50 shadow-sm">
                                                <div className="p-2 bg-green-50 rounded-xl">
                                                    <Package size={18} className="text-green-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[8px] font-black text-green-600 uppercase tracking-tighter bg-green-50 px-1.5 py-0.5 rounded">
                                                            {item.category}
                                                        </span>
                                                        <p className="text-sm font-bold text-gray-900">{item.name || 'Item'}</p>
                                                        <p className="text-[11px] font-bold text-gray-400">({item.quantity})</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-2">
                                    {!donation.is_recurring && location && (
                                        <div className="flex items-start gap-4">
                                            <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                                                <MapPin size={20} className="text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pickup Location</p>
                                                <p className="text-sm font-bold text-gray-800">{location}</p>
                                            </div>
                                        </div>
                                    )}

                                    {!donation.is_recurring && pickupTimes && (
                                        <div className="flex items-start gap-4">
                                            <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100">
                                                <Clock size={20} className="text-purple-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Available Hours</p>
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
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Best Before</p>
                                                <p className="text-sm font-bold text-gray-800">
                                                    {new Date(donation.expiry_time).toLocaleString('en-US', {
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {donation.is_recurring && (
                                        <>
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-100">
                                                    <Repeat size={20} className="text-indigo-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Frequency</p>
                                                    <p className="text-sm font-bold text-gray-800">{donation.frequency || 'Weekly'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 bg-pink-50 rounded-xl border border-pink-100">
                                                    <Calendar size={20} className="text-pink-500" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Schedule</p>
                                                    <p className="text-sm font-bold text-gray-800">{donation.day || 'Monday'}s</p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Status & Actions */}
                        <div className="lg:col-span-4 space-y-8">
                            {/* Status Card */}
                            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 text-center">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Current Status</h3>
                                <div className={`inline-block px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-sm ${statusColors[displayStatus] || 'bg-gray-100 text-gray-700'}`}>
                                    {displayStatus || 'Available'}
                                </div>
                                <div className="mt-8 pt-8 border-t border-gray-50">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Posted On</h3>
                                    <p className="text-sm font-bold text-gray-700">
                                        {donation.created_at
                                            ? new Date(donation.created_at).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })
                                            : 'Recently'}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-4">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-green-600/20 active:scale-95"
                                >
                                    <Edit2 size={18} />
                                    Edit Details
                                </button>

                                <button
                                    onClick={handleDelete}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-white hover:bg-red-50 text-red-500 font-black text-xs uppercase tracking-widest rounded-2xl transition-all border border-red-50 active:scale-95"
                                >
                                    <Trash2 size={18} />
                                    Remove Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Edit Modal */}
            <EditDonationModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                item={donation}
                onUpdate={handleUpdate}
            />
        </div>
    );
};

export default DonationDetail;
