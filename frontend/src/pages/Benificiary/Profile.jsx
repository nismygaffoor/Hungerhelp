import { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { translateStatus, CATEGORY_KEY_MAP, URGENCY_KEY_MAP } from '../../i18n/donorVolunteerI18n';

import Sidebar from './Sidebar';

import Navbar from '../../components/Navbar';

import { Shield } from 'lucide-react';

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

    const translateCategory = (c) => {
        const k = CATEGORY_KEY_MAP[c];
        return k ? t(`beneficiary.categories.${k}`) : c;
    };

    const translateUrgency = (u) => {
        const k = URGENCY_KEY_MAP[u];
        return k ? t(`beneficiary.urgency.${k}`) : u;
    };

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

                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t('beneficiary.profileTitle')}</h2>

                        <p className="text-gray-500 text-sm font-medium mt-1">{t('beneficiary.profileSubtitle')}</p>

                    </header>



                    <div className="bg-white rounded-3xl p-6 mb-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">

                        <ProfileAvatar initials={initials} accentClass="bg-[#1E5144]" borderClass="border-green-100" />

                        <div className="text-center md:text-left flex-1">

                            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">

                                <h1 className="text-2xl font-black text-gray-900">{profile?.name}</h1>

                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${

                                    profile?.is_verified ? 'bg-green-50 text-[#1E5144]' : 'bg-amber-50 text-amber-700'

                                }`}>

                                    {profile?.is_verified ? t('beneficiary.verifiedBeneficiary') : t('beneficiary.pendingVerification')}

                                </span>

                            </div>

                            <p className="text-gray-400 font-bold text-[11px] uppercase tracking-wider">

                                {t('beneficiary.memberSince', { date: memberSince })}

                            </p>

                            {profile?.beneficiaryType && (

                                <p className="text-sm text-gray-600 font-medium mt-2">

                                    {profile.beneficiaryType}

                                </p>

                            )}

                        </div>

                    </div>



                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        <div className="lg:col-span-12 xl:col-span-7 space-y-8">

                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

                                <div className="flex justify-between items-center mb-8">

                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{t('beneficiary.personalInformation')}</h3>

                                    <EditProfileButtons

                                        editing={editing}

                                        saving={saving}

                                        onEdit={startEdit}

                                        onSave={saveProfile}

                                        onCancel={cancelEdit}

                                        accentClass="text-[#1E5144]"

                                    />

                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                                    <ProfileField label={t('beneficiary.fullName')} value={profile?.name} field="name" icon="User" editing={editing} formValue={form.name} onChange={handleChange} />

                                    <ProfileField label={t('beneficiary.emailAddress')} value={profile?.email} icon="Mail" />

                                    <ProfileField label={t('beneficiary.phoneNumber')} value={profile?.contact} field="contact" icon="Phone" editing={editing} formValue={form.contact} onChange={handleChange} />

                                    <ProfileAddressField label={t('beneficiary.deliveryAddress')} profile={profile} editing={editing} form={form} onChange={handleChange} />

                                    <ProfileField label={t('beneficiary.beneficiaryType')} value={profile?.beneficiaryType} field="beneficiaryType" icon="User" editing={editing} formValue={form.beneficiaryType} onChange={handleChange} />

                                    <ProfileField label={t('profile.languagePreference')} value={profile?.language} field="language" icon="User" editing={editing} formValue={form.language} onChange={handleChange} />

                                </div>

                            </div>



                            <VerificationUpload profile={profile} onUpdated={refetch} accentClass="bg-[#1E5144] hover:bg-[#163d33]" />

                        </div>



                        <div className="lg:col-span-12 xl:col-span-5 space-y-8">

                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center">

                                <h3 className="text-lg font-black text-gray-900 mb-8 uppercase tracking-tight">{t('beneficiary.yourActivity')}</h3>

                                <div className="grid grid-cols-2 gap-6">

                                    <StatCard value={stats?.total_claims} label={t('beneficiary.totalClaims')} bgClass="bg-[#E8F5E9]" textClass="text-[#1E5144]" />

                                    <StatCard value={stats?.delivered} label={t('status.delivered')} bgClass="bg-green-50" textClass="text-green-700" />

                                    <StatCard value={stats?.active_requests} label={t('beneficiary.activeRequests')} bgClass="bg-amber-50" textClass="text-amber-700" />

                                    <StatCard value={stats?.fulfilled_requests} label={t('beneficiary.matchedRequests')} bgClass="bg-[#E8F5E9]" textClass="text-[#1E5144]" />

                                </div>

                            </div>



                            <div className="bg-[#1E5144] rounded-3xl p-6 shadow-lg text-white relative overflow-hidden">

                                <Shield size={60} className="absolute top-4 right-4 opacity-10" />

                                <h3 className="text-base font-black uppercase tracking-widest mb-2">{t('beneficiary.verificationStatus')}</h3>

                                <p className="text-xl font-black mb-2">{profile?.is_verified ? t('beneficiary.verified') : t('beneficiary.pending')}</p>

                                <p className="text-xs text-green-100/80 leading-relaxed">

                                    {profile?.is_verified

                                        ? t('beneficiary.verifiedAccessMsg')

                                        : profile?.verification_status === 'pending'

                                            ? t('beneficiary.docsUnderReview')

                                            : t('beneficiary.uploadDocsPrompt')}

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

