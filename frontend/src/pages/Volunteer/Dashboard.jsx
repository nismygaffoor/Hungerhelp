import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Package,
    Truck,
    History,
    MessageSquare,
    Clock,
    Users,
    MapPin,
    ArrowUpRight,
    Search,
    ChevronDown,
    Bell
} from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';

const Dashboard = () => {
    const { user } = useAuth();
    const [deliveries, setDeliveries] = useState([
        { id: 1, title: 'Total Donations', senderEmail: 'TBE TJkaagany 2024', status: 'Satics', count: '203 10aNsus', img: 'https://images.unsplash.com/photo-1488459711635-de89ea219d53?w=100&h=100&fit=crop' },
        { id: 2, title: 'Food Brtoovi Donation', senderEmail: '101f0ruaginy 20124', status: 'Sailus', count: '1 Peitus', img: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=100&h=100&fit=crop' },
        { id: 3, title: 'Fic Del Fotiias', senderEmail: '181 (nsagany 20/24', status: 'Satics', count: '263 Dallaivs', img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=100&h=100&fit=crop' },
        { id: 4, title: 'Frolz Lstoation', senderEmail: '1071deogeny 20124', status: 'Satlos', count: '1S Detltsus', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop' },
        { id: 5, title: 'Frolz Lstoation', senderEmail: '1071deogeny 20124', status: 'Satlos', count: '1S Detltsus', img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=100&h=100&fit=crop' },
    ]);

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar />

            <main className="flex-1 ml-0">
                <Navbar />

                <div className="flex-1 ml-0 md:ml-64 p-4 md:p-6 bg-[#F9FAFB] min-h-screen">
                    {/* Page Header */}
                    <div className="flex justify-between items-end mb-8 mt-2 px-2">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">Dashboard</h2>
                            <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mt-1 opacity-60">System Monitoring & Stats</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Bell className="text-blue-500 fill-blue-500 opacity-80" size={20} />
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white">6</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
                                <span className="text-xs font-bold text-gray-700">English</span>
                                <ChevronDown size={14} className="text-gray-400" />
                            </div>
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer">
                                <img src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop" alt="User" />
                            </div>
                        </div>
                    </div>

                    {/* Top Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <TopStatCard
                            icon={<Package className="text-green-600" size={20} />}
                            value="125"
                            label="Total Delivery"
                            subtext="Pihot sot tat Dxoall ta did biteertes"
                        />
                        <TopStatCard
                            icon={<Clock className="text-green-600" size={20} />}
                            value="350"
                            label="Hours Contributed"
                            subtext="Pihot sot tat Dxoall ta did biteertes"
                        />
                        <TopStatCard
                            icon={<Users className="text-green-600" size={20} />}
                            value="80+"
                            label="Families Helped"
                            subtext="Pihot sot tat Dxoall ta did biteertes"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20 px-4 max-w-7xl mx-auto">
                        {/* Recent Deliveries Column */}
                        <div className="lg:col-span-12 xl:col-span-7 bg-white/40 rounded-[2.5rem] p-8 backdrop-blur-sm border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <h3 className="text-lg font-bold text-gray-900 mb-8 px-2">Recent Deliveries</h3>
                            <div className="space-y-6">
                                {deliveries.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-2 hover:bg-white/60 rounded-3xl transition-all group cursor-pointer border border-transparent hover:border-white hover:shadow-sm">
                                        <div className="flex items-center gap-5 translate-x-1">
                                            <div className="w-16 h-16 rounded-[1.25rem] overflow-hidden shadow-sm border-2 border-white group-hover:scale-110 transition-transform duration-500">
                                                <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-800 leading-tight mb-0.5 group-hover:text-green-700 transition-colors uppercase tracking-tight">{item.title}</h4>
                                                <p className="text-[11px] font-bold text-gray-400 opacity-60 uppercase">{item.senderEmail}</p>
                                            </div>
                                        </div>
                                        <div className="text-right pr-4 space-y-0.5">
                                            <p className="text-xs font-bold text-gray-400 opacity-40 uppercase tracking-tight">{item.count}</p>
                                            <p className="text-[11px] font-black text-green-500 uppercase tracking-widest">{item.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Charts and Schedule Column */}
                        <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                            {/* Simple Weekly Deliveries Chart */}
                            <div className="bg-white rounded-3xl p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                                <div className="flex justify-between items-center mb-10">
                                    <h3 className="text-lg font-bold text-gray-900 leading-none">Weekly Deliveries</h3>
                                    <ArrowUpRight className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                                </div>

                                <div className="h-44 flex items-end justify-between gap-3 px-2 relative px-4">
                                    {/* Background grid lines */}
                                    <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none opacity-[0.03]">
                                        {[1, 2, 3, 4].map(i => <div key={i} className="w-full h-px bg-black"></div>)}
                                    </div>

                                    {[45, 65, 55, 85, 95, 75].map((h, i) => (
                                        <div key={i} className="flex-1 group/bar relative">
                                            <div
                                                style={{ height: `${h}%` }}
                                                className="w-full bg-[#E8F5E9] rounded-t-lg transition-all group-hover/bar:bg-[#81C784] group-hover/bar:scale-x-105 duration-500"
                                            />
                                            {/* Tooltip mockup */}
                                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-all font-bold">{h}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between mt-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                                </div>
                            </div>

                            {/* Upcoming Pickups Card */}
                            <div className="bg-white rounded-3xl p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative">
                                <div className="flex items-center gap-3 mb-8">
                                    <h3 className="text-lg font-bold text-gray-900">Upcoming Pickups</h3>
                                </div>
                                <div className="bg-[#F9FAFB] rounded-2xl p-6 border border-gray-100/50 space-y-6">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2 opacity-80 leading-relaxed">Scheduled collections for your recurring donations.</p>

                                    <div className="space-y-4">
                                        <PickupRow label="Grocery Store Run" time="Tomorrow, 10 AM" />
                                        <PickupRow label="Farmers Market Collect" time="Next Tuesday, 2 PM" />
                                        <PickupRow label="Grocery Store Run" time="Tomorrow, 10 AM" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const TopStatCard = ({ icon, value, label, subtext }) => (
    <div className="bg-white p-10 rounded-[2.5rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group">
        <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_6px_20px_rgba(34,197,94,0.1)] group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <div className="text-5xl font-black text-gray-900 mb-2 tracking-tight">{value}</div>
        <h4 className="text-base font-bold text-gray-900 mb-2">{label}</h4>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider opacity-60 leading-relaxed px-4">{subtext}</p>
    </div>
);

const PickupRow = ({ label, time }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-200/50 last:border-0 group cursor-pointer hover:px-1 transition-all">
        <span className="text-xs font-bold text-gray-700 group-hover:text-green-600 transition-colors uppercase tracking-tight">{label}</span>
        <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap opacity-80">{time}</span>
    </div>
);

export default Dashboard;

