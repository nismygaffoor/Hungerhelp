import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
    Search,
    ChevronDown
} from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';

const MyClaims = () => {
    const { user } = useAuth();
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClaims = async () => {
            try {
                // In a real app, you'd fetch user's claims
                // For now, let's mock it with mockup data
                setClaims([
                    { id: 1, title: 'Fresh Baked Goods', donor: 'Green Farm', status: 'Pending Pickup', items: 4 },
                    { id: 2, title: 'Organic Vegetables', donor: 'City Garden', status: 'Delivered', items: 4 },
                    { id: 3, title: 'Dairy Bundle', donor: 'Fresh Dairy Co', status: 'Delivered', items: 4 }
                ]);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchClaims();
    }, []);

    const getStatusStyle = (status) => {
        if (status === 'Pending Pickup') return 'bg-[#B2E061] text-gray-800';
        if (status === 'Delivered') return 'bg-[#81C784] text-white';
        return 'bg-gray-100 text-gray-600';
    };

    const getPlaceholderImage = (idx) => {
        const images = [
            "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
            "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80",
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80"
        ];
        return images[idx % images.length];
    };

    return (
        <div className="flex min-h-screen bg-white font-sans">
            <Sidebar />

            <main className="flex-1 ml-0">
                <Navbar />

                <div className="flex-1 ml-0 md:ml-64 p-4 md:p-6 bg-[#F9FAFB]">
                    <header className="mb-6 text-left">
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">My Claims</h2>
                        <p className="text-gray-500 text-sm mt-1">Track and manage your requested food rescues.</p>
                    </header>

                    {/* Filters Row */}
                    <div className="flex flex-wrap items-center gap-4 mb-10">
                        <FilterButton label="All" />
                        <FilterButton label="Food Type" />

                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold" size={18} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full bg-white border border-gray-100 rounded-xl pl-12 pr-4 py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus:ring-2 focus:ring-green-500 focus:outline-none text-sm font-medium"
                            />
                        </div>
                    </div>

                    {/* Claims List */}
                    <div className="space-y-8 animate-fade-in relative mt-10">

                        {claims.map((claim) => (
                            <div key={claim.id} className="bg-white rounded-3xl p-6 border border-red-50 relative hover:shadow-lg transition-all duration-300">
                                <div className="flex flex-col md:flex-row gap-8 items-center">
                                    {/* Grid of small images from mockup */}
                                    <div className="grid grid-cols-2 gap-2 shrink-0">
                                        {[0, 1, 2, 3].map(i => (
                                            <img key={i} src={getPlaceholderImage(i + claim.id)} className="w-16 h-12 rounded-lg object-cover border border-gray-50" alt="Claimed item" />
                                        ))}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1">
                                        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-2">
                                            <p className="text-xs font-semibold text-gray-500">Fresh Vegetables-5kg</p>
                                            <p className="text-xs font-semibold text-gray-500">Fresh Baked Goods</p>
                                            <p className="text-xs font-semibold text-gray-500">Fresh Baked Goods</p>
                                            <p className="text-xs font-semibold text-gray-500">Fresh Baked Goods</p>
                                        </div>
                                        <p className="text-sm font-bold text-gray-800">Donated by {claim.donor}</p>
                                    </div>

                                    {/* Status & Action */}
                                    <div className="flex flex-col gap-3 min-w-[140px] text-center">
                                        <span className={`px-6 py-2 rounded-full font-bold text-xs shadow-sm ${getStatusStyle(claim.status)}`}>
                                            {claim.status === 'Deliverd' ? 'Deliverd' : claim.status}
                                        </span>
                                        <button className="px-6 py-2 rounded-xl font-bold text-gray-400 bg-gray-200/50 hover:bg-gray-200 transition-all text-xs">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

const FilterButton = ({ label }) => (
    <button className="flex items-center gap-3 px-8 py-3.5 bg-white border border-gray-100 rounded-xl text-sm font-semibold text-gray-500 hover:text-green-600 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        {label}
        <ChevronDown size={14} className="text-gray-300" />
    </button>
);

export default MyClaims;
