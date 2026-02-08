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
    const [stats] = useState({
        total: '25,00',
        active: '25,00',
        impact: '25,00'
    });

    const recentDonations = [
        { title: 'Total Donations', desc: 'T8E TJkaagany 2024', time: '203 10aNsus', status: 'Satics', img: 'https://images.unsplash.com/photo-1488459711635-de89ea219d53?w=100&h=100&fit=crop' },
        { title: 'Food Brtoovi Donation', desc: '101f0ruaginy 20124', time: '1 Peitus', status: 'Sailus', img: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=100&h=100&fit=crop' },
        { title: 'Fic Del Fotiias', desc: '181 (nsagany 20/24', time: '263 Dallaivs', status: 'Satics', img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=100&h=100&fit=crop' },
        { title: 'Frolz Lstoation', desc: '1071decgeny 20124', time: '1S Detltsus', status: 'Satlos', img: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=100&h=100&fit=crop' },
        { title: 'Frolz Lstoation', desc: '1071decgeny 20124', time: '1S Detltsus', status: 'Satlos', img: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=100&h=100&fit=crop' },
    ];

    const upcomingPickups = [
        { title: 'Grocery Store Run', time: 'Tomorrow, 10 AM' },
        { title: 'Farmers Market Collect', time: 'Next Tuesday, 2 PM' },
        { title: 'Grocery Store Run', time: 'Tomorrow, 10 AM' },
    ];

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar />

            <main className="flex-1 ml-0">
                <Navbar />

                <div className="flex-1 ml-0 md:ml-64 p-4 md:p-6 bg-[#F9FAFB]">
                    {/* Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-50 flex flex-col items-center justify-center text-center">
                                <div className="bg-[#DCFCE7] p-2.5 rounded-xl mb-3 text-[#1E5144]">
                                    <Leaf size={20} fill="currentColor" />
                                </div>
                                <div className="text-3xl font-bold text-gray-900 mb-1">2,500</div>
                                <div className="text-xs font-bold text-gray-800 uppercase tracking-tight">Total Donations</div>
                                <p className="text-[9px] text-gray-400 font-medium mt-0.5">Summary of your contribution impact</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Recent Donations */}
                        <div className="lg:col-span-2">
                            <h3 className="text-base font-bold text-gray-900 mb-4 font-sans uppercase tracking-tight">Recent Donations</h3>
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 space-y-4">
                                {recentDonations.map((item, i) => (
                                    <div key={i} className="flex items-center gap-5 group cursor-pointer">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm">
                                            <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-base font-bold text-gray-800">{item.title}</h4>
                                            <p className="text-xs text-gray-400 font-medium">{item.desc}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.time}</p>
                                            <p className="text-xs text-green-500 font-black uppercase tracking-widest">{item.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Charts & Upcoming */}
                        <div className="space-y-6">
                            {/* Chart Card */}
                            <div>
                                <h3 className="text-base font-bold text-gray-900 mb-4 uppercase tracking-tight">Donation Upstory</h3>
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
                                    <div className="h-32 flex items-end justify-between gap-2 px-1">
                                        {[40, 60, 50, 85, 75, 90].map((h, i) => (
                                            <div key={i} className="flex-1 bg-[#F0FDF4] rounded-t-lg relative group overflow-hidden">
                                                <div
                                                    style={{ height: `${h}%` }}
                                                    className="w-full bg-[#86EFAC] rounded-t-lg transition-all duration-700 group-hover:bg-[#4ADE80]"
                                                ></div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-4 text-[10px] text-gray-400 font-bold px-1">
                                        <span>0</span><span>5</span><span>46</span><span>210</span><span>100</span>
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
                                    <div className="space-y-4">
                                        {upcomingPickups.map((item, i) => (
                                            <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                                <span className="text-xs font-bold text-gray-700">{item.title}</span>
                                                <span className="text-[10px] font-bold text-gray-400 text-right leading-tight max-w-[80px]">{item.time}</span>
                                            </div>
                                        ))}
                                    </div>
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
