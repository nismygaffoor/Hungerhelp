import { Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user } = useAuth();

    return (
        <header className="flex justify-end items-center bg-white px-6 py-4">
            <div className="flex items-center gap-5">
                {/* Notification Badge */}
                <div className="relative cursor-pointer group">
                    <div className="bg-[#EFF6FF] p-1.5 rounded-xl">
                        <Bell className="text-[#3B82F6] group-hover:text-blue-600 transition-colors" size={18} />
                    </div>
                    <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-[9px] font-bold rounded-xl w-3.5 h-3.5 flex items-center justify-center border-2 border-white">6</span>
                </div>

                {/* Language Selector */}
                <div className="flex items-center gap-2 cursor-pointer group px-3 py-1.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                    <span className="text-[11px] font-bold text-gray-600">English</span>
                    <ChevronDown size={12} className="text-gray-400" />
                </div>

                {/* Profile Section */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-200 border border-gray-100 overflow-hidden shadow-sm hover:ring-2 hover:ring-[#1E5144] transition-all cursor-pointer">
                        <img
                            src={`https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
