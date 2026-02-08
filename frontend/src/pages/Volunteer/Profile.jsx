import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import { User, Mail, Phone, MapPin, Shield, Bell, Truck, Star, Award, Zap, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState({
        fullName: 'Alex Rivera',
        email: user?.email || 'alex.v@hungerhelp.org',
        phone: '+1 555 012 3456',
        address: '89 Mission Street, Downtown Hub',
        memberSince: 'February 2024'
    });

    return (
        <div className="flex min-h-screen bg-[#F9FAFB] font-sans">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64">
                <Navbar />
                <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="bg-white rounded-3xl p-6 mb-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#FEF9C3] shadow-lg">
                                <img
                                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop"
                                    alt="Profile"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <button className="absolute bottom-1 right-1 bg-[#d97706] p-2 rounded-full text-white shadow-md hover:bg-[#b45309] transition-colors">
                                <Settings size={16} />
                            </button>
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1.5">
                                <h1 className="text-2xl font-black text-gray-900 leading-tight">{profileData.fullName}</h1>
                                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#FEF9C3] text-[#d97706] text-[10px] font-black uppercase tracking-widest">
                                    Elite Volunteer
                                </span>
                            </div>
                            <p className="text-gray-400 font-bold text-[11px] uppercase tracking-wider">Member since {profileData.memberSince}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
                                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                    <span className="text-xs font-bold text-gray-700">4.9 / 5.0 Rating</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-yellow-100">
                                    <Zap size={16} className="text-yellow-600" />
                                    <span className="text-xs font-bold text-gray-700">Top 5% Performer</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Column: Personal Information */}
                        <div className="lg:col-span-12 xl:col-span-7 space-y-8">
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Personal Details</h3>
                                    <button className="text-sm font-black text-[#d97706] hover:underline underline-offset-4">Update Info</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Legal Name</label>
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-transparent focus-within:border-[#d97706]/20 transition-all">
                                            <User size={18} className="text-gray-400" />
                                            <span className="text-sm font-bold text-gray-700">{profileData.fullName}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Work Email</label>
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                                            <Mail size={18} className="text-gray-400" />
                                            <span className="text-sm font-bold text-gray-700">{profileData.email}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Mobile Number</label>
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                                            <Phone size={18} className="text-gray-400" />
                                            <span className="text-sm font-bold text-gray-700">{profileData.phone}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Headquarters / Base</label>
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                                            <MapPin size={18} className="text-gray-400" />
                                            <span className="text-sm font-bold text-gray-700">{profileData.address}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-8">Volunteer Settings</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600">
                                                <Truck size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-800 tracking-tight">Vehicle & Logistics</p>
                                                <p className="text-xs text-gray-400 font-medium tracking-tight mt-0.5">Manage your transportation documents</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                                    </div>
                                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-amber-50 p-2.5 rounded-xl text-amber-600">
                                                <Bell size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-800 tracking-tight">Route Notifications</p>
                                                <p className="text-xs text-gray-400 font-medium tracking-tight mt-0.5">Control proximity-based task alerts</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Role Metrics */}
                        <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden text-center">
                                <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12">
                                    <Zap size={120} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 mb-8 uppercase tracking-tight">Performance Stats</h3>
                                <div className="grid grid-cols-2 gap-6 relative z-10">
                                    <div className="bg-[#FEF9C3] p-5 rounded-3xl">
                                        <p className="text-2xl font-black text-[#d97706] mb-1">156</p>
                                        <p className="text-[10px] font-black text-amber-700/60 uppercase tracking-widest leading-tight">Deliveries Done</p>
                                    </div>
                                    <div className="bg-[#EFF6FF] p-5 rounded-3xl">
                                        <p className="text-2xl font-black text-[#2563eb] mb-1">420hr</p>
                                        <p className="text-[10px] font-black text-blue-700/60 uppercase tracking-widest leading-tight">Hours Contributed</p>
                                    </div>
                                    <div className="bg-[#FDF2F8] p-5 rounded-3xl">
                                        <p className="text-2xl font-black text-[#db2777] mb-1">98%</p>
                                        <p className="text-[10px] font-black text-pink-700/60 uppercase tracking-widest leading-tight">Reliability</p>
                                    </div>
                                    <div className="bg-[#F0FDF4] p-5 rounded-3xl">
                                        <p className="text-2xl font-black text-[#16a34a] mb-1">2.4k</p>
                                        <p className="text-[10px] font-black text-green-700/60 uppercase tracking-widest leading-tight">Km Covered</p>
                                    </div>
                                </div>
                                <button className="w-full mt-8 py-4 px-6 bg-gray-900 text-white font-black rounded-2xl hover:bg-gray-800 transition-all text-[11px] uppercase tracking-widest shadow-lg shadow-gray-200">
                                    View Service History
                                </button>
                            </div>

                            {/* Badge Gallery */}
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-base font-black text-gray-900 mb-6 uppercase tracking-tight">Service Badges</h3>
                                <div className="flex flex-wrap gap-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-amber-600 hover:bg-amber-50 transition-colors cursor-help group relative">
                                            <Award size={28} />
                                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-20">
                                                Winter Volunteer Hero
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const ChevronRight = ({ size, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m9 18 6-6-6-6" />
    </svg>
);

export default Profile;
