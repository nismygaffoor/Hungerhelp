import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    User,
    UtensilsCrossed,
    ListChecks,
    MessageSquare,
    Bell,
    Search,
    MapPin,
    Clock
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';

const BeneficiaryDashboard = () => {
    const { user } = useAuth();
    const [availableFood, setAvailableFood] = useState([]);
    const [activeTab, setActiveTab] = useState('claim'); // Default tab

    useEffect(() => {
        fetchFood();
    }, []);

    const fetchFood = async () => {
        try {
            const res = await api.get('/food/');
            setAvailableFood(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleClaim = async (id) => {
        if (!confirm("Claim this food? A volunteer will be notified.")) return;
        try {
            await api.post(`/food/${id}/claim`);
            alert("Food claimed successfully!");
            fetchFood(); // Refresh
        } catch (err) {
            alert("Failed to claim: " + (err.response?.data?.error || err.message));
        }
    };

    // Sidebar Items
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'profile', label: 'Your Profile', icon: <User size={20} /> },
        { id: 'claim', label: 'Claim Foods', icon: <UtensilsCrossed size={20} /> },
        { id: 'myclaims', label: 'My claims', icon: <ListChecks size={20} /> },
        { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={20} /> },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">

            {/* Reuse Sidebar */}
            <Sidebar menuItems={menuItems} activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content */}
            <main className="flex-1 ml-0 md:ml-64 p-8">

                {/* Top Navbar */}
                <header className="flex justify-between items-center mb-10">
                    <div className="md:hidden">
                        {/* Mobile Menu Toggle Placeholder */}
                        <span className="text-green-600 font-bold text-xl">HungerHelp</span>
                    </div>
                    {/* Breadcrumbs or Title could go here on left */}
                    <div className="hidden md:block"></div>

                    <div className="flex items-center gap-6">
                        <div className="relative cursor-pointer">
                            <Bell className="text-gray-500 hover:text-green-600" size={24} />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full wi-4 h-4 flex items-center justify-center px-1">6</span>
                        </div>

                        <div className="flex items-center gap-2 cursor-pointer">
                            <span className="text-sm font-medium">English</span>
                        </div>

                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                            {/* Placeholder Avatar */}
                            <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </header>

                {/* Dynamic Content Based on Tab */}
                {activeTab === 'claim' && (
                    <div className="animate-fade-in">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Available Food</h2>

                            {/* Filters Bar */}
                            <div className="flex flex-col md:flex-row gap-4 justify-between">
                                <div className="flex gap-4 overflow-x-auto pb-2">
                                    <select className="border border-gray-300 rounded px-4 py-2 bg-white text-gray-600 text-sm focus:outline-none focus:border-green-500">
                                        <option>All</option>
                                    </select>
                                    <select className="border border-gray-300 rounded px-4 py-2 bg-white text-gray-600 text-sm focus:outline-none focus:border-green-500">
                                        <option>Distance</option>
                                        <option>Nearest First</option>
                                    </select>
                                    <select className="border border-gray-300 rounded px-4 py-2 bg-white text-gray-600 text-sm focus:outline-none focus:border-green-500">
                                        <option>Food Type</option>
                                        <option>Veg</option>
                                        <option>Non-Veg</option>
                                    </select>
                                </div>

                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-green-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Food Cards Grid */}
                        {availableFood.length === 0 ? <div className="text-center py-20 text-gray-500">No food available at the moment. Check back later!</div> : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {availableFood.map((post, index) => (
                                    <div key={post._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition p-4 flex flex-col sm:flex-row gap-4 relative">

                                        {/* Image */}
                                        <div className="w-full sm:w-40 h-40 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative group">
                                            {/* Random Food Image from Unsplash based on index/id */}
                                            <img
                                                src={`https://source.unsplash.com/random/200x200/?food,meal&sig=${index}`}
                                                // Fallback to placebo if unsplash source is slow or blocked, but source.unsplash is usually okay for prototypes.
                                                // Using a more reliable random image service or static array is safer.
                                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80' }}
                                                alt={post.food_type}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{post.food_type}</h3>
                                                        <p className="text-sm text-gray-500">{post.quantity} Servings</p>
                                                    </div>
                                                    {index % 2 === 0 && ( // Fake "Urgent" badge for demo
                                                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Urgent</span>
                                                    )}
                                                </div>

                                                <div className="space-y-1 mt-2">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <MapPin size={16} className="text-gray-400" />
                                                        <span>{post.location} (2.5 km away)</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Clock size={16} className="text-gray-400" />
                                                        <span>Expires: {post.expiry_time ? new Date(post.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Soon'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3 mt-4 sm:mt-0 justify-end items-end">
                                                <button className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition">View Details</button>
                                                <button
                                                    onClick={() => handleClaim(post._id)}
                                                    className="px-6 py-2 rounded-lg bg-green-600 text-white text-sm font-bold shadow-sm hover:bg-green-700 transition"
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
                )}

                {activeTab === 'dashboard' && <div className="text-gray-500 p-10 text-center">Dashboard Overview Placeholder</div>}
                {activeTab === 'profile' && <div className="text-gray-500 p-10 text-center">User Profile Placeholder</div>}
                {activeTab === 'myclaims' && <div className="text-gray-500 p-10 text-center">My Claims History Placeholder</div>}
                {activeTab === 'feedback' && <div className="text-gray-500 p-10 text-center">Feedback Form Placeholder</div>}

            </main>
        </div>
    );
};

export default BeneficiaryDashboard;
