import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';

const Deliveries = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-[#F9FAFB] min-h-screen`}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">
                    <header className="mb-6 text-left">
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">Delivery Management</h2>
                        <p className="text-gray-500 text-sm mt-1">Track real-time deliveries and volunteer performance.</p>
                    </header>
                    <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Logistics Control</h3>
                        <p className="text-gray-500">Track real-time deliveries and volunteer performance.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Deliveries;
