import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
    Search,
    MapPin,
    Clock,
    ChevronDown,
    Utensils
} from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';

const ClaimFoods = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [foodPosts, setFoodPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const backendUrl = 'http://localhost:5000/uploads/';

    useEffect(() => {
        const fetchFood = async () => {
            try {
                const res = await api.get('/food/');
                setFoodPosts(res.data.filter(p => p.status === 'Available'));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFood();
    }, []);

    const handleClaim = async (postId) => {
        if (!confirm("Are you sure you want to claim this food?")) return;

        try {
            const res = await api.post(`/food/${postId}/claim`);
            alert(res.data.message);
            // Remove claimed item from list
            setFoodPosts(foodPosts.filter(p => p._id !== postId));
        } catch (err) {
            console.error("Claim error:", err);
            alert(err.response?.data?.message || "Failed to claim food");
        }
    };

    // Placeholder images for mockup fidelity (if real images are missing)
    // Placeholder images for mockup fidelity (if real images are missing)
    const getPlaceholderImage = (type) => {
        return null; // Return null to trigger the icon placeholder
    };

    return (
        <div className="flex min-h-screen bg-white font-sans">
            <Sidebar />

            <main className="flex-1 ml-0 md:ml-64 bg-[#F9FAFB] min-h-screen">
                <Navbar />

                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    <header className="mb-8 text-left">
                        <h2 className="text-3xl font-bold text-gray-900 leading-tight">Available Food</h2>
                    </header>

                    {/* Filters Row */}
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                        <FilterButton label="All" />
                        <FilterButton label="Distance" />
                        <FilterButton label="Food Type" />

                        <div className="relative flex-1 max-w-md ml-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search"
                                className="w-full bg-white border border-gray-100 rounded-lg pl-12 pr-4 py-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus:ring-2 focus:ring-green-500/20 focus:outline-none text-sm placeholder-gray-400"
                            />
                        </div>
                    </div>

                    {/* Food Grid */}
                    {loading ? (
                        <div className="flex justify-center p-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        </div>
                    ) : foodPosts.length === 0 ? (
                        <div className="text-center p-20">
                            <p className="text-gray-400 font-medium">No available food at the moment</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {foodPosts.map((post) => {
                                const items = post.items || [];
                                const fallbackFoodName = post.food_type?.split(' - ')[0] || 'Food Donation';
                                const fallbackServings = post.quantity || 'Multiple servings';

                                return (
                                    <div key={post._id} className="bg-white rounded-xl p-5 border border-red-100 shadow-sm relative hover:shadow-md transition-all">
                                        <div className="flex flex-col h-full justify-between">
                                            <div className="flex flex-row gap-6 mb-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
                                                {/* Food Items Row */}
                                                {items.length > 0 ? items.map((item, i) => {
                                                    const itemImg = item.images && item.images.length > 0
                                                        ? (item.images[0].startsWith('http') ? item.images[0] : `${backendUrl}${item.images[0]}`)
                                                        : null;

                                                    return (
                                                        <div key={i} className="flex flex-col w-32 shrink-0">
                                                            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-2 flex items-center justify-center border border-gray-50">
                                                                {itemImg ? (
                                                                    <img
                                                                        src={itemImg}
                                                                        className="w-full h-full object-cover"
                                                                        alt={item.category}
                                                                    />
                                                                ) : (
                                                                    <Utensils className="text-gray-300" size={24} />
                                                                )}
                                                            </div>
                                                            <h4 className="text-xs font-bold text-gray-700 truncate">{item.category}</h4>
                                                            <p className="text-[10px] text-gray-500 font-medium mt-0.5">{item.quantity}</p>
                                                        </div>
                                                    );
                                                }) : (
                                                    /* Fallback for legacy posts without items array */
                                                    <div className="flex flex-col w-32 shrink-0">
                                                        <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-2 flex items-center justify-center border border-gray-50">
                                                            <Utensils className="text-gray-300" size={24} />
                                                        </div>
                                                        <h4 className="text-xs font-bold text-gray-700 truncate">{fallbackFoodName}</h4>
                                                        <p className="text-[10px] text-gray-500 font-medium mt-0.5">{fallbackServings}</p>
                                                    </div>
                                                )}

                                                {/* Urgent Badge (Absolute Top Right) */}
                                                {post.is_urgent && (
                                                    <div className="ml-auto sticky right-0">
                                                        <span className="bg-[#EF5350] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">Urgent</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Bottom Section: Location & Actions */}
                                            <div className="flex justify-between items-end mt-2">
                                                <div className="space-y-1">
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                                        Donated by <span className="text-gray-700">{post.donor_name || "Unknown Donor"}</span>
                                                    </div>
                                                    <div className="text-sm font-semibold text-gray-800">
                                                        {post.location?.split('|')[0] || 'Colombo 03'}
                                                    </div>
                                                    <div className="text-sm text-gray-600 font-medium">
                                                        {post.expiry_time ? (() => {
                                                            const diff = new Date(post.expiry_time) - new Date();
                                                            const hours = Math.floor(diff / (1000 * 60 * 60));
                                                            const days = Math.floor(hours / 24);
                                                            if (diff < 0) return "Expired";
                                                            if (days > 0) return `Expires in ${days} day${days > 1 ? 's' : ''}`;
                                                            if (hours > 0) return `Expires in ${hours} hour${hours > 1 ? 's' : ''}`;
                                                            return "Expires soon";
                                                        })() : "No expiry set"}
                                                    </div>
                                                </div>

                                                <div className="flex items-end gap-3">
                                                    <button
                                                        onClick={() => navigate(`/beneficiary/donation/${post._id}`, { state: { from: '/beneficiary/claim' } })}
                                                        className="px-5 py-2 rounded-full font-bold text-gray-600 bg-[#C4C4C4] hover:bg-gray-400 transition-all text-[11px] min-w-[100px]"
                                                    >
                                                        View Details
                                                    </button>
                                                    <button
                                                        onClick={() => handleClaim(post._id)}
                                                        className="px-5 py-2 rounded-full font-bold text-white bg-[#66BB6A] hover:bg-[#57A05B] shadow-sm transition-all text-[11px] min-w-[100px]"
                                                    >
                                                        Claim Now
                                                    </button>
                                                </div>
                                            </div>
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

const FilterButton = ({ label }) => (
    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded min-w-[100px] justify-between text-xs font-semibold text-gray-400 hover:text-green-600 hover:border-green-200 transition-all shadow-sm">
        {label}
        <ChevronDown size={14} className="text-gray-300" />
    </button>
);

export default ClaimFoods;
