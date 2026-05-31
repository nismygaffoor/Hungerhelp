import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import { Shield } from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import {
    ProfileField,
    ProfileLoading,
    ProfileAvatar,
    EditProfileButtons,
    StatCard,
} from '../../components/profile/ProfileShared';

const Profile = () => {
    const { t } = useTranslation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const {
        profile, stats, loading, saving, editing, form,
        startEdit, cancelEdit, handleChange, saveProfile, memberSince, initials
    } = useProfile();

    if (loading) {
        return (
            <div className="flex min-h-screen bg-white">
                <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
                    <Navbar onMenuClick={() => setSidebarOpen(true)} />
                    <ProfileLoading />
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-white min-h-screen`}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <div className="p-4 md:p-6 lg:p-8">
                    <header className="mb-6">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t('admin.profileTitle')}</h2>
                        <p className="text-gray-500 text-sm font-medium mt-1">{t('admin.profileSubtitle')}</p>
                    </header>

                    <div className="bg-white rounded-3xl p-6 mb-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 border-l-8 border-gray-900">
                        <ProfileAvatar initials={initials} accentClass="bg-gray-900" borderClass="border-gray-200" />
                        <div className="text-center md:text-left flex-1">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                                <h1 className="text-2xl font-black text-gray-900">{profile?.name}</h1>
                                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest">
                                    {t('admin.administrator')}
                                </span>
                            </div>
                            <p className="text-gray-400 font-bold text-[11px] uppercase tracking-wider">
                                {t('beneficiary.memberSince', { date: memberSince })}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-12 xl:col-span-7 space-y-8">
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{t('admin.adminCredentials')}</h3>
                                    <EditProfileButtons
                                        editing={editing}
                                        saving={saving}
                                        onEdit={startEdit}
                                        onSave={saveProfile}
                                        onCancel={cancelEdit}
                                        accentClass="text-gray-900"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <ProfileField label={t('beneficiary.fullName')} value={profile?.name} field="name" icon="User" editing={editing} formValue={form.name} onChange={handleChange} />
                                    <ProfileField label={t('admin.adminEmail')} value={profile?.email} icon="Mail" />
                                    <ProfileField label={t('admin.contactNumber')} value={profile?.contact} field="contact" icon="Phone" editing={editing} formValue={form.contact} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center">
                                <h3 className="text-lg font-black text-gray-900 mb-8 uppercase tracking-tight">{t('admin.platformOverview')}</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <StatCard value={stats?.total_users} label={t('admin.totalUsers')} bgClass="bg-gray-50" textClass="text-gray-900" />
                                    <StatCard value={stats?.food_posts} label={t('admin.foodPosts')} bgClass="bg-gray-50" textClass="text-gray-900" />
                                    <StatCard value={stats?.deliveries} label={t('admin.deliveries')} bgClass="bg-gray-50" textClass="text-gray-900" />
                                    <StatCard value={stats?.pending_verifications} label={t('admin.pendingVerifications')} bgClass="bg-amber-50" textClass="text-amber-700" />
                                </div>
                            </div>

                            <div className="bg-gray-900 rounded-3xl p-6 shadow-lg text-white">
                                <Shield size={32} className="mb-3 opacity-80" />
                                <h3 className="text-base font-black uppercase tracking-widest mb-2">{t('admin.adminAccess')}</h3>
                                <p className="text-xs text-gray-300 leading-relaxed">
                                    {t('admin.adminAccessDesc')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
