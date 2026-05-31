import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { translateStatus, CATEGORY_KEY_MAP, URGENCY_KEY_MAP } from '../../i18n/donorVolunteerI18n';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
    Search,
    ChevronDown
} from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';

const MyClaims = () => {
    const { t } = useTranslation();
    const translateCategory = (c) => {
        const k = CATEGORY_KEY_MAP[c];
        return k ? t(`beneficiary.categories.${k}`) : c;
    };
    const translateUrgency = (u) => {
        const k = URGENCY_KEY_MAP[u];
        return k ? t(`beneficiary.urgency.${k}`) : u;
    };
    const navigate = useNavigate();
    const { user } = useAuth();
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const backendUrl = 'http://localhost:5000/uploads/';

    useEffect(() => {
        const fetchClaims = async () => {
            try {
                const res = await api.get('/claims/my-claims');
                setClaims(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchClaims();
    }, []);

    const getPlaceholderImage = (idx) => {
        return null;
    };

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-white min-h-screen`}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto">
                    <header className="mb-8 text-left">
                        <h2 className="text-3xl font-bold text-gray-900 leading-tight">{t('beneficiary.myClaimsTitle')}</h2>
                    </header>

                    <div className="flex flex-wrap items-center gap-4 mb-8">
                        <FilterButton label={t('beneficiary.all')} />
                        <FilterButton label={t('beneficiary.foodType')} />

                        <div className="relative flex-1 max-w-md ml-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder={t('common.search')}
                                className="w-full bg-white border border-gray-100 rounded-lg pl-12 pr-4 py-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus:ring-2 focus:ring-green-500/20 focus:outline-none text-sm placeholder-gray-400"
                            />
                        </div>
                    </div>

                    <div className="space-y-8 animate-fade-in relative mt-10">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E5144]"></div>
                            </div>
                        ) : claims.length === 0 ? (
                            <div className="text-center p-10">
                                <p className="text-gray-500 font-medium">{t('beneficiary.noClaimsYetShort')}</p>
                            </div>
                        ) : (
                            claims.map((claim) => {
                                const displayImages = [];
                                const postImages = claim.images || [];

                                if (postImages.length > 0) {
                                    postImages.forEach(img => {
                                        displayImages.push(img.startsWith('http') ? img : `${backendUrl}${img}`);
                                    });
                                } else {
                                    for (let i = 0; i < 4; i++) {
                                        displayImages.push(getPlaceholderImage(i));
                                    }
                                }

                                return (
                                    <div key={claim.id} className="bg-white rounded-xl p-5 border border-red-100 shadow-sm relative hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-center">
                                        <div className={`grid gap-2 w-full md:w-44 flex-shrink-0 ${displayImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                            {displayImages.slice(0, 4).map((img, i) => (
                                                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                                                    {img ? (
                                                        <img
                                                            src={img}
                                                            className="w-full h-full object-cover"
                                                            alt={t('beneficiary.foodItemAlt')}
                                                        />
                                                    ) : (
                                                        <Search className="text-gray-300" size={24} />
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex-1 w-full text-left self-start py-2">
                                            <div className="mb-4">
                                                <h3 className="text-base font-bold text-gray-800 mb-1">{claim.food_type.split(' - ')[0]}</h3>
                                            </div>

                                            <p className="text-sm font-bold text-gray-700 mt-2">
                                                {t('beneficiary.donatedBy')} <span className="text-gray-900">{claim.donor_name || t('beneficiary.unknownDonor')}</span>
                                            </p>
                                        </div>

                                        <div className="flex flex-row md:flex-col gap-3 min-w-[140px] items-center md:items-end justify-center w-full md:w-auto mt-4 md:mt-0">
                                            <span className={`px-5 py-2 rounded-full font-bold text-[11px] shadow-sm min-w-[120px] text-center ${claim.status === 'Pending Pickup' ? 'bg-[#98E158] text-white' :
                                                    claim.status === 'Delivered' ? 'bg-[#66BB6A] text-white' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {translateStatus(claim.status, t)}
                                            </span>
                                            <button
                                                onClick={() => navigate(`/beneficiary/donation/${claim.post_id}`, { state: { from: '/beneficiary/history' } })}
                                                className="px-5 py-2 rounded-full font-bold text-gray-500 bg-[#C4C4C4] hover:bg-gray-400 transition-all text-[11px] min-w-[120px]"
                                            >
                                                {t('beneficiary.viewDetails')}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

const FilterButton = ({ label }) => (
    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded min-w-[100px] justify-between text-xs font-semibold text-gray-400 hover:text-green-600 hover:border-green-200 transition-all shadow-sm">
        {label}
        <ChevronDown size={14} className="text-gray-300" />
    </button>
);

export default MyClaims;
