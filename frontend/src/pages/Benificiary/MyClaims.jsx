import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
    Search,
    ChevronDown
} from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';

const MyClaims = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const backendUrl = 'http://localhost:5000/uploads/';

    useEffect(() => {
        const fetchClaims = async () => {
            try {
                const res = await api.get('/claims/my-claims');
                setClaims(res.data);
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
        if (status === 'Claimed') return 'bg-blue-100 text-blue-700';
        return 'bg-gray-100 text-gray-600';
    };

    const getPlaceholderImage = (idx) => {
        return null; // Return null to trigger the icon placeholder
    };

    return (
        <div className="flex min-h-screen bg-white font-sans">
            <Sidebar />

            <main className="flex-1 ml-0 md:ml-64 bg-[#F9FAFB] min-h-screen">
                <Navbar />

                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    <header className="mb-8 text-left">
                        <h2 className="text-3xl font-bold text-gray-900 leading-tight">My claims</h2>
                    </header>

                    {/* Filters Row */}
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                        <FilterButton label="All" />
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

                    {/* Claims List */}
                    <div className="space-y-8 animate-fade-in relative mt-10">

                        {claims.length === 0 ? (
                            <div className="text-center p-10">
                                <p className="text-gray-500 font-medium">You haven't claimed any food yet.</p>
                            </div>
                        ) : (
                            claims.map((claim) => {
                                // Prepare images
                                const displayImages = [];
                                const postImages = claim.images || [];

                                if (postImages.length > 0) {
                                    postImages.forEach(img => {
                                        displayImages.push(img.startsWith('http') ? img : `${backendUrl}${img}`);
                                    });
                                } else {
                                    // Show 4 placeholders if no real images (to match 2x2 grid look)
                                    for (let i = 0; i < 4; i++) {
                                        displayImages.push(getPlaceholderImage(i));
                                    }
                                }

                                return (
                                    <div key={claim.id} className="bg-white rounded-xl p-5 border border-red-100 shadow-sm relative hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-center">
                                        {/* Image Grid - Dynamic Cols */}
                                        <div className={`grid gap-2 w-full md:w-44 flex-shrink-0 ${displayImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                            {displayImages.slice(0, 4).map((img, i) => (
                                                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                                                    {img ? (
                                                        <img
                                                            src={img}
                                                            className="w-full h-full object-cover"
                                                            alt="Food item"
                                                        />
                                                    ) : (
                                                        <Search className="text-gray-300" size={24} />
                                                        /* Using Search as generic icon, or import Image from lucide if available */
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 w-full text-left self-start py-2">
                                            <div className="mb-4">
                                                <h3 className="text-base font-bold text-gray-800 mb-1">{claim.food_type.split(' - ')[0]}</h3>
                                            </div>

                                            <p className="text-sm font-bold text-gray-700 mt-2">
                                                Donated by <span className="text-gray-900">{claim.donor_name || "Unknown Donor"}</span>
                                            </p>
                                        </div>

                                        {/* Status & Action */}
                                        <div className="flex flex-row md:flex-col gap-3 min-w-[140px] items-center md:items-end justify-center w-full md:w-auto mt-4 md:mt-0">
                                            <span className={`px-5 py-2 rounded-full font-bold text-[11px] shadow-sm min-w-[120px] text-center ${claim.status === 'Pending Pickup' ? 'bg-[#98E158] text-white' :
                                                    claim.status === 'Delivered' ? 'bg-[#66BB6A] text-white' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {claim.status}
                                            </span>
                                            <button
                                                onClick={() => navigate(`/beneficiary/donation/${claim.post_id}`, { state: { from: '/beneficiary/history' } })}
                                                className="px-5 py-2 rounded-full font-bold text-gray-500 bg-[#C4C4C4] hover:bg-gray-400 transition-all text-[11px] min-w-[120px]"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
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

export default MyClaims;
