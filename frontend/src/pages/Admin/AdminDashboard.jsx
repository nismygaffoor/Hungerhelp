import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Utensils,
    Truck,
    ShieldAlert,
    Bell
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ users: 0, food_posts: 0, deliveries: 0, pending_verifications: 0 });
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        if (activeTab === 'dashboard' || activeTab === 'users') fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            const statsRes = await api.get('/admin/stats');
            setStats(statsRes.data);
            const usersRes = await api.get('/admin/users');
            setUsersList(usersRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleVerify = async (userId) => {
        try {
            await api.post(`/admin/users/${userId}/verify`);
            alert("User verified successfully");
            fetchData();
        } catch (err) {
            alert("Failed to verify user");
        }
    };

    // Sidebar Config for ADMIN
    const menuItems = [
        { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
        { id: 'users', label: 'Manage Users', icon: <Users size={20} /> },
        { id: 'posts', label: 'Food Posts', icon: <Utensils size={20} /> },
        { id: 'deliveries', label: 'Deliveries', icon: <Truck size={20} /> },
        { id: 'verifications', label: 'Verifications', icon: <ShieldAlert size={20} /> },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">

            <Sidebar menuItems={menuItems} activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="flex-1 ml-0 md:ml-64 p-8">
                <header className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
                    <div className="flex items-center gap-6">
                        <Bell className="text-gray-500 cursor-pointer" size={24} />
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold border border-purple-200">
                            AD
                        </div>
                    </div>
                </header>

                {activeTab === 'dashboard' && (
                    <div className="animate-fade-in space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <StatCard label="Total Users" value={stats.users} color="blue" />
                            <StatCard label="Food Posts" value={stats.food_posts} color="green" />
                            <StatCard label="Deliveries" value={stats.deliveries} color="yellow" />
                            <StatCard label="Pending" value={stats.pending_verifications} color="red" />
                        </div>
                    </div>
                )}

                {(activeTab === 'users' || activeTab === 'dashboard') && (
                    <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fade-in">
                        <h3 className="text-xl font-bold mb-6 text-gray-800">User Management</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                    <tr>
                                        <th className="p-4">Name</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {usersList.map((u) => (
                                        <tr key={u._id} className="hover:bg-gray-50">
                                            <td className="p-4 font-medium">{u.name}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold 
                                                    ${u.role === 'Donor' ? 'bg-green-100 text-green-800' :
                                                        u.role === 'Beneficiary' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-600">{u.email}</td>
                                            <td className="p-4">
                                                {u.is_verified ? <span className="text-green-600 font-bold">Verified</span> : <span className="text-red-500 font-bold">Unverified</span>}
                                            </td>
                                            <td className="p-4">
                                                {!u.is_verified && (
                                                    <button onClick={() => handleVerify(u._id)} className="text-blue-600 hover:text-blue-800 font-bold text-sm">Verify</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Placeholders */}
                {['posts', 'deliveries', 'verifications'].includes(activeTab) && (
                    <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                        <ShieldAlert size={48} className="mb-4 text-gray-200" />
                        <h3 className="text-xl font-bold text-gray-600">Admin Section</h3>
                        <p>This "{activeTab}" admin module is under construction.</p>
                    </div>
                )}

            </main>
        </div>
    );
};

const StatCard = ({ label, value, color }) => {
    const colors = {
        blue: 'border-blue-500 text-blue-600',
        green: 'border-green-500 text-green-600',
        yellow: 'border-yellow-500 text-yellow-600',
        red: 'border-red-500 text-red-600'
    };
    return (
        <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${colors[color]}`}>
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</h3>
            <p className="text-3xl font-bold mt-2 text-gray-800">{value}</p>
        </div>
    );
};

export default AdminDashboard;
