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

    const statusColors = {
        'Available': 'bg-green-100 text-green-700',
        'Active': 'bg-blue-100 text-blue-700',
        'Pending Pickup': 'bg-[#98E158] text-white',
        'Delivered': 'bg-purple-100 text-purple-700',
        'Cancelled': 'bg-red-100 text-red-700'
    };

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar />

            <main className="flex-1 ml-0 md:ml-64 bg-[#F9FAFB] min-h-screen">
                <Navbar />

                <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/donor/history')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-bold text-sm mb-6 transition-all group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Back to My Donations
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
                                        <div className="flex gap-2 overflow-x-auto pb-2">
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
                                        {foodDesc && (
                                            <p className="text-gray-600 text-sm font-medium">{foodDesc}</p>
                                        )}
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
                                    {!donation.is_recurring && location && (
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

                                    {!donation.is_recurring && pickupTimes && (
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

                                    {donation.is_recurring && (
                                        <>
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-indigo-100 rounded-lg">
                                                    <Repeat size={20} className="text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Frequency</p>
                                                    <p className="text-sm font-bold text-gray-900 mt-1">{donation.frequency || 'Weekly'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-pink-100 rounded-lg">
                                                    <Calendar size={20} className="text-pink-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Day</p>
                                                    <p className="text-sm font-bold text-gray-900 mt-1">{donation.day || 'Monday'}</p>
                                                </div>
                                            </div>

                                            {donation.destination && (
                                                <div className="flex items-start gap-3 md:col-span-2">
                                                    <div className="p-2 bg-teal-100 rounded-lg">
                                                        <MapPin size={20} className="text-teal-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Destination</p>
                                                        <p className="text-sm font-bold text-gray-900 mt-1">{donation.destination}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Status & Actions */}
                        <div className="space-y-6">
                            {/* Status Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Status</h3>
                                <div className={`px-4 py-3 rounded-xl font-bold text-sm ${statusColors[donation.status] || 'bg-gray-100 text-gray-700'}`}>
                                    {donation.status || 'Available'}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50 space-y-3">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Actions</h3>

                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition-all"
                                >
                                    <Edit2 size={18} />
                                    Edit Donation
                                </button>

                                <button
                                    onClick={handleDelete}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm rounded-xl transition-all"
                                >
                                    <Trash2 size={18} />
                                    Delete Donation
                                </button>
                            </div>

                            {/* Created Date */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Created</h3>
                                <p className="text-sm font-bold text-gray-700">
                                    {donation.created_at
                                        ? new Date(donation.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })
                                        : 'Recently'}
                                </p>
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
