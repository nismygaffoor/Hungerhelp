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
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
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

    const filteredPosts = foodPosts.filter(post => {
        const matchesSearch = searchTerm === '' || 
            (post.food_type?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (post.items?.some(item => 
                item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                item.category?.toLowerCase().includes(searchTerm.toLowerCase())
            ));
        
        const matchesType = filterType === 'All' || 
            (post.items?.some(item => item.category === filterType)) ||
            (post.food_type?.split(' - ')[0] === filterType);

        return matchesSearch && matchesType;
    });

    const handleClaim = async (postId) => {
        if (!confirm("Are you sure you want to claim this food?")) return;

        try {
            const res = await api.post(`/food/${postId}/claim`);
            alert(res.data.message);
            setFoodPosts(foodPosts.filter(p => p._id !== postId));
        } catch (err) {
            console.error("Claim error:", err);
            alert(err.response?.data?.message || "Failed to claim food");
        }
    };

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-white min-h-screen`}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">
                    <header className="mb-8 text-left">
                        <h2 className="text-3xl font-bold text-gray-900 leading-tight">Available Food</h2>
                        <p className="text-gray-500 text-sm font-medium mt-1">Find and claim fresh food donations near you</p>
                    </header>

                    {/* Filters Row */}
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setFilterType('All')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterType === 'All' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                            >
                                All
                            </button>
                            
                            <div className="relative">
                                <select 
                                    className={`appearance-none pl-4 pr-10 py-2 rounded-lg text-xs font-bold bg-white border outline-none transition-all cursor-pointer ${filterType !== 'All' ? 'border-green-600 text-green-600' : 'border-gray-100 text-gray-400'}`}
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                >
                                    <option value="All">Food Type</option>
                                    <option value="Vegetables">Vegetables</option>
                                    <option value="Fruits">Fruits</option>
                                    <option value="Cooked Meals">Cooked Meals</option>
                                    <option value="Baked Goods">Baked Goods</option>
                                    <option value="Grains & Rice">Grains & Rice</option>
                                    <option value="Dairy">Dairy</option>
                                    <option value="Meat & Poultry">Meat & Poultry</option>
                                    <option value="Canned Food">Canned Food</option>
                                    <option value="Beverages">Beverages</option>
                                    <option value="Other">Other</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300" size={14} />
                            </div>
                        </div>

                        <div className="relative flex-1 max-w-md ml-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search food, items or donor..."
                                className="w-full bg-white border border-gray-100 rounded-xl pl-12 pr-4 py-2.5 shadow-sm focus:ring-2 focus:ring-green-500/20 focus:outline-none text-sm placeholder-gray-400 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Food Grid */}
                    {loading ? (
                        <div className="flex justify-center p-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        </div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="text-center p-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <Utensils className="mx-auto text-gray-200 mb-4" size={48} />
                            <p className="text-gray-400 font-bold">No food matches your search</p>
                            <button onClick={() => {setSearchTerm(''); setFilterType('All');}} className="mt-4 text-green-600 font-bold text-sm hover:underline">Clear all filters</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {filteredPosts.map((post) => {
                                const items = post.items || [];
                                const fallbackFoodName = post.food_type?.split(' - ')[0] || 'Food Donation';
                                const fallbackServings = post.quantity || 'Multiple servings';

                                return (
                                    <div key={post._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative hover:shadow-md transition-all group">
                                        <div className="flex flex-col h-full justify-between">
                                            <div className="flex flex-row gap-6 mb-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-200">
                                                {/* Food Items Row */}
                                                {items.length > 0 ? items.map((item, i) => {
                                                    const itemImg = item.images && item.images.length > 0
                                                        ? (item.images[0].startsWith('http') ? item.images[0] : `${backendUrl}${item.images[0]}`)
                                                        : null;

                                                    return (
                                                        <div key={i} className="flex flex-col w-32 shrink-0">
                                                            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3 flex items-center justify-center border border-gray-100 group-hover:border-green-100 transition-colors">
                                                                {itemImg ? (
                                                                    <img src={itemImg} className="w-full h-full object-cover" alt={item.category} />
                                                                ) : (
                                                                    <Utensils className="text-gray-200" size={24} />
                                                                )}
                                                            </div>
                                                            <span className="text-[9px] font-black text-green-600 uppercase tracking-tighter bg-green-50 px-1.5 py-0.5 rounded w-fit mb-1">
                                                                {item.category}
                                                            </span>
                                                            <h4 className="text-xs font-bold text-gray-800 truncate">{item.name || 'Food Item'}</h4>
                                                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">{item.quantity}</p>
                                                        </div>
                                                    );
                                                }) : (
                                                    <div className="flex flex-col w-32 shrink-0">
                                                        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3 flex items-center justify-center border border-gray-100">
                                                            <Utensils className="text-gray-200" size={24} />
                                                        </div>
                                                        <h4 className="text-xs font-bold text-gray-800 truncate">{fallbackFoodName}</h4>
                                                        <p className="text-[10px] text-gray-500 font-medium mt-0.5">{fallbackServings}</p>
                                                    </div>
                                                )}

                                                {post.is_urgent && (
                                                    <div className="ml-auto sticky right-0">
                                                        <span className="bg-red-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-red-500/20 uppercase tracking-widest">Urgent</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-t border-gray-50 pt-6">
                                                <div className="space-y-2">
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        Donated by <span className="text-green-600">{post.donor_name || "Community Partner"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <MapPin size={16} className="text-gray-400" />
                                                        <span className="text-sm font-bold">{post.location?.split('|')[0] || 'Available Locally'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={16} className="text-gray-400" />
                                                        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                                                            {post.expiry_time ? (() => {
                                                                const diff = new Date(post.expiry_time) - new Date();
                                                                const hours = Math.floor(diff / (1000 * 60 * 60));
                                                                const days = Math.floor(hours / 24);
                                                                if (diff < 0) return "Expired";
                                                                if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
                                                                if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
                                                                return "Expires soon";
                                                            })() : "No expiry set"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 w-full md:w-auto">
                                                    <button
                                                        onClick={() => navigate(`/beneficiary/donation/${post._id}`, { state: { from: '/beneficiary/claim' } })}
                                                        className="flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all text-xs"
                                                    >
                                                        Details
                                                    </button>
                                                    {(() => {
                                                        const isExpired = post.expiry_time && new Date(post.expiry_time) < new Date();
                                                        return (
                                                            <button
                                                                onClick={() => !isExpired && handleClaim(post._id)}
                                                                disabled={isExpired}
                                                                className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-green-600/10 transition-all text-xs ${
                                                                    isExpired 
                                                                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                                                                        : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105 active:scale-95'
                                                                }`}
                                                            >
                                                                {isExpired ? 'Expired' : 'Claim Now'}
                                                            </button>
                                                        );
                                                    })()}
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

export default ClaimFoods;
