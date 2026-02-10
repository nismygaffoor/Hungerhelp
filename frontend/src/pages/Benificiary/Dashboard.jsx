import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
    Search,
    List,
    TrendingUp,
    Clock,
    LayoutGrid
} from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalClaimed: 0, pendingPickups: 0, delivered: 0 });
    const [recentClaims, setRecentClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/claims/stats');
                setStats({
                    totalClaimed: res.data.stats.total_claimed,
                    pendingPickups: res.data.stats.pending_pickups,
                    delivered: res.data.stats.delivered
                });
                setRecentClaims(res.data.recent_activity);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="flex min-h-screen bg-white font-sans">
            <Sidebar />

            <main className="flex-1 ml-0">
                <Navbar />

                <div className="flex-1 ml-0 md:ml-64 p-4 md:p-6 bg-[#F9FAFB]">
                    <header className="mb-6 text-left">
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">Beneficiary Dashboard</h2>
                        <p className="text-gray-500 text-xs mt-1">Access fresh food and manage your claims easily.</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 relative">
                        {/* Recent Claims Card */}
                        <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 min-h-[300px]">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Claims</h3>
                            <p className="text-sm text-gray-400 mb-6 font-medium">Your latest food requests history.</p>

                            <div className="space-y-4">
                                {recentClaims.length === 0 ? (
                                    <p className="text-sm text-gray-400 italic">No recent claims.</p>
                                ) : (
                                    recentClaims.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-4 rounded-xl bg-gray-50/50">
                                            <span className="text-sm font-bold text-gray-700">{item.title}</span>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                    item.status === 'Pending Pickup' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-blue-100 text-blue-700'
                                                }`}>{item.status}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Impact Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-green-100/50 min-h-[250px] flex flex-col items-center justify-center text-center">
                            <TrendingUp size={32} className="text-green-500 mb-3" />
                            <h3 className="text-base font-bold text-gray-800 mb-1">Food Saved</h3>
                            <span className="text-4xl font-bold text-green-500 block mb-1">{stats.totalClaimed}</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Meals Received</span>
                        </div>

                        {/* Pending Pickups */}
                        <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 min-h-[300px]">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Pending Pickups</h3>
                            <p className="text-sm text-gray-400 mb-6 font-medium">Coordinate your collection times.</p>
                            <div className="space-y-4">
                                {recentClaims.filter(c => c.status === 'Pending Pickup').length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center mt-4">
                                        <p className="text-sm text-gray-400 italic">No pending pickups.</p>
                                    </div>
                                ) : (
                                    recentClaims.filter(c => c.status === 'Pending Pickup').map((item, idx) => (
                                        <div key={idx} className="p-4 rounded-xl bg-orange-50 border border-orange-100 flex items-start gap-3">
                                            <Clock size={16} className="text-orange-500 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-bold text-gray-800">{item.title}</p>
                                                <p className="text-[10px] text-orange-600 font-bold uppercase mt-1">Status: {item.status}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <button
                            onClick={() => navigate('/beneficiary/claim')}
                            className="p-6 rounded-xl border-2 border-transparent bg-white flex items-center gap-4 hover:border-[#F1F3F4] transition-all text-left shadow-sm group"
                        >
                            <Search size={24} className="text-[#00BFA5]" />
                            <span className="text-base font-bold text-[#00BFA5]">Browse Available Food</span>
                        </button>
                        <button
                            onClick={() => navigate('/beneficiary/history')}
                            className="p-6 rounded-xl border-2 border-[#00BFA5] bg-white flex items-center gap-4 shadow-sm transition-all text-left"
                        >
                            <List size={24} className="text-[#00BFA5]" />
                            <span className="text-base font-bold text-[#00BFA5]">My Claims History</span>
                        </button>
                        <button
                            onClick={() => navigate('/beneficiary/request')}
                            className="p-6 rounded-xl border-2 border-[#00BFA5]/10 bg-white flex items-center gap-4 hover:border-[#00BFA5]/30 transition-all text-left shadow-sm"
                        >
                            <LayoutGrid size={24} className="text-[#00BFA5]" />
                            <span className="text-base font-bold text-[#00BFA5]">Request Specific Item</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
