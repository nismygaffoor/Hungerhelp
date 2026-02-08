import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
    Search,
    Filter,
    MapPin,
    Clock,
    ChevronDown
} from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';

const ClaimFoods = () => {
    const { user } = useAuth();
    const [foodPosts, setFoodPosts] = useState([]);
    const [loading, setLoading] = useState(true);

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
        try {
            await api.post(`/food/${postId}/claim`);
            alert("Claimed successfully!");
            setFoodPosts(foodPosts.filter(p => p._id !== postId));
        } catch (err) {
            alert("Failed to claim food.");
        }
    };

    // Placeholder images for mockup fidelity
    const getPlaceholderImage = (type) => {
        if (type.toLowerCase().includes('veg')) return "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80";
        if (type.toLowerCase().includes('bread') || type.toLowerCase().includes('baked')) return "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80";
        return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";
    };

    return (
        <div className="flex min-h-screen bg-white font-sans">
            <Sidebar />

            <main className="flex-1 ml-0">
                <Navbar />
                <div className="flex-1 ml-0 md:ml-64 p-4 md:p-6 bg-[#F9FAFB]">
                    <header className="mb-6 text-left">
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">Available Food</h2>
                        <p className="text-gray-500 text-sm mt-1">Browse and claim fresh surplus food items near you.</p>
                    </header>

                    {/* Filters Row */}
                    <div className="flex flex-wrap items-center gap-4 mb-10">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold" size={18} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full bg-white border border-gray-100 rounded-xl pl-12 pr-4 py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
                            />
                        </div>

                        <FilterButton label="All" />
                        <FilterButton label="Distance" />
                        <FilterButton label="Food Type" />
                    </div>

                    {/* Food Grid */}
                    {loading ? (
                        <div className="flex justify-center p-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8 animate-fade-in mb-10">
                            {foodPosts.map((post) => (
                                <div key={post._id} className="bg-white rounded-3xl p-6 border border-red-50 relative group hover:shadow-xl transition-all duration-300">
                                    <div className="flex flex-col md:flex-row gap-8">
                                        {/* Small Image Carousel Mockup */}
                                        <div className="flex gap-4">
                                            <img src={getPlaceholderImage(post.food_type)} className="w-24 h-24 rounded-2xl object-cover shadow-sm border border-gray-50" alt="Food" />
                                            <img src={getPlaceholderImage(post.food_type)} className="w-24 h-24 rounded-2xl object-cover shadow-sm border border-gray-50 opacity-80" alt="Food" />
                                            <img src={getPlaceholderImage(post.food_type)} className="w-24 h-24 rounded-2xl object-cover shadow-sm border border-gray-50 opacity-60" alt="Food" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-800">{post.food_type.split('-')[0]}</h4>
                                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{post.quantity}</p>
                                                </div>
                                                {post.is_urgent && (
                                                    <span className="bg-[#EF5350] text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-sm">Urgent</span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-600 font-medium text-xs pt-4">
                                                <MapPin size={14} className="text-gray-400" />
                                                <span>{post.location.split('|')[0]} (2.5 km away)</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-500 font-medium text-xs italic">
                                                <Clock size={14} className="text-gray-300" />
                                                <span>Expires in 4 hours</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex md:flex-col justify-end gap-3 min-w-[140px]">
                                            <button className="px-6 py-2.5 rounded-lg font-bold text-gray-400 border border-gray-100 bg-gray-50/50 hover:bg-gray-100 transition-all text-xs">View Details</button>
                                            <button
                                                onClick={() => handleClaim(post._id)}
                                                className="px-6 py-2.5 rounded-lg font-bold text-white bg-[#66BB6A] hover:bg-[#43A047] shadow-[0_4px_14px_rgba(102,187,106,0.39)] transition-all transform active:scale-95 text-xs"
                                            >
                                                Claim Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const FilterButton = ({ label }) => (
    <button className="flex items-center gap-3 px-6 py-3.5 bg-white border border-gray-100 rounded-xl text-sm font-semibold text-gray-500 hover:text-green-600 hover:border-green-100 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        {label}
        <ChevronDown size={16} className="text-gray-300" />
    </button>
);

export default ClaimFoods;
