import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Search,
    List,
    PlusCircle,
    MessageSquare,
    User,
    LogOut,
    Leaf,
    Settings,
    Timer,
    FileText,
    Menu,
    X
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout = () => { } } = useAuth();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <Timer size={22} />, path: '/beneficiary/dashboard' },
        { id: 'claim', label: 'Find Food', icon: <Search size={22} />, path: '/beneficiary/claim' },
        { id: 'myclaims', label: 'My Claims', icon: <List size={22} />, path: '/beneficiary/history' },
        { id: 'request', label: 'Request Food', icon: <PlusCircle size={22} />, path: '/beneficiary/request' },
        { id: 'myrequests', label: 'My Requests', icon: <FileText size={22} />, path: '/beneficiary/my-requests' },
        { id: 'profile', label: 'Your Profile', icon: <User size={22} />, path: '/beneficiary/profile' },
        { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={22} />, path: '/beneficiary/feedback' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-100 flex flex-col z-[70] transition-all duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                ${isCollapsed ? 'w-16' : 'w-64'}`}>
                
                {/* Toggle Button */}
                <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-start px-4'}`}>
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-all"
                    >
                        <Menu size={22} />
                    </button>
                </div>

                {/* Logo */}
                <div className={`px-6 mb-4 flex items-center gap-2 transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
                    <Leaf className="text-green-600" size={28} />
                    <span className="text-2xl font-bold text-green-700 tracking-tight">Hunger<span className="text-gray-500 font-light">Help</span></span>
                </div>

            {/* Navigation menu */}
            <nav className="flex-1 px-3  space-y-1 mt-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            title={isCollapsed ? item.label : ''}
                            className={`w-full flex items-center px-4 py-2.5 rounded-xl transition-all group
                        ${isActive
                                     ? 'bg-[#1E5144] text-white shadow-lg'
                                     : 'text-gray-500 hover:text-[#1E5144]'}
                        ${isCollapsed ? 'justify-center' : 'justify-start gap-3'}`}
                        >
                            <div className={`flex items-center transition-all ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#1E5144]'}`}>
                                {item.icon}
                            </div>
                            {!isCollapsed && <span className="text-sm font-semibold whitespace-nowrap">{item.label}</span>}
                        </button>
                    );
                })}
            </nav>

            <div className="px-3 pb-10 space-y-1">
                <button
                    className={`w-full flex items-center rounded-xl text-sm font-semibold text-gray-500 hover:text-[#1E5144] transition-all group ${isCollapsed ? 'justify-center' : 'px-4 py-3 gap-3'}`}
                >
                    <div className="text-gray-400 group-hover:text-[#1E5144]">
                        <Settings size={22} />
                    </div>
                    {!isCollapsed && "Settings"}
                </button>
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center rounded-xl text-sm font-semibold text-gray-500 hover:text-red-500 transition-all group ${isCollapsed ? 'justify-center' : 'px-4 py-3 gap-3'}`}
                >
                    <div className="text-gray-400 group-hover:text-red-500">
                        <LogOut size={22} />
                    </div>
                    {!isCollapsed && <span className="font-bold">Logout</span>}
                </button>
            </div>
            </aside>
        </>
    );
};

export default Sidebar;
