import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import { Truck } from 'lucide-react';

const Tasks = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-[#F9FAFB] min-h-screen`}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">
                    <header className="mb-6 text-left">
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">Available Tasks</h2>
                        <p className="text-gray-500 text-sm mt-1">View and accept available food delivery tasks in your area.</p>
                    </header>
                    <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center flex flex-col items-center shadow-sm">
                        <Truck size={48} className="text-gray-300 mb-4" />
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to Rescue?</h3>
                        <p className="text-gray-500">View and accept available food delivery tasks in your area.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Tasks;
