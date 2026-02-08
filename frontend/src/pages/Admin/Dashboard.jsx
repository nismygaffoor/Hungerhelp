import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Utensils,
    Truck,
    Download,
    TrendingUp,
    BarChart
} from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        donations: '1,250',
        claims: '980',
        deliveries: '850',
        volunteers: '150'
    });

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar />

            <main className="flex-1 ml-0">
                <Navbar />

                <div className="flex-1 ml-0 md:ml-64 p-4 md:p-6 bg-[#F9FAFB]">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">Admin Dashboard</h2>
                            <p className="text-gray-500 text-xs mt-1">Platform oversight and user management.</p>
                        </div>
                        <button className="flex items-center gap-2 bg-white border border-gray-100 text-[#1E5144] px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-gray-50 transition-all">
                            <Download size={16} />
                            Download Report
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <StatCard label="Total Donations" value={stats.donations} trend="+12% since last month" />
                        <StatCard label="Total Claims" value={stats.claims} trend="+8% since last month" />
                        <StatCard label="Total Deliveries" value={stats.deliveries} trend="+10% since last month" />
                        <StatCard label="Active Volunteers" value={stats.volunteers} trend="Steady growth" />
                    </div>

                    {/* Large Chart: Donation Trends */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-lg font-bold text-gray-900">Donation Trends</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Donations
                            </div>
                        </div>
                        <div className="h-64 relative w-full overflow-hidden">
                            {/* Mock Line Chart using SVG */}
                            <svg viewBox="0 0 1000 200" className="w-full h-full preserve-3d">
                                <path
                                    d="M0,180 Q100,140 200,160 T400,150 T600,100 T800,120 T1000,50"
                                    fill="none"
                                    stroke="#10B981"
                                    strokeWidth="3"
                                    className="drop-shadow-lg"
                                />
                                {/* Gradient Area */}
                                <path
                                    d="M0,180 Q100,140 200,160 T400,150 T600,100 T800,120 T1000,50 V200 H0 Z"
                                    fill="url(#chartGradient)"
                                    opacity="0.1"
                                />
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10B981" />
                                        <stop offset="100%" stopColor="#ffffff" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            {/* X-Axis labels */}
                            <div className="flex justify-between mt-4 text-[10px] text-gray-400 uppercase font-bold tracking-widest px-2">
                                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Bar Chart: Claim vs Delivery */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-8">Claim vs. Delivery Ratio</h3>
                            <div className="h-48 flex items-end justify-between gap-4 px-4 overflow-hidden">
                                {[60, 80, 70, 95, 90, 85].map((h, i) => (
                                    <div key={i} className="flex-1 flex gap-1 justify-center h-full items-end group">
                                        <div
                                            style={{ height: `${h}%` }}
                                            className="w-3 bg-[#10B981] rounded-t-sm transition-all group-hover:opacity-80"
                                        ></div>
                                        <div
                                            style={{ height: `${h - 15}%` }}
                                            className="w-3 bg-[#A7F3D0] rounded-t-sm transition-all group-hover:opacity-80"
                                        ></div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-4 text-[10px] text-gray-400 font-bold px-2">
                                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                            </div>
                            <div className="flex justify-center gap-6 mt-6">
                                <LegendItem color="bg-[#10B981]" label="Claims" />
                                <LegendItem color="bg-[#A7F3D0]" label="Deliveries" />
                            </div>
                        </div>

                        {/* Donut Chart: Categories */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-8">Food Categories</h3>
                            <div className="flex items-center gap-8">
                                <div className="relative w-40 h-40">
                                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                        <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#E5E7EB" strokeWidth="4"></circle>
                                        <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#F97316" strokeWidth="4" strokeDasharray="33 100"></circle>
                                        <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#10B981" strokeWidth="4" strokeDasharray="22 100" strokeDashoffset="-33"></circle>
                                        <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#3B82F6" strokeWidth="4" strokeDasharray="17 100" strokeDashoffset="-55"></circle>
                                        <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#FACC15" strokeWidth="4" strokeDasharray="13 100" strokeDashoffset="-72"></circle>
                                        <circle cx="18" cy="18" r="15.9" fill="transparent" stroke="#EF4444" strokeWidth="4" strokeDasharray="9 100" strokeDashoffset="-85"></circle>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-xs text-gray-400">Total</span>
                                        <span className="text-xl font-bold">1.2k</span>
                                    </div>
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-y-3">
                                    <LegendItem color="bg-[#F97316]" label="Veg & Fruits" />
                                    <LegendItem color="bg-[#10B981]" label="Baked Goods" />
                                    <LegendItem color="bg-[#3B82F6]" label="Dairy & Eggs" />
                                    <LegendItem color="bg-[#FACC15]" label="Canned" />
                                    <LegendItem color="bg-[#EF4444]" label="Meat/Poultry" />
                                    <LegendItem color="bg-gray-300" label="Other" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
                        {/* Recent Deliveries */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Deliveries</h3>
                            <div className="space-y-6">
                                {[
                                    { title: 'Total Donations', time: '203 10aNsus', status: 'Satics', img: 'https://images.unsplash.com/photo-1488459711635-de89ea219d53?w=100&h=100&fit=crop' },
                                    { title: 'Food Brtoovi Donation', time: '1 Peitus', status: 'Sailus', img: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=100&h=100&fit=crop' },
                                    { title: 'Fic Del Fotiias', time: '263 Dallaivs', status: 'Satics', img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=100&h=100&fit=crop' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 group cursor-pointer">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm">
                                            <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-gray-800">{item.title}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.time}</p>
                                        </div>
                                        <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">{item.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Upcoming Pickups */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Upcoming Pickups</h3>
                            <div className="bg-[#F9FAFB] rounded-xl p-6 border border-gray-50">
                                <p className="text-[11px] text-gray-400 font-bold uppercase mb-4">Scheduled collections for your attention.</p>
                                <div className="space-y-4">
                                    <PickupItem title="Grocery Store Run" time="Tomorrow, 10 AM" />
                                    <PickupItem title="Farmers Market" time="Next Tuesday, 2 PM" />
                                    <PickupItem title="Grocery Store Run" time="Tomorrow, 10 AM" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const PickupItem = ({ title, time }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
        <span className="text-xs font-bold text-gray-700">{title}</span>
        <span className="text-xs font-medium text-gray-500">{time}</span>
    </div>
);

const StatCard = ({ label, value, trend }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <h4 className="text-gray-400 text-xs font-semibold mb-1 uppercase tracking-tight">{label}</h4>
        <div className="text-xl font-extrabold text-gray-900 mb-1">{value}</div>
        <p className={`text-[9px] font-bold uppercase tracking-tight ${trend.includes('+') ? 'text-green-600' : 'text-gray-400'}`}>
            {trend}
        </p>
    </div>
);

const LegendItem = ({ color, label }) => (
    <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
        <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap">{label}</span>
    </div>
);

export default Dashboard;
