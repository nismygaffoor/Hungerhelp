import { useState, useEffect } from 'react';
import api from '../api/axios';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        food_posts: 0,
        deliveries: 0,
        pending_verifications: 0
    });
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const statsRes = await api.get('/admin/stats');
            setStats(statsRes.data);

            const usersRes = await api.get('/admin/users');
            setUsers(usersRes.data);

            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch admin data", err);
            setLoading(false);
        }
    };

    const handleVerify = async (userId) => {
        try {
            await api.post(`/admin/users/${userId}/verify`);
            alert("User verified successfully");
            fetchData(); // Refresh list
        } catch (err) {
            alert("Failed to verify user");
        }
    };

    if (loading) return <div className="text-center p-10">Loading Admin Data...</div>;

    return (
        <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
                    <h3 className="text-gray-500 text-sm font-bold uppercase">Total Users</h3>
                    <p className="text-3xl font-bold">{stats.users}</p>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
                    <h3 className="text-gray-500 text-sm font-bold uppercase">Food Posts</h3>
                    <p className="text-3xl font-bold">{stats.food_posts}</p>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-yellow-500">
                    <h3 className="text-gray-500 text-sm font-bold uppercase">Deliveries</h3>
                    <p className="text-3xl font-bold">{stats.deliveries}</p>
                </div>
                <div className="bg-white p-6 rounded shadow border-l-4 border-red-500">
                    <h3 className="text-gray-500 text-sm font-bold uppercase">Pending Verifications</h3>
                    <p className="text-3xl font-bold">{stats.pending_verifications}</p>
                </div>
            </div>

            {/* User Management */}
            <div className="bg-white p-6 rounded shadow">
                <h3 className="text-xl font-bold mb-4">User Management</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="p-3">Name</th>
                                <th className="p-3">Role</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-medium">{user.name}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold 
                                            ${user.role === 'Donor' ? 'bg-green-100 text-green-800' :
                                                user.role === 'Beneficiary' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-3 text-gray-600">{user.email}</td>
                                    <td className="p-3">
                                        {user.is_verified ?
                                            <span className="text-green-600 font-bold">Verified</span> :
                                            <span className="text-red-500 font-bold">Unverified</span>
                                        }
                                    </td>
                                    <td className="p-3">
                                        {!user.is_verified && (
                                            <button
                                                onClick={() => handleVerify(user._id)}
                                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                            >
                                                Verify
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
