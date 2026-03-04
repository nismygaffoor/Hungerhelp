import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, ShieldCheck, Lock } from 'lucide-react';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        // Force role to 'Admin' for this page
        const res = await login(email, password, 'Admin');
        if (res.success) {
            navigate('/admin/dashboard');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-gray-900 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 z-0 opacity-20">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            </div>

            {/* Login Card */}
            <div className="relative z-10 bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md mx-4 border border-gray-200">
                
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="text-[#1E5144]" size={36} />
                        <span className="text-3xl font-bold text-[#1E5144] tracking-tight italic">Admin<span className="text-gray-400 font-light">Portal</span></span>
                    </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-700 text-center mb-8">Secure Administrator Access</h2>

                {error && <div className="bg-red-50 text-red-600 p-4 mb-6 rounded-xl text-sm text-center font-medium border border-red-100">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <input
                            type="email"
                            placeholder="Admin Email"
                            className="w-full border-b-2 border-gray-200 py-4 px-2 focus:outline-none focus:border-[#1E5144] transition-colors text-lg"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="relative">
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full border-b-2 border-gray-200 py-4 px-2 focus:outline-none focus:border-[#1E5144] transition-colors text-lg"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#1E5144] text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl hover:bg-[#163d33] transition-all transform active:scale-95 text-lg mt-10 flex items-center justify-center gap-2"
                    >
                        <Lock size={20} />
                        AUTHORIZE ACCESS
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <Link to="/login" className="text-gray-400 text-sm hover:text-[#1E5144] transition-colors underline">
                        Return to Public Login
                    </Link>
                </div>
            </div>
            
            <div className="absolute bottom-6 text-gray-500 text-xs font-medium tracking-widest uppercase">
                HungerHelp Security Protocol v2.1
            </div>
        </div>
    );
};

export default AdminLogin;
