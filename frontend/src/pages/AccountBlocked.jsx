import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldX, LogOut } from 'lucide-react';

const AccountBlocked = () => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl border border-red-100 max-w-md w-full p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
                    <ShieldX className="text-red-500" size={32} />
                </div>
                <h1 className="text-xl font-black text-gray-900 mb-2">{t('accountBlocked.title')}</h1>
                <p className="text-sm text-gray-600 mb-4">
                    {t('accountBlocked.description')}
                </p>
                {user?.rejection_reason && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-left">
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">{t('accountBlocked.reason')}</p>
                        <p className="text-sm text-red-800">{user.rejection_reason}</p>
                    </div>
                )}
                <p className="text-xs text-gray-400 mb-6">
                    {t('accountBlocked.contactAdmin')}
                </p>
                <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-all"
                >
                    <LogOut size={16} />
                    {t('common.logout')}
                </button>
            </div>
        </div>
    );
};

export default AccountBlocked;
