import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Utensils,
    List,
    Users,
    MessageSquare,
    User,
    LogOut,
    Leaf,
    Settings,
    Timer,
    FileText
} from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <Timer size={22} />, path: '/donor/dashboard' },
        { id: 'profile', label: 'Your Profile', icon: <User size={22} />, path: '/donor/profile' },
        { id: 'post', label: 'Post Food', icon: <MessageSquare size={22} />, path: '/donor/post' },
        { id: 'recurring', label: 'Recurring Donations', icon: <Users size={22} />, path: '/donor/recurring' },
        { id: 'history', label: 'My Donations', icon: <List size={22} />, path: '/donor/history' },
        { id: 'feedback', label: 'Feedback', icon: <FileText size={22} />, path: '/donor/feedback' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-50">
            {/* Logo */}
            <div className="p-6 mb-4 flex items-center gap-2">
                <Leaf className="text-[#1E5144]" size={24} />
                <span className="text-xl font-bold text-gray-700 tracking-tight">Hunger<span className="text-gray-400 font-light">Help</span></span>
            </div>

            {/* Navigation menu */}
            <nav className="flex-1 px-4 space-y-1 mt-4">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all group
                        ${isActive
                                    ? 'bg-[#1E5144] text-white shadow-lg'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-[#1E5144]'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#1E5144]'}>{item.icon}</span>
                                <span className="text-sm font-semibold">{item.label}</span>
                            </div>
                        </button>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="px-4 pb-6 space-y-1">
                <button
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-[#1E5144] transition-all group"
                >
                    <div className="text-gray-400 group-hover:text-[#1E5144]">
                        <Settings size={20} />
                    </div>
                    Settings
                </button>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all group"
                >
                    <div className="text-gray-400 group-hover:text-red-500">
                        <LogOut size={20} />
                    </div>
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
