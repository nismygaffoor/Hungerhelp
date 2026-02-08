import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import { User, Mail, Phone, MapPin, Shield, Bell, ShoppingBag, Clock, CheckCircle, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState({
        fullName: 'Sarah Jenkins',
        email: user?.email || 'sarah.j@example.com',
        phone: '+1 987 654 3210',
        address: '45 Community Gardens, North Block',
        memberSince: 'March 2024'
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
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#E0F2FE] shadow-lg">
                                <img
                                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop"
                                    alt="Profile"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <button className="absolute bottom-1 right-1 bg-[#0284c7] p-2 rounded-full text-white shadow-md hover:bg-[#0369a1] transition-colors">
                                <Settings size={16} />
                            </button>
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                                <h1 className="text-2xl font-black text-gray-900">{profileData.fullName}</h1>
                                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#E0F2FE] text-[#0369a1] text-[10px] font-black uppercase tracking-widest">
                                    Verified Beneficiary
                                </span>
                            </div>
                            <p className="text-gray-400 font-bold text-[11px] uppercase tracking-wider">Member since {profileData.memberSince}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
                                    <CheckCircle size={16} className="text-blue-500" />
                                    <span className="text-xs font-bold text-gray-700">Profile 100% Verified</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Column: Personal Information */}
                        <div className="lg:col-span-12 xl:col-span-7 space-y-8">
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Personal Information</h3>
                                    <button className="text-sm font-black text-[#0369a1] hover:underline underline-offset-4">Edit Profile</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Full Name</label>
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-transparent focus-within:border-[#0369a1]/20 transition-all">
                                            <User size={18} className="text-gray-400" />
                                            <span className="text-sm font-bold text-gray-700">{profileData.fullName}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Email Address</label>
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                                            <Mail size={18} className="text-gray-400" />
                                            <span className="text-sm font-bold text-gray-700">{profileData.email}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Phone Number</label>
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                                            <Phone size={18} className="text-gray-400" />
                                            <span className="text-sm font-bold text-gray-700">{profileData.phone}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Delivery Address</label>
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                                            <MapPin size={18} className="text-gray-400" />
                                            <span className="text-sm font-bold text-gray-700">{profileData.address}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-8">Account & Privacy</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                                                <Shield size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-800 tracking-tight">Security Settings</p>
                                                <p className="text-xs text-gray-400 font-medium tracking-tight mt-0.5">Update password and enable two-factor auth</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                                    </div>
                                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-sky-50 p-2.5 rounded-xl text-sky-600">
                                                <Bell size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-800 tracking-tight">Food Alerts</p>
                                                <p className="text-xs text-gray-400 font-medium tracking-tight mt-0.5">Customize notifications for available food items</p>
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
                                <h3 className="text-lg font-black text-gray-900 mb-8 uppercase tracking-tight">Your Activity</h3>
                                <div className="grid grid-cols-2 gap-6 relative z-10">
                                    <div className="bg-[#F0F9FF] p-5 rounded-3xl border border-blue-50">
                                        <p className="text-2xl font-black text-[#0369a1] mb-1">28</p>
                                        <p className="text-[10px] font-black text-blue-700/60 uppercase tracking-widest leading-tight">Total Claims</p>
                                    </div>
                                    <div className="bg-[#F0FDF4] p-5 rounded-3xl border border-green-50">
                                        <p className="text-2xl font-black text-[#16a34a] mb-1">96%</p>
                                        <p className="text-[10px] font-black text-green-700/60 uppercase tracking-widest leading-tight">Success Rate</p>
                                    </div>
                                    <div className="bg-[#FFFBEB] p-5 rounded-3xl border border-amber-50">
                                        <p className="text-2xl font-black text-[#d97706] mb-1">02</p>
                                        <p className="text-[10px] font-black text-amber-700/60 uppercase tracking-widest leading-tight">Active Requests</p>
                                    </div>
                                    <div className="bg-[#FAF5FF] p-5 rounded-3xl border border-purple-50">
                                        <p className="text-2xl font-black text-[#7e22ce] mb-1">12</p>
                                        <p className="text-[10px] font-black text-purple-700/60 uppercase tracking-widest leading-tight">Reviews Given</p>
                                    </div>
                                </div>
                                <div className="mt-8 p-4 bg-gray-50 rounded-2xl flex items-center gap-4 text-left">
                                    <div className="bg-amber-100 p-2 rounded-xl text-amber-700">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-800 tracking-tight">Next Scheduled Pickup</p>
                                        <p className="text-[10px] text-gray-500 font-bold">Tomorrow, 4:00 PM at North Block</p>
                                    </div>
                                </div>
                            </div>

                            {/* Verification Badge */}
                            <div className="bg-[#0369a1] rounded-3xl p-6 shadow-lg text-white relative overflow-hidden group cursor-pointer">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                    <Shield size={80} />
                                </div>
                                <h3 className="text-base font-black uppercase tracking-widest mb-2 relative z-10">Verification Status</h3>
                                <p className="text-2xl font-black mb-4 relative z-10 tracking-tight">FULLY VERIFIED</p>
                                <p className="text-xs font-medium text-blue-100/80 mb-6 leading-relaxed relative z-10">
                                    Your documents have been verified by the administration. You have full access to claim and request food items.
                                </p>
                                <button className="px-6 py-2 bg-white text-[#0369a1] text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-blue-50 transition-colors relative z-10">
                                    View Documents
                                </button>
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
