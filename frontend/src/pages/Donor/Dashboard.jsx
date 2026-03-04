import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
    Leaf,
    Repeat,
    ChevronRight,
    Timer
} from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        delivered: 0
    });
    const [recentDonations, setRecentDonations] = useState([]);
    const [upcomingDonations, setUpcomingDonations] = useState([]);
    const [monthlyData, setMonthlyData] = useState([0, 0, 0, 0, 0, 0]);
    const [loading, setLoading] = useState(true);
    const backendUrl = 'http://localhost:5000/uploads/';

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/food/donor-stats');
            setStats({
                total: res.data.total_donations,
                active: res.data.active_donations,
                delivered: res.data.delivered_donations
            });
            setRecentDonations(res.data.recent_donations);
            setUpcomingDonations(res.data.upcoming_donations || []);
            setMonthlyData(res.data.monthly_counts || [0, 0, 0, 0, 0, 0]);
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar />

            <main className="flex-1 ml-0">
                <Navbar />

                <div className="flex-1 ml-0 md:ml-64 p-4 md:p-6 bg-[#F9FAFB]">
                    {/* Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {[
                            { label: 'Total Donations', value: stats.total, color: '#DCFCE7', textColor: '#1E5144' },
                            { label: 'Active Posts', value: stats.active, color: '#FEF3C7', textColor: '#92400E' },
                            { label: 'Delivered', value: stats.delivered, color: '#E0E7FF', textColor: '#3730A3' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-50 flex flex-col items-center justify-center text-center">
                                <div className="bg-[#DCFCE7] p-2.5 rounded-xl mb-3 text-[#1E5144]" style={{ backgroundColor: stat.color, color: stat.textColor }}>
                                    <Leaf size={20} fill="currentColor" />
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">
                                    {loading ? '...' : stat.value}
                                </div>
                                <div className="text-xs font-bold text-gray-800 uppercase tracking-tight">{stat.label}</div>
                                <p className="text-[9px] text-gray-400 font-medium mt-0.5">Summary of your contribution impact</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Recent Donations */}
                        <div className="lg:col-span-2">
                            <h3 className="text-base font-bold text-gray-900 mb-4 font-sans uppercase tracking-tight">Recent Donations</h3>
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 space-y-4">
                                {loading ? (
                                    <div className="flex items-center justify-center p-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                    </div>
                                ) : recentDonations.length === 0 ? (
                                    <div className="text-center p-8 text-gray-400">
                                        <p className="text-sm font-medium">No donations yet</p>
                                    </div>
                                ) : (
                                    recentDonations.map((item, i) => {
                                        const firstItemImage = item.items?.[0]?.images?.[0];
                                        const imgSrc = (item.images?.length > 0)
                                            ? (item.images[0].startsWith('http') ? item.images[0] : `${backendUrl}${item.images[0]}`)
                                            : (firstItemImage ? (firstItemImage.startsWith('http') ? firstItemImage : `${backendUrl}${firstItemImage}`) : 'https://images.unsplash.com/photo-1488459711635-de89ea219d53?w=100&h=100&fit=crop');
                                        const foodName = item.food_type?.split(' - ')[0] || 'Food Donation';
                                        const foodDesc = item.food_type?.split(' - ')[1] || item.quantity;
                                        const timeAgo = item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently';

                                        return (
                                            <div key={i} className="flex items-center gap-5 group cursor-pointer">
                                                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm">
                                                    <img src={imgSrc} alt={foodName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-base font-bold text-gray-800">{foodName}</h4>
                                                    <p className="text-xs text-gray-400 font-medium">{foodDesc}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{timeAgo}</p>
                                                    <p className={`text-xs font-black uppercase tracking-widest ${item.status === 'Available' ? 'text-green-500' :
                                                        item.status === 'Active' ? 'text-blue-500' :
                                                            item.status === 'Delivered' ? 'text-purple-500' : 'text-gray-500'
                                                        }`}>{item.status}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Right Column: Charts & Upcoming */}
                        <div className="space-y-6">
                            {/* Chart Card */}
                            <div>
                                <h3 className="text-base font-bold text-gray-900 mb-4 uppercase tracking-tight">Donation History</h3>
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
                                    <div className="h-32 flex items-end justify-between gap-2 px-1">
                                        {monthlyData.map((count, i) => {
                                            const maxCount = Math.max(...monthlyData, 1);
                                            const heightPercent = (count / maxCount) * 100;
                                            return (
                                                <div key={i} className="flex-1 bg-[#F0FDF4] rounded-t-lg relative group overflow-hidden">
                                                    <div
                                                        style={{ height: `${heightPercent}%` }}
                                                        className="w-full bg-[#86EFAC] rounded-t-lg transition-all duration-700 group-hover:bg-[#4ADE80]"
                                                    ></div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex justify-between mt-4 text-[10px] text-gray-400 font-bold px-1">
                                        {monthlyData.map((count, i) => (
                                            <span key={i}>{count}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Upcoming Donations */}
                            <div className="relative">
                                <h3 className="text-base font-bold text-gray-900 mb-4 uppercase tracking-tight">Upcoming Donation</h3>
                                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-50 relative z-10">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-4 leading-relaxed">
                                        Scheduled collections for your recurring donations.
                                    </p>
                                    {loading ? (
                                        <div className="flex items-center justify-center p-4">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                                        </div>
                                    ) : upcomingDonations.length === 0 ? (
                                        <div className="text-center p-4 text-gray-400">
                                            <p className="text-xs font-medium">No upcoming recurring donations</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {upcomingDonations.map((item, i) => (
                                                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                                    <span className="text-xs font-bold text-gray-700">{item.title}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 text-right leading-tight max-w-[80px]">{item.time}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {/* Stacked card effect behind */}
                                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[90%] h-full bg-gray-50 rounded-3xl border border-gray-100 z-0"></div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions / Bottom Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pb-12">
                        {[
                            { label: 'Manage Recurring Donations', icon: <Repeat size={20} />, path: '/donor/recurring' },
                            { label: 'View All My Donations', icon: <ChevronRight size={20} />, path: '/donor/history' },
                            { label: 'Post NEw Food Donation', icon: <ChevronRight size={20} />, path: '/donor/post' }
                        ].map((action, i) => (
                            <button
                                key={i}
                                onClick={() => navigate(action.path)}
                                className="bg-white border-2 border-white hover:border-green-100 p-5 rounded-xl text-green-600 font-bold text-sm tracking-tight flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="group-hover:scale-110 transition-transform">
                                    {action.icon}
                                </div>
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
