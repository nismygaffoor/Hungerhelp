import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, User, Heart, Truck } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Login = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('donor');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(email, password, selectedRole);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.message || t('auth.loginFailed'));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-gray-50 overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center z-0 opacity-80"
                style={{ backgroundImage: "url('/login-bg.png')" }}
            />

            <div className="absolute top-4 right-4 z-20">
                <LanguageSwitcher />
            </div>

            <div className="relative z-10 bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md mx-4 border border-white/50 backdrop-blur-sm bg-white/95">
                <div className="flex flex-col items-center mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <Leaf className="text-green-600" size={28} />
                        <span className="text-2xl font-bold text-green-700 tracking-tight">Hunger<span className="text-gray-500 font-light">Help</span></span>
                    </div>
                </div>

                <h2 className="text-2xl font-serif font-bold text-gray-700 text-center mb-8">{t('auth.welcomeBack')}</h2>

                <div className="flex justify-center gap-4 mb-10">
                    <RoleToggle
                        id="donor"
                        label={t('auth.imDonor')}
                        icon={<Heart size={20} />}
                        active={selectedRole === 'donor'}
                        onClick={setSelectedRole}
                    />
                    <RoleToggle
                        id="beneficiary"
                        label={t('roles.beneficiary')}
                        icon={<User size={20} />}
                        active={selectedRole === 'beneficiary'}
                        onClick={setSelectedRole}
                    />
                    <RoleToggle
                        id="volunteer"
                        label={t('roles.volunteer')}
                        icon={<Truck size={20} />}
                        active={selectedRole === 'volunteer'}
                        onClick={setSelectedRole}
                    />
                </div>

                {error && <div className="bg-red-100 text-red-700 p-3 mb-6 rounded-lg text-sm text-center font-medium animate-shake">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                        type="text"
                        placeholder={t('auth.emailOrPhone')}
                        className="w-full border-b-2 border-gray-200 py-3 px-4 focus:outline-none focus:border-green-600 transition-colors text-lg"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder={t('auth.password')}
                        className="w-full border-b-2 border-gray-200 py-3 px-4 focus:outline-none focus:border-green-600 transition-colors text-lg"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        className="w-full bg-[#1E5144] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-[#163d33] transition-all transform active:scale-95 text-lg mt-8"
                    >
                        {t('auth.loginButton')}
                    </button>
                </form>

                <div className="mt-8 text-center space-y-2">
                    <p className="text-gray-500 text-sm">
                        {t('auth.noAccount')} <Link to="/register" className="text-green-700 font-bold hover:underline">{t('auth.signUp')}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

const RoleToggle = ({ id, label, icon, active, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={`flex flex-col items-center gap-1 min-w-[100px] py-3 px-2 rounded-2xl border-2 transition-all group
            ${active
                ? 'border-green-600 bg-green-50 text-green-700'
                : 'border-gray-100 bg-white text-gray-400 hover:border-green-200 hover:bg-gray-50'}`}
    >
        <div className={`p-2 rounded-full transition-colors ${active ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-400 group-hover:text-green-600'}`}>
            {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
);

export default Login;
