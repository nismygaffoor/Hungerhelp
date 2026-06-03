import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Leaf } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

const NAV_ITEMS = [
    { key: 'home', path: '/', labelKey: 'nav.home' },
    { key: 'about', path: '/about', labelKey: 'nav.about' },
    { key: 'howItWorks', path: '/how-it-works', labelKey: 'nav.howItWorks' },
    { key: 'contact', path: '/contact', labelKey: 'nav.contact' },
];

const PublicNav = () => {
    const { t } = useTranslation();
    const { pathname } = useLocation();

    const linkClass = (path) => {
        const isActive = path === '/' ? pathname === '/' : pathname.startsWith(path);
        return isActive
            ? 'text-green-600'
            : 'hover:text-green-600 transition-colors';
    };

    return (
        <nav className="flex justify-between items-center p-2 px-8 max-w-8xl mx-auto bg-white border-b border-gray-50">
            <Link to="/" className="text-2xl font-bold flex items-center gap-2">
                <Leaf className="text-green-600" size={28} />
                <span className="text-green-700 tracking-tight">
                    Hunger<span className="text-gray-500 font-light">Help</span>
                </span>
            </Link>
            <div className="hidden md:flex gap-8 font-extrabold text-sm uppercase tracking-wider text-gray-900">
                {NAV_ITEMS.map(({ path, labelKey }) => (
                    <Link key={path} to={path} className={linkClass(path)}>
                        {t(labelKey)}
                    </Link>
                ))}
            </div>
            <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <Link
                    to="/login"
                    className="bg-[#41834F] text-white px-8 py-2 rounded-lg font-bold shadow-md hover:bg-green-800 transition"
                >
                    {t('nav.login')}
                </Link>
            </div>
        </nav>
    );
};

export default PublicNav;
