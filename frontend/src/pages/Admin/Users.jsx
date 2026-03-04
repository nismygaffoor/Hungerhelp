import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import { UserCheck, ShieldAlert, Mail, User as UserIcon } from 'lucide-react';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleVerify = async (userId) => {
        try {
            await api.post(`/admin/users/${userId}/verify`);
            setMessage('User verified successfully!');
            fetchUsers(); // Refresh list
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error("Verification failed:", err);
            alert("Failed to verify user.");
        }
    };

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar />
            <main className="flex-1 ml-0">
                <Navbar />
                <div className="flex-1 ml-0 md:ml-64 p-4 md:p-6 bg-[#F9FAFB]">
                    <header className="mb-6 text-left">
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">User Management</h2>
                        <p className="text-gray-500 text-xs mt-1 transition-opacity">Oversee all registered Donors, Beneficiaries, and Volunteers.</p>
                    </header>

                    {message && (
                        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-xl text-sm font-bold animate-fade-in">
                            {message}
                        </div>
                    )}

                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#F9FAFB] border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">User</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-400 animate-pulse">Loading platform users...</td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-400">No users found.</td>
                                        </tr>
                                    ) : (
                                        users.map((u) => (
                                            <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                            <UserIcon size={16} />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-800">{u.name || u.businessName}</div>
                                                            <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                                                <Mail size={10} /> {u.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${u.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                                                            u.role === 'Donor' ? 'bg-blue-100 text-blue-700' :
                                                                u.role === 'Beneficiary' ? 'bg-orange-100 text-orange-700' :
                                                                    'bg-green-100 text-green-700'
                                                        }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {u.is_verified ? (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase">
                                                            <UserCheck size={12} /> Verified
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                                                            <ShieldAlert size={12} /> Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {!u.is_verified && u.role !== 'Admin' && (
                                                        <button
                                                            onClick={() => handleVerify(u._id)}
                                                            className="text-[10px] font-black text-white bg-green-600 px-3 py-1.5 rounded-lg hover:bg-green-700 transition-all uppercase tracking-widest"
                                                        >
                                                            Verify
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Users;
