import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import { User, Mail, Shield, Bell, Activity, Users, Database, FileText, Settings, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
    const { user } = useAuth();
    const [profileData] = useState({
        fullName: 'Admin Supervisor',
        email: user?.email || 'admin@hungerhelp.org',
        role: 'Super Administrator',
        memberSince: 'January 2024',
        lastLogin: '2 hours ago',
        accessLevel: 'Level 10 (Full)'
    });

    return (
        <div className="flex min-h-screen bg-[#F9FAFB] font-sans">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-64">
                <Navbar />
                <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="bg-white rounded-3xl p-6 mb-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 border-l-8 border-gray-900">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg">
                                <img
                                    src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop"
                                    alt="Admin"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-gray-900 text-white p-2 rounded-xl shadow-md border-2 border-white">
                                <Shield size={16} />
                            </div>
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1.5">
                                <h1 className="text-2xl font-black text-gray-900 leading-tight">{profileData.fullName}</h1>
                                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest">
                                    {profileData.role}
                                </span>
                            </div>
                            <p className="text-gray-400 font-bold text-[11px] uppercase tracking-wider">System Access: {profileData.accessLevel}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                    <Activity size={16} className="text-gray-900" />
                                    <span className="text-xs font-bold text-gray-700">Last login {profileData.lastLogin}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Column: Admin Info & Security */}
                        <div className="lg:col-span-12 xl:col-span-7 space-y-8">
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-8">Administrative Credentials</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">System Name</label>
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-transparent">
                                            <User size={18} className="text-gray-400" />
                                            <span className="text-sm font-bold text-gray-700">{profileData.fullName}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Admin Email</label>
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                                            <Mail size={18} className="text-gray-400" />
                                            <span className="text-sm font-bold text-gray-700">{profileData.email}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 pt-8 border-t border-gray-50 flex justify-end">
                                    <button className="px-6 py-2 bg-gray-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-black transition-colors">
                                        Update Credentials
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-8">System Security</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-red-50 p-2.5 rounded-xl text-red-600">
                                                <Lock size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-800 tracking-tight">Root Password</p>
                                                <p className="text-xs text-gray-400 font-medium tracking-tight mt-0.5">Change master password and security keys</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                                    </div>
                                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
                                                <Database size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-800 tracking-tight">Access Logs</p>
                                                <p className="text-xs text-gray-400 font-medium tracking-tight mt-0.5">View your activity and system access history</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Platform Metrics */}
                        <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12">
                                    <Activity size={120} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 mb-8 uppercase tracking-tight">Admin Impact</h3>
                                <div className="grid grid-cols-2 gap-6 relative z-10">
                                    <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                        <p className="text-2xl font-black text-gray-900 mb-1">1.2k</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Users Managed</p>
                                    </div>
                                    <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                        <p className="text-2xl font-black text-gray-900 mb-1">856</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Actions Taken</p>
                                    </div>
                                    <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                        <p className="text-2xl font-black text-gray-900 mb-1">45</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">Pending Tasks</p>
                                    </div>
                                    <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                        <p className="text-2xl font-black text-gray-900 mb-1">99.9%</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">System Uptime</p>
                                    </div>
                                </div>
                                <div className="mt-8 flex gap-4">
                                    <button className="flex-1 py-4 bg-gray-100 text-gray-900 font-black rounded-2xl hover:bg-gray-200 transition-all text-[10px] uppercase tracking-widest">
                                        Audit Logs
                                    </button>
                                    <button className="flex-1 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all text-[10px] uppercase tracking-widest shadow-lg shadow-gray-200">
                                        System Stats
                                    </button>
                                </div>
                            </div>

                            {/* Privilege Summary */}
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-base font-black text-gray-900 mb-6 uppercase tracking-tight">System Permissions</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-green-600">
                                        <Shield size={16} />
                                        <span className="text-xs font-bold">User Management (Read/Write)</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-green-600">
                                        <Database size={16} />
                                        <span className="text-xs font-bold">Database Queries (Super-user)</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-green-600">
                                        <FileText size={16} />
                                        <span className="text-xs font-bold">System Configuration</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-amber-600">
                                        <Lock size={16} />
                                        <span className="text-xs font-bold">Master Key Access (Restricted)</span>
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
