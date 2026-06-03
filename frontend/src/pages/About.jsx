import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Leaf, Users, Heart } from 'lucide-react';
import PublicNav from '../components/PublicNav';

const About = () => {
    const { t } = useTranslation();

    const timelineItems = [
        { year: t('about.timeline1Year'), label: t('about.timeline1Label'), active: true },
        { year: t('about.timeline2Year'), label: t('about.timeline2Label') },
        { year: t('about.timeline3Year'), label: t('about.timeline3Label') },
        { year: t('about.timeline4Year'), label: t('about.timeline4Label') },
        { year: t('about.timeline5Year'), label: t('about.timeline5Label') },
    ];

    return (
        <div className="font-sans bg-white text-gray-800 min-h-screen">
            <PublicNav />

            <div className="max-w-7xl mx-auto px-6 py-16">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-16 tracking-tight">{t('about.missionTitle')}</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
                    <div className="rounded-[3rem] overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-700 aspect-[4/3]">
                        <img
                            src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop"
                            alt={t('about.imageAlt')}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="space-y-8">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 leading-tight">
                            {t('about.missionHeading')}
                        </h2>
                        <div className="space-y-6 text-gray-500 text-lg leading-relaxed font-medium">
                            <p>{t('about.missionText')}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-32 px-4">
                    <ValueCard
                        icon={<Leaf size={32} className="text-green-600" />}
                        title={t('about.valueSustainability')}
                        text={t('about.valueSustainabilityDesc')}
                    />
                    <ValueCard
                        icon={<Users size={32} className="text-green-600" />}
                        title={t('about.valueCommunity')}
                        text={t('about.valueCommunityDesc')}
                    />
                    <ValueCard
                        icon={<Heart size={32} className="text-green-600" />}
                        title={t('about.valueTrust')}
                        text={t('about.valueTrustDesc')}
                    />
                </div>

                <div className="mt-40 mb-20">
                    <h3 className="text-2xl font-black text-gray-900 mb-20 px-4">{t('about.timelineTitle')}</h3>

                    <div className="relative pt-20 pb-10">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-green-200 -translate-y-[62px]" />

                        <div className="grid grid-cols-6 gap-2">
                            {timelineItems.map((item, index) => (
                                <TimelineItem key={index} {...item} />
                            ))}
                            <div className="relative flex flex-col items-center group">
                                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-green-600 border-4 border-white shadow-md z-10" />
                                <div className="text-center mt-4">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-tight">{t('about.timelineLatestYear')}</p>
                                    <p className="text-xs font-bold text-gray-800 mt-1 uppercase">{t('about.timelineLatestLabel')}</p>
                                </div>
                                <div className="mt-8">
                                    <Link
                                        to="/register"
                                        className="inline-block bg-[#41834F] text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-green-800 transition-all transform hover:scale-105 active:scale-95"
                                    >
                                        {t('about.claimMeal')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="py-8 bg-gray-50 text-center border-t border-gray-100">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('about.footer')}</p>
            </footer>
        </div>
    );
};

const ValueCard = ({ icon, title, text }) => (
    <div className="bg-white rounded-[2.5rem] p-12 text-center border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-500 group">
        <div className="bg-green-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500">
            {icon}
        </div>
        <h4 className="text-xl font-black text-gray-800 mb-4 tracking-tight">{title}</h4>
        <p className="text-sm text-gray-400 font-bold leading-relaxed">{text}</p>
    </div>
);

const TimelineItem = ({ year, label, active = false }) => (
    <div className="relative flex flex-col items-center">
        <div className={`absolute -top-16 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full ${active ? 'bg-green-600 ring-4 ring-green-100' : 'bg-green-300'} border-4 border-white shadow-sm z-10 transition-colors`} />
        <div className="text-center mt-4 px-2">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-tight h-8 flex items-end justify-center">{year}</p>
            <p className="text-xs font-bold text-gray-800 mt-2 uppercase">{label}</p>
        </div>
    </div>
);

export default About;
