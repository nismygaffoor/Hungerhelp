import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Donor', // Default role
        contact: '',
        address: ''
    });
    const [error, setError] = useState('');
    const { registerUser } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await registerUser(formData);
        if (res.success) {
            navigate('/login');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-green-700">Join HungerHelp</h2>

                {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-1">I am a...</label>
                        <select
                            name="role"
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="Donor">Donor (I have food to give)</option>
                            <option value="Beneficiary">Beneficiary (I need food)</option>
                            <option value="Volunteer">Volunteer (I can deliver)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm mb-1">Full Name</label>
                        <input
                            type="text" name="name"
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={formData.name} onChange={handleChange} required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm mb-1">Email</label>
                        <input
                            type="email" name="email"
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={formData.email} onChange={handleChange} required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm mb-1">Password</label>
                        <input
                            type="password" name="password"
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={formData.password} onChange={handleChange} required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm mb-1">Contact Number</label>
                        <input
                            type="tel" name="contact"
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={formData.contact} onChange={handleChange} required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm mb-1">Address / Location</label>
                        <input
                            type="text" name="address"
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={formData.address} onChange={handleChange} required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition font-bold"
                    >
                        Register
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <p className="text-gray-600">Already have an account? <Link to="/login" className="text-green-600 hover:underline">Login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
