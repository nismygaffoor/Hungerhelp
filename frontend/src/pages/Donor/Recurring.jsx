import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import { Plus, Edit2, Pause, Play, Trash2, X, Camera, Loader2, ArrowRight } from 'lucide-react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const Recurring = () => {
    const [recurringItems, setRecurringItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const backendUrl = 'http://localhost:5000/uploads/';
    const navigate = useNavigate();

    useEffect(() => {
        fetchRecurring();
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

        const today = new Date().getDay(); // 0-6

        return activeItems.reduce((next, current) => {
            const currentDayStr = current.day.toLowerCase();
            const nextDayStr = next.day.toLowerCase();

            // Handle "Everyday" special case
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
            alert("Failed to update status");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Remove this recurring donation?")) return;
        try {
            await api.delete(`/food/${id}`);
            fetchRecurring();
        } catch (err) {
            alert("Failed to delete");
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F9FAFB] font-sans">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64">
                <Navbar />
                <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">
                    <header className="mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">Manage Recurring Donations</h1>
                        <h2 className="text-lg font-bold text-gray-800 mt-6 mb-4">Recurring Donations</h2>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Main Content: Recurring Items List */}
                        <div className="lg:col-span-12 xl:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center p-20 gap-4">
                                    <Loader2 className="animate-spin text-green-600" size={32} />
                                    <p className="text-gray-400 font-bold">Connecting to impact...</p>
                                </div>
                            ) : recurringItems.length === 0 ? (
                                <div className="p-20 text-center flex flex-col items-center">
                                    <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                                        <Plus size={48} className="text-gray-200" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">No recurring donations</h3>
                                    <p className="text-gray-400 font-medium max-w-xs mx-auto">Set up your first automated donation to create lasting impact.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {recurringItems.map((item) => (
                                        <div key={item._id} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 hover:bg-gray-50/50 rounded-2xl transition-all group">
                                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 bg-gray-100">
                                                    <img
                                                        src={item.images && item.images.length > 0
                                                            ? `${backendUrl}${item.images[0]}`
                                                            : 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=100&h=100&fit=crop'}
                                                        alt={item.food_type}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="text-base font-bold text-gray-800 leading-tight mb-1">{item.food_type}</h3>
                                                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-tight">
                                                        <p>On {item.day}</p>
                                                        <p>{item.quantity} {item.frequency}</p>
                                                        <p className="text-gray-400 font-medium">{item.destination}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full mr-2 ${item.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                                <button
                                                    onClick={() => handleToggleStatus(item)}
                                                    className={`p-2 rounded-full transition-all ${item.status === 'Active' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                        }`}
                                                >
                                                    {item.status === 'Active' ? <Pause size={16} /> : <Play size={16} />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="p-2 bg-red-50 text-red-400 hover:text-red-600 rounded-full transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Sidebar: Quick Actions & Details */}
                        <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                            {/* Quick Actions Card */}
                            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
                                <button
                                    onClick={() => navigate('/donor/post')}
                                    className="w-full py-4 px-6 bg-[#76B56E] hover:bg-[#65a35e] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-base text-center"
                                >
                                    Create New Donation <ArrowRight size={18} />
                                </button>
                            </div>

                            {/* Upcoming Donation Detail Card */}
                            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">Upcoming Donation</h3>

                                {nextDonation ? (
                                    <div className="space-y-10">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 bg-gray-50">
                                                <img
                                                    src={nextDonation.images && nextDonation.images.length > 0
                                                        ? `${backendUrl}${nextDonation.images[0]}`
                                                        : "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=100&h=100&fit=crop"}
                                                    alt="Food"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-400/80 leading-relaxed line-clamp-1">
                                                    Food Type: <span className="text-gray-700">{nextDonation.food_type}</span>
                                                </p>
                                                <p className="text-sm font-bold text-gray-400/80">{nextDonation.quantity} {nextDonation.frequency}</p>
                                                <p className="text-sm font-bold text-gray-400/50">{nextDonation.destination}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-gray-50">
                                            <div>
                                                <p className="text-gray-900 font-bold text-base leading-tight">Pickup Day <span className="text-[#76B56E] font-extrabold ml-1">{nextDonation.day}</span></p>
                                                <p className="text-gray-300 font-bold text-xs tracking-tight mt-2 uppercase">Recommended Slot: <span className="font-medium text-gray-400 px-1">9AM - 11AM</span></p>
                                            </div>

                                            <div className="flex gap-4 pt-4">
                                                <button
                                                    onClick={() => handleToggleStatus(nextDonation)}
                                                    className="flex-1 py-3 bg-[#E5E7EB] hover:bg-gray-300 text-gray-500 text-sm font-bold rounded-2xl transition-all"
                                                >
                                                    Pause
                                                </button>
                                                <button
                                                    onClick={() => navigate('/donor/post')}
                                                    className="flex-1 py-3 bg-[#76B56E] hover:bg-[#65a35e] text-white text-sm font-bold rounded-2xl transition-all shadow-sm"
                                                >
                                                    Manage
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-10 text-center">
                                        <p className="text-gray-400 font-bold text-sm">No active upcoming donations.</p>
                                        <p className="text-gray-300 text-[10px] mt-2 italic px-4">Activate a recurring item to see the next schedule here.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Recurring;
