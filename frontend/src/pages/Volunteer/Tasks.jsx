import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import { Truck } from 'lucide-react';

const Tasks = () => {
    return (
        <div className="flex min-h-screen bg-white font-sans">
            <Sidebar />
            <main className="flex-1 ml-0">
                <Navbar />
                <div className="flex-1 ml-0 md:ml-64 p-4 md:p-6 bg-[#F9FAFB]">
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
