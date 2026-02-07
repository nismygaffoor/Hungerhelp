import { LogOut, Settings, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ menuItems, activeTab, setActiveTab }) => {
    const { logout } = useAuth();

    const bottomItems = [
        { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
        { id: 'logout', label: 'Logout', icon: <LogOut size={20} />, action: logout },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10 transition-all duration-300">
            <div className="p-6 flex items-center gap-2">
                <Leaf className="text-green-600" size={28} />
                <span className="text-2xl font-bold text-green-700 tracking-tight">Hunger<span className="text-gray-500 font-light">Help</span></span>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors
                            ${activeTab === item.id
                                ? 'bg-green-700 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-green-700'
                            }`}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100 space-y-2">
                {bottomItems.map(item => (
                    <button
                        key={item.id}
                        onClick={item.action || (() => setActiveTab(item.id))}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;
