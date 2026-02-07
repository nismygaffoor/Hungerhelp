import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    User,
    PackageCheck,
    History,
    MessageSquare,
    Bell
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';

const VolunteerDashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [activeTab, setActiveTab] = useState('tasks'); // Default

    useEffect(() => {
        if (activeTab === 'tasks') fetchTasks();
    }, [activeTab]);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/delivery/');
            setTasks(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAccept = async (id) => {
        try {
            await api.post(`/delivery/${id}/accept`);
            alert("Task accepted!");
            fetchTasks();
        } catch (err) {
            alert("Failed to accept task");
        }
    };

    // Sidebar Config for VOLUNTEER
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'tasks', label: 'Available Deliveries', icon: <PackageCheck size={20} /> },
        { id: 'history', label: 'Delivery History', icon: <History size={20} /> },
        { id: 'profile', label: 'My Profile', icon: <User size={20} /> },
        { id: 'feedback', label: 'Feedback', icon: <MessageSquare size={20} /> },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">

            {/* Common Sidebar with Volunteer Menu Items */}
            <Sidebar menuItems={menuItems} activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content */}
            <main className="flex-1 ml-0 md:ml-64 p-8">

                {/* Header */}
                <header className="flex justify-between items-center mb-10">
                    <div className="md:hidden">
                        <span className="text-green-600 font-bold text-xl">HungerHelp</span>
                    </div>
                    <div className="hidden md:block"></div>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <Bell className="text-gray-500 hover:text-green-600 cursor-pointer" size={24} />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                            <img src={`https://ui-avatars.com/api/?name=${user.name}&background=0D8ABC&color=fff`} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </header>

                {/* Content */}
                {activeTab === 'tasks' && (
                    <div className="animate-fade-in">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Available Deliveries</h2>
                        {tasks.length === 0 ? <div className="text-center py-20 text-gray-500">No pending deliveries.</div> : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {tasks.map(task => (
                                    <div key={task._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative hover:shadow-md transition">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-800">Delivery Request</h3>
                                                <p className="text-sm text-gray-500">Posted: {new Date(task.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">Pending</span>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-start gap-3">
                                                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase font-bold">Pickup</p>
                                                    <p className="text-gray-700">{task.pickup_location}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase font-bold">Dropoff</p>
                                                    <p className="text-gray-700">{task.dropoff_location}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleAccept(task._id)}
                                            className="w-full py-3 rounded-lg bg-green-600 text-white font-bold shadow hover:bg-green-700 transition"
                                        >
                                            Accept Delivery
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {['dashboard', 'history', 'profile', 'feedback'].includes(activeTab) && (
                    <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                        <PackageCheck size={48} className="mb-4 text-gray-200" />
                        <h3 className="text-xl font-bold text-gray-600">Placeholder</h3>
                        <p>This "{activeTab}" section is under construction.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default VolunteerDashboard;
