import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
    Trash2,
    List,
    ChevronDown,
    Search
} from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';

const MyDonations = () => {
    const { user } = useAuth();
    const [myPosts, setMyPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const backendUrl = 'http://localhost:5000/uploads/';

    useEffect(() => {
        fetchMyPosts();
    }, []);

    const fetchMyPosts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/food/my-posts');
            setMyPosts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this donation?")) return;
        try {
            await api.delete(`/food/${id}`);
            fetchMyPosts();
        } catch (err) {
            alert("Failed to delete");
        }
    };

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar />

            <main className="flex-1 ml-0 md:ml-64 bg-[#F9FAFB] min-h-screen">
                <Navbar />

                <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="flex justify-between items-end mb-6 mt-2 px-2">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 leading-tight">My Donations</h2>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1 opacity-60">Impact & History Tracking</p>
                        </div>
                    </div>

                    {/* Filter Controls */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8 px-2">
                        <div className="flex gap-4">
                            <div className="relative group min-w-[140px]">
                                <select className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm appearance-none cursor-pointer focus:ring-2 focus:ring-green-500/20 transition-all outline-none">
                                    <option>All Status</option>
                                    <option>Available</option>
                                    <option>Pending</option>
                                    <option>Delivered</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                            <div className="relative group min-w-[140px]">
                                <select className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm appearance-none cursor-pointer focus:ring-2 focus:ring-green-500/20 transition-all outline-none">
                                    <option>Food Type</option>
                                    <option>Vegetables</option>
                                    <option>Baked Goods</option>
                                    <option>Canned Food</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by item name or location..."
                                className="w-full bg-white border border-gray-100 rounded-xl pl-12 pr-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-green-500/20 outline-none transition-all placeholder:text-gray-300"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        {loading ? (
                            <div className="flex items-center justify-center p-20 bg-white rounded-[2.5rem] shadow-sm border border-white">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                            </div>
                        ) : myPosts.length === 0 ? (
                            <div className="p-20 text-center flex flex-col items-center bg-white rounded-[2.5rem] shadow-sm border border-white">
                                <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                                    <Search size={48} className="text-gray-200" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">No donations found</h3>
                                <p className="text-gray-400 font-medium max-w-xs mx-auto">You haven't posted any donations yet. Your impact history will appear here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {myPosts.map(post => (
                                    <DonationCard
                                        key={post._id}
                                        post={post}
                                        onDelete={() => handleDelete(post._id)}
                                        backendUrl={backendUrl}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

const DonationCard = ({ post, onDelete, backendUrl }) => {
    // Generate placeholder images if fewer than 4 are provided
    const displayImages = [...(post.images || [])];
    while (displayImages.length < 4) {
        displayImages.push('https://images.unsplash.com/photo-1488459711635-de89ea219d53?w=200&h=200&fit=crop');
    }

    return (
        <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col lg:flex-row items-center gap-6 group">
            {/* 4-Image Grid Thumbnail */}
            <div className="w-full lg:w-40 aspect-square rounded-2xl overflow-hidden grid grid-cols-2 gap-0.5 shadow-md group-hover:scale-105 transition-transform duration-500 flex-shrink-0">
                {displayImages.slice(0, 4).map((img, i) => (
                    <img
                        key={i}
                        src={img.startsWith('http') ? img : `${backendUrl}${img}`}
                        alt="food"
                        className="w-full h-full object-cover"
                    />
                ))}
            </div>

            {/* Content Details */}
            <div className="flex-1 text-center lg:text-left space-y-1">
                <h4 className="text-lg font-black text-gray-900 leading-tight group-hover:text-green-700 transition-colors uppercase tracking-tight">
                    {post.food_type.split(' - ')[0]}
                </h4>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                    <p className="text-xs font-bold text-gray-400 opacity-80 uppercase tracking-widest leading-relaxed">
                        {post.food_type.split(' - ')[1] || 'Fresh Items'}
                    </p>
                    <p className="text-xs font-bold text-gray-400 opacity-80 uppercase tracking-widest leading-relaxed">
                        {post.quantity}
                    </p>
                </div>
                <div className="pt-2">
                    <p className="text-xs font-black text-gray-700 uppercase tracking-tight">
                        <span className="text-gray-400 font-bold normal-case">For </span>
                        {post.location.split(' | ')[0]}
                    </p>
                </div>
            </div>

            {/* Status & Actions */}
            <div className="flex flex-col items-center lg:items-end gap-4">
                <div className="flex items-center gap-2">
                    {post.is_urgent && (
                        <span className="bg-[#EF5350] text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm animate-pulse">
                            Urgent
                        </span>
                    )}
                    {post.is_recurring && (
                        <span className="bg-blue-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm">
                            Recurring
                        </span>
                    )}
                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${post.status === 'Available' || post.status === 'Active'
                        ? 'bg-[#E8F5E9] text-[#2E7D32]'
                        : 'bg-[#43A047] text-white'
                        }`}>
                        {post.status === 'Available' ? 'Pending Pickup' : post.status === 'Active' ? 'Active' : post.status === 'Paused' ? 'Paused' : 'Delivered'}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <button className="bg-[#D1D5DB] text-gray-700 px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-300 transition-all active:scale-95">
                        View Details
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyDonations;
