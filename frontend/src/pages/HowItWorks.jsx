import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    UserPlus,
    ShieldCheck,
    UtensilsCrossed,
    HandHeart,
    Truck,
    Bell,
    MessageSquare,
    BarChart3,
    ArrowRight,
} from 'lucide-react';
import PublicNav from '../components/PublicNav';

const FLOW_STEPS = [
    { icon: UserPlus, titleKey: 'howItWorks.flowStep1Title', descKey: 'howItWorks.flowStep1Desc' },
    { icon: ShieldCheck, titleKey: 'howItWorks.flowStep2Title', descKey: 'howItWorks.flowStep2Desc' },
    { icon: UtensilsCrossed, titleKey: 'howItWorks.flowStep3Title', descKey: 'howItWorks.flowStep3Desc' },
    { icon: HandHeart, titleKey: 'howItWorks.flowStep4Title', descKey: 'howItWorks.flowStep4Desc' },
    { icon: Truck, titleKey: 'howItWorks.flowStep5Title', descKey: 'howItWorks.flowStep5Desc' },
    { icon: Bell, titleKey: 'howItWorks.flowStep6Title', descKey: 'howItWorks.flowStep6Desc' },
];

const ROLE_CARDS = [
    { roleKey: 'roles.donor', titleKey: 'howItWorks.donorTitle', descKey: 'howItWorks.donorDesc', color: 'bg-orange-50 text-orange-700' },
    { roleKey: 'roles.beneficiary', titleKey: 'howItWorks.beneficiaryTitle', descKey: 'howItWorks.beneficiaryDesc', color: 'bg-blue-50 text-blue-700' },
    { roleKey: 'roles.volunteer', titleKey: 'howItWorks.volunteerTitle', descKey: 'howItWorks.volunteerDesc', color: 'bg-purple-50 text-purple-700' },
    { roleKey: 'roles.admin', titleKey: 'howItWorks.adminTitle', descKey: 'howItWorks.adminDesc', color: 'bg-green-50 text-green-700' },
];

const HowItWorks = () => {
    const { t } = useTranslation();

    return (
        <div className="font-sans bg-white text-gray-800 min-h-screen">
            <PublicNav />

            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="text-center mb-20">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                        {t('howItWorks.pageTitle')}
                    </h1>
                    <p className="text-lg text-gray-500 font-medium max-w-3xl mx-auto leading-relaxed">
                        {t('howItWorks.pageSubtitle')}
                    </p>
                </div>

                <section className="mb-24">
                    <h2 className="text-2xl font-black text-gray-900 mb-12 text-center">
                        {t('howItWorks.flowTitle')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {FLOW_STEPS.map(({ icon: Icon, titleKey, descKey }, index) => (
                            <div
                                key={titleKey}
                                className="relative bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-500"
                            >
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] flex items-center justify-center">
                                        <Icon size={22} className="text-[#1E5144]" />
                                    </div>
                                    <span className="text-xs font-black text-gray-300 uppercase tracking-widest">
                                        {t('howItWorks.stepLabel', { number: index + 1 })}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-gray-800 mb-3">{t(titleKey)}</h3>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">{t(descKey)}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-24">
                    <h2 className="text-2xl font-black text-gray-900 mb-12 text-center">
                        {t('howItWorks.rolesTitle')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {ROLE_CARDS.map(({ roleKey, titleKey, descKey, color }) => (
                            <div
                                key={titleKey}
                                className="rounded-[2rem] p-8 border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)]"
                            >
                                <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4 ${color}`}>
                                    {t(roleKey)}
                                </span>
                                <h3 className="text-xl font-black text-gray-800 mb-3">{t(titleKey)}</h3>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">{t(descKey)}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
                    <div className="rounded-[2.5rem] p-10 bg-gradient-to-br from-[#1E5144] to-[#41834F] text-white">
                        <div className="flex items-center gap-3 mb-6">
                            <MessageSquare size={28} />
                            <h2 className="text-2xl font-black">{t('howItWorks.smsTitle')}</h2>
                        </div>
                        <p className="text-green-100 font-medium leading-relaxed mb-6">
                            {t('howItWorks.smsDesc')}
                        </p>
                        <ul className="space-y-3 text-sm font-bold text-green-50">
                            <li className="flex items-start gap-2">
                                <ArrowRight size={16} className="shrink-0 mt-0.5" />
                                {t('howItWorks.smsPoint1')}
                            </li>
                            <li className="flex items-start gap-2">
                                <ArrowRight size={16} className="shrink-0 mt-0.5" />
                                {t('howItWorks.smsPoint2')}
                            </li>
                            <li className="flex items-start gap-2">
                                <ArrowRight size={16} className="shrink-0 mt-0.5" />
                                {t('howItWorks.smsPoint3')}
                            </li>
                        </ul>
                    </div>

                    <div className="rounded-[2.5rem] p-10 bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <BarChart3 size={28} className="text-[#1E5144]" />
                            <h2 className="text-2xl font-black text-gray-900">{t('howItWorks.trackingTitle')}</h2>
                        </div>
                        <p className="text-gray-500 font-medium leading-relaxed mb-6">
                            {t('howItWorks.trackingDesc')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['Pending', 'Assigned', 'In Transit', 'Delivered'].map((status) => (
                                <span
                                    key={status}
                                    className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600"
                                >
                                    {status}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="text-center bg-orange-50 rounded-[3rem] p-12 border border-orange-100">
                    <h2 className="text-3xl font-black text-gray-900 mb-4">{t('howItWorks.ctaTitle')}</h2>
                    <p className="text-gray-500 font-medium mb-8 max-w-xl mx-auto">{t('howItWorks.ctaDesc')}</p>
                    <Link
                        to="/register"
                        className="inline-block bg-[#41834F] text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-800 transition-all transform hover:scale-105"
                    >
                        {t('howItWorks.ctaButton')}
                    </Link>
                </div>
            </div>

            <footer className="py-8 bg-gray-50 text-center border-t border-gray-100">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('about.footer')}</p>
            </footer>
        </div>
    );
};

export default HowItWorks;
