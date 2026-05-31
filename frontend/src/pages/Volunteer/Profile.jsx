import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import { useProfile } from '../../hooks/useProfile';
import {
    ProfileField,
    ProfileAddressField,
    ProfileLoading,
    ProfileAvatar,
    EditProfileButtons,
    StatCard,
} from '../../components/profile/ProfileShared';
import VerificationUpload from '../../components/profile/VerificationUpload';

const Profile = () => {
    const { t } = useTranslation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const {
        profile, stats, loading, saving, editing, form,
        startEdit, cancelEdit, handleChange, saveProfile, memberSince, initials, refetch
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
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t('volunteer.profile.title')}</h2>
                        <p className="text-gray-500 text-sm font-medium mt-1">{t('volunteer.profile.subtitle')}</p>
                    </header>

                    <div className="bg-white rounded-3xl p-6 mb-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">
                        <ProfileAvatar initials={initials} accentClass="bg-[#1E5144]" borderClass="border-amber-100" />
                        <div className="text-center md:text-left flex-1">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                                <h1 className="text-2xl font-black text-gray-900">{profile?.name}</h1>
                                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest">
                                    {t('roles.volunteer')}
                                </span>
                            </div>
                            <p className="text-gray-400 font-bold text-[11px] uppercase tracking-wider">{t('volunteer.profile.memberSince', { date: memberSince })}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-12 xl:col-span-7 space-y-8">
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{t('volunteer.profile.personalDetails')}</h3>
                                    <EditProfileButtons
                                        editing={editing}
                                        saving={saving}
                                        onEdit={startEdit}
                                        onSave={saveProfile}
                                        onCancel={cancelEdit}
                                        accentClass="text-amber-700"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <ProfileField label={t('volunteer.profile.fullName')} value={profile?.name} field="name" icon="User" editing={editing} formValue={form.name} onChange={handleChange} />
                                    <ProfileField label={t('volunteer.profile.email')} value={profile?.email} icon="Mail" />
                                    <ProfileField label={t('volunteer.profile.phone')} value={profile?.contact} field="contact" icon="Phone" editing={editing} formValue={form.contact} onChange={handleChange} />
                                    <ProfileAddressField label={t('volunteer.profile.address')} profile={profile} editing={editing} form={form} onChange={handleChange} />
                                    <div className="md:col-span-2">
                                        <ProfileField label={t('volunteer.profile.experience')} value={profile?.experience} field="experience" icon="User" editing={editing} formValue={form.experience} onChange={handleChange} type="textarea" />
                                    </div>
                                </div>
                            </div>

                            <VerificationUpload profile={profile} onUpdated={refetch} accentClass="bg-amber-600 hover:bg-amber-700" />
                        </div>

                        <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center">
                                <h3 className="text-lg font-black text-gray-900 mb-8 uppercase tracking-tight">{t('volunteer.profile.deliveryStats')}</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <StatCard value={stats?.total_deliveries} label={t('volunteer.profile.totalDeliveries')} bgClass="bg-amber-50" textClass="text-amber-700" />
                                    <StatCard value={stats?.completed} label={t('volunteer.profile.completed')} bgClass="bg-green-50" textClass="text-green-700" />
                                    <StatCard value={stats?.active} label={t('volunteer.profile.activeTasks')} bgClass="bg-blue-50" textClass="text-blue-700" />
                                    <StatCard value={stats?.pending_accepted} label={t('volunteer.profile.awaitingPickup')} bgClass="bg-purple-50" textClass="text-purple-700" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
