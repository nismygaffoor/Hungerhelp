import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    ChevronDown,
    Menu,
    User,
    LayoutDashboard,
    LogOut,
    CheckCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import {
    useNotifications,
    getNotificationText,
    formatNotificationTime,
} from '../hooks/useNotifications';

const ROLE_CONFIG = {
    Donor: {
        labelKey: 'roles.donor',
        badge: 'bg-green-50 text-green-700 border-green-100',
        avatar: 'bg-green-600',
        profile: '/donor/profile',
        dashboard: '/donor/dashboard',
    },
    Beneficiary: {
        labelKey: 'roles.beneficiary',
        badge: 'bg-[#E8F5E9] text-[#1E5144] border-green-100',
        avatar: 'bg-[#1E5144]',
        profile: '/beneficiary/profile',
        dashboard: '/beneficiary/dashboard',
    },
    Volunteer: {
        labelKey: 'roles.volunteer',
        badge: 'bg-[#E8F5E9] text-[#1E5144] border-green-100',
        avatar: 'bg-[#1E5144]',
        profile: '/volunteer/profile',
        dashboard: '/volunteer/dashboard',
    },
    Admin: {
        labelKey: 'roles.admin',
        badge: 'bg-purple-50 text-purple-700 border-purple-100',
        avatar: 'bg-purple-600',
        profile: '/admin/profile',
        dashboard: '/admin/dashboard',
    },
};

const getInitials = (name, role) => {
    if (name) {
        return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
    }
    return role?.[0]?.toUpperCase() || 'U';
};

const Navbar = ({ onMenuClick }) => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        markRead,
        markAllRead,
        refresh,
    } = useNotifications();
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const profileRef = useRef(null);
    const notifRef = useRef(null);

    const roleConfig = ROLE_CONFIG[user?.role] || ROLE_CONFIG.Donor;
    const displayName = user?.name || t('nav.yourProfile');

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
            if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const closeAll = () => {
        setProfileOpen(false);
        setNotifOpen(false);
    };

    const handleLogout = () => {
        closeAll();
        logout();
        navigate(user?.role === 'Admin' ? '/admin/login' : '/login');
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await markRead(notification._id);
        }
        closeAll();
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const handleToggleNotifications = () => {
        const nextOpen = !notifOpen;
        setNotifOpen(nextOpen);
        setProfileOpen(false);
        if (nextOpen) {
            refresh();
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="flex items-center justify-end h-16 px-4 md:px-6">
                <button
                    onClick={onMenuClick}
                    className="md:hidden mr-auto p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
                    aria-label={t('common.openMenu')}
                >
                    <Menu size={22} />
                </button>

                <div className="flex items-center gap-2 md:gap-3">
                    <LanguageSwitcher />

                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={handleToggleNotifications}
                            className="relative p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all"
                            aria-label={t('nav.notifications')}
                        >
                            <Bell size={18} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {notifOpen && (
                            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between gap-2">
                                    <h3 className="text-sm font-bold text-gray-900">{t('nav.notifications')}</h3>
                                    {unreadCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={markAllRead}
                                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1E5144] hover:underline"
                                        >
                                            <CheckCheck size={14} />
                                            {t('notifications.markAllRead')}
                                        </button>
                                    )}
                                </div>

                                {notifications.length === 0 ? (
                                    <div className="px-4 py-8 text-center">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Bell size={20} className="text-gray-300" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-500">{t('nav.noNotifications')}</p>
                                        <p className="text-xs text-gray-400 mt-1">{t('nav.notificationsHint')}</p>
                                    </div>
                                ) : (
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.map((notification) => {
                                            const { title, message } = getNotificationText(notification, t);
                                            return (
                                                <button
                                                    key={notification._id}
                                                    type="button"
                                                    onClick={() => handleNotificationClick(notification)}
                                                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                                                        !notification.read ? 'bg-[#F4FBF6]' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                                                            notification.read ? 'bg-transparent' : 'bg-[#1E5144]'
                                                        }`} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-gray-900 truncate">{title}</p>
                                                            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed line-clamp-2">{message}</p>
                                                            <p className="text-[10px] text-gray-400 font-medium mt-1.5">
                                                                {formatNotificationTime(notification.created_at, t)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => {
                                setProfileOpen(!profileOpen);
                                setNotifOpen(false);
                            }}
                            className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-50 transition-all"
                        >
                            <div className={`w-9 h-9 rounded-xl ${roleConfig.avatar} text-white flex items-center justify-center text-xs font-black shadow-sm shrink-0`}>
                                {getInitials(user?.name, user?.role)}
                            </div>
                            <div className="text-left hidden sm:block">
                                <p className="text-xs font-bold text-gray-900 leading-tight max-w-[140px] truncate">
                                    {displayName}
                                </p>
                                <span className={`inline-flex mt-0.5 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full border ${roleConfig.badge}`}>
                                    {t(roleConfig.labelKey)}
                                </span>
                            </div>
                            <ChevronDown size={14} className={`text-gray-400 hidden sm:block transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {profileOpen && (
                            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                    <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                                    <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                                    <span className={`inline-flex mt-2 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full border ${roleConfig.badge}`}>
                                        {t(roleConfig.labelKey)}
                                    </span>
                                </div>

                                <div className="py-1">
                                    <button
                                        onClick={() => { closeAll(); navigate(roleConfig.dashboard); }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <LayoutDashboard size={16} className="text-gray-400" />
                                        {t('nav.dashboard')}
                                    </button>
                                    <button
                                        onClick={() => { closeAll(); navigate(roleConfig.profile); }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <User size={16} className="text-gray-400" />
                                        {t('nav.yourProfile')}
                                    </button>
                                </div>

                                <div className="border-t border-gray-50 py-1">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut size={16} />
                                        {t('common.logout')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
