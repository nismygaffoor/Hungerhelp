import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translateStatus, CATEGORY_KEY_MAP, URGENCY_KEY_MAP } from '../../i18n/donorVolunteerI18n';
import api from '../../api/axios';
import {
    Utensils,
    FileText,
    Loader2,
    Trash2,
    ChevronDown,
    AlertCircle
} from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import LocationFields from '../../components/location/LocationFields';
import { buildLocationAddress } from '../../constants/locations';
import { useDialog } from '../../context/DialogContext';

const CATEGORY_VALUES = Object.keys(CATEGORY_KEY_MAP);
const URGENCY_LEVELS = ['Normal', 'Medium', 'High'];

const RequestFood = () => {
    const { t } = useTranslation();
    const { toast } = useDialog();
    const translateCategory = (c) => {
        const k = CATEGORY_KEY_MAP[c];
        return k ? t(`beneficiary.categories.${k}`) : c;
    };
    const translateUrgency = (u) => {
        const k = URGENCY_KEY_MAP[u];
        return k ? t(`beneficiary.urgency.${k}`) : u;
    };
    const [items, setItems] = useState([{ category: '', name: '', quantity: '' }]);
    const [description, setDescription] = useState('');
    const [district, setDistrict] = useState('');
    const [homeAddress, setHomeAddress] = useState('');
    const [city, setCity] = useState('');
    const [urgency, setUrgency] = useState('Normal');
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { category: '', name: '', quantity: '' }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
        }
    };

    const handleSubmit = async () => {
        const invalidItems = items.some(item => !item.category || !item.quantity);
        if (invalidItems || !district || !city) {
            toast.warning(t('beneficiary.fillRequiredFields'));
            return;
        }

        setLoading(true);
        try {
            const payload = {
                items: items.map(item => ({
                    category: item.category,
                    name: item.name || '',
                    quantity: item.quantity
                })),
                food_type: items.map(i => i.category).join(', '),
                quantity: items.map(i => i.quantity).join(', '),
                location: buildLocationAddress({ district, homeAddress, city }),
                district,
                home_address: homeAddress,
                city,
                description: description,
                urgency: urgency
            };

            await api.post('/requests/', payload);

            toast.success(t('beneficiary.requestSubmitted'));
            setItems([{ category: '', name: '', quantity: '' }]);
            setDescription('');
            setUrgency('Normal');
        } catch (err) {
            toast.error(t('beneficiary.requestSubmitFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
 
            <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-white min-h-screen`}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
                    <header className="mb-8 text-left">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t('beneficiary.requestFoodTitle')}</h2>
                        <p className="text-gray-500 font-medium mt-1">{t('beneficiary.requestFoodSubtitle')}</p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 space-y-8">
                            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                                <h3 className="text-lg font-black mb-6 text-gray-800 flex items-center gap-2">
                                    <Utensils className="text-green-600" size={20} />
                                    {t('beneficiary.neededItems')}
                                </h3>
                                <div className="space-y-4">
                                    {items.map((item, index) => (
                                        <div key={index} className="flex flex-col md:flex-row items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-green-200 transition-all">
                                            <div className="w-full md:flex-[2] relative">
                                                <select
                                                    className="w-full border border-gray-100 bg-white rounded-xl pl-3 pr-8 py-2.5 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all text-sm font-bold appearance-none cursor-pointer"
                                                    value={item.category}
                                                    onChange={e => handleItemChange(index, 'category', e.target.value)}
                                                >
                                                    <option value="" disabled>{t('beneficiary.selectCategory')}</option>
                                                    {CATEGORY_VALUES.map((cat) => (
                                                        <option key={cat} value={cat}>{translateCategory(cat)}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                                            </div>

                                            <div className="w-full md:flex-[2] relative">
                                                <input
                                                    type="text"
                                                    placeholder={t('beneficiary.itemNameOptional')}
                                                    className="w-full border border-gray-100 bg-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all text-sm font-bold"
                                                    value={item.name}
                                                    onChange={e => handleItemChange(index, 'name', e.target.value)}
                                                />
                                            </div>

                                            <div className="w-full md:flex-1 relative">
                                                <input
                                                    type="text"
                                                    placeholder={t('beneficiary.qty')}
                                                    className="w-full border border-gray-100 bg-white rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all text-sm font-bold"
                                                    value={item.quantity}
                                                    onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                                />
                                            </div>

                                            {items.length > 1 && (
                                                <button
                                                    onClick={() => removeItem(index)}
                                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={addItem}
                                    className="text-[10px] font-black text-green-600 hover:text-green-700 uppercase tracking-widest flex items-center gap-2 mt-4 transition-all hover:translate-x-1"
                                >
                                    {t('beneficiary.addAnotherItem')}
                                </button>
                            </div>

                            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                                <h3 className="text-lg font-black mb-6 text-gray-800 flex items-center gap-2">
                                    <FileText className="text-green-600" size={20} />
                                    {t('beneficiary.additionalDetails')}
                                </h3>
                                <textarea
                                    rows="4"
                                    placeholder={t('beneficiary.descriptionPlaceholder')}
                                    className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-green-500/20 focus:bg-white focus:outline-none transition-all text-sm font-medium resize-none"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                                <h3 className="text-lg font-black mb-6 text-gray-800">{t('beneficiary.logistics')}</h3>
                                <div className="space-y-6">
                                    <div>
                                        <LocationFields
                                            compact
                                            district={district}
                                            homeAddress={homeAddress}
                                            city={city}
                                            onDistrictChange={setDistrict}
                                            onHomeAddressChange={setHomeAddress}
                                            onCityChange={setCity}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">{t('beneficiary.urgencyLevel')}</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {URGENCY_LEVELS.map((level) => (
                                                <button
                                                    key={level}
                                                    onClick={() => setUrgency(level)}
                                                    className={`py-2 text-[10px] font-black rounded-xl border transition-all uppercase tracking-widest ${
                                                        urgency === level 
                                                        ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/20' 
                                                        : 'bg-white border-gray-100 text-gray-400 hover:border-green-200'
                                                    }`}
                                                >
                                                    {translateUrgency(level)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-green-900 rounded-[2rem] p-8 shadow-xl text-white">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                                        <AlertCircle size={24} className="text-green-300" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black uppercase tracking-widest text-green-300 mb-2">{t('beneficiary.notice')}</h4>
                                        <p className="text-xs font-medium text-green-50/80 leading-relaxed">
                                            {t('beneficiary.noticeText')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full bg-[#43A047] hover:bg-[#2E7D32] text-white font-black py-4 rounded-2xl shadow-lg shadow-green-600/20 transition-all transform active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : t('beneficiary.submitRequest')}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RequestFood;
