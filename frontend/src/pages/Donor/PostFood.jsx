import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import {
    CATEGORY_KEY_MAP,
    BENEFICIARY_TYPE_KEY_MAP,
    translateBeneficiaryType,
} from '../../i18n/donorVolunteerI18n';
import api from '../../api/axios';
import {
    Camera,
    Clock,
    Utensils,
    Scale,
    FileText,
    Loader2,
    Trash2,
    ChevronDown
} from 'lucide-react';
import Sidebar from './Sidebar';
import Navbar from '../../components/Navbar';
import LocationFields from '../../components/location/LocationFields';
import { buildLocationAddress } from '../../constants/locations';
import { useDialog } from '../../context/DialogContext';

const FREQUENCY_OPTIONS = [
    { value: 'Daily', key: 'daily' },
    { value: 'Weekly', key: 'weekly' },
    { value: 'Monthly', key: 'monthly' },
];

const DAY_OPTIONS = [
    { value: 'Monday', key: 'monday' },
    { value: 'Tuesday', key: 'tuesday' },
    { value: 'Wednesday', key: 'wednesday' },
    { value: 'Thursday', key: 'thursday' },
    { value: 'Friday', key: 'friday' },
    { value: 'Saturday', key: 'saturday' },
    { value: 'Sunday', key: 'sunday' },
];

const PostFood = () => {
    const { t } = useTranslation();
    const { toast } = useDialog();
    const locationState = useLocation();
    const [items, setItems] = useState([{ category: '', name: '', quantity: '', images: [], previews: [] }]);
    const [description, setDescription] = useState('');
    const [district, setDistrict] = useState('');
    const [homeAddress, setHomeAddress] = useState('');
    const [city, setCity] = useState('');
    const [pickupTimes, setPickupTimes] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);
    const [isRecurring, setIsRecurring] = useState(false);
    const [frequency, setFrequency] = useState('Weekly');
    const [recurringDay, setRecurringDay] = useState('Monday');
    const [destinationType, setDestinationType] = useState('');
    const [destinationName, setDestinationName] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isValidBeneficiary, setIsValidBeneficiary] = useState(true);
    const [beneficiarySearchLoading, setBeneficiarySearchLoading] = useState(false);
    const suggestionRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [expiryDate, setExpiryDate] = useState(() => {
        const date = new Date();
        date.setHours(date.getHours() + 24);
        return date.toISOString().slice(0, 16);
    });

    const [matchRequestId, setMatchRequestId] = useState(null);
    const [matchBeneficiaryId, setMatchBeneficiaryId] = useState(null);

    useEffect(() => {
        if (locationState.state?.matchRequest) {
            const { requestId, beneficiaryId, items: matchedItems, beneficiaryName, beneficiaryType } = locationState.state.matchRequest;
            
            setMatchRequestId(requestId);
            setMatchBeneficiaryId(beneficiaryId);

            const formattedItems = matchedItems.map(item => ({
                category: item.category,
                name: item.name || '',
                quantity: item.quantity,
                images: [],
                previews: []
            }));

            setItems(formattedItems);
            setDestinationName(beneficiaryName);
            setDestinationType(beneficiaryType);
            setIsUrgent(locationState.state.matchRequest.urgency === 'High');
            
            window.history.replaceState({}, document.title);
        }
    }, [locationState.state]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBeneficiarySearch = (query) => {
        setDestinationName(query);
        if (query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setBeneficiarySearchLoading(true);
        api.get(`/users/search-beneficiaries?q=${query}`)
            .then(res => {
                setSuggestions(res.data);
                setShowSuggestions(true);
            })
            .catch(err => console.error("Search failed", err))
            .finally(() => setBeneficiarySearchLoading(false));
    };

    const handleBeneficiarySelect = (beneficiary) => {
        setDestinationName(beneficiary.name);
        setIsValidBeneficiary(true);
        setShowSuggestions(false);
        if (beneficiary.beneficiaryType) {
            setDestinationType(beneficiary.beneficiaryType);
        }
    };

    const validateBeneficiary = async () => {
        if (!destinationName.trim()) {
            setIsValidBeneficiary(true);
            return;
        }
        try {
            const res = await api.get(`/users/verify-beneficiary?name=${encodeURIComponent(destinationName)}`);
            setIsValidBeneficiary(res.data.valid);
        } catch (err) {
            console.error("Validation failed", err);
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { category: '', name: '', quantity: '', images: [], previews: [] }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
        }
    };

    const handleItemImageChange = (index, e) => {
        const files = Array.from(e.target.files);
        const currentItem = items[index];

        if (currentItem.images.length + files.length > 1) {
            toast.warning(t('donor.postFood.maxImageAlert'));
            return;
        }

        const newItems = [...items];
        newItems[index].images = [...currentItem.images, ...files];
        const newPreviews = files.map(file => URL.createObjectURL(file));
        newItems[index].previews = [...currentItem.previews, ...newPreviews];
        setItems(newItems);
    };

    const removeItemImage = (itemIndex, imageIndex) => {
        const newItems = [...items];
        const item = newItems[itemIndex];

        const newImages = [...item.images];
        newImages.splice(imageIndex, 1);
        item.images = newImages;

        const newPreviews = [...item.previews];
        newPreviews.splice(imageIndex, 1);
        item.previews = newPreviews;

        setItems(newItems);
    };

    const handlePost = async () => {
        const invalidItems = items.some(item => !item.category || !item.quantity);
        if (invalidItems || !district || !city) {
            toast.warning(t('donor.postFood.requiredFieldsAlert'));
            return;
        }

        setLoading(true);
        try {
            const foodTypeString = items.map(i => i.category).join(', ');
            const quantityString = items.map(i => i.quantity).join(', ');
            const finalFoodType = description ? `${foodTypeString} - ${description}` : foodTypeString;

            const formData = new FormData();
            formData.append('food_type', finalFoodType);
            formData.append('quantity', quantityString);
            formData.append('district', district);
            formData.append('home_address', homeAddress);
            formData.append('city', city);
            formData.append('pickup_times', pickupTimes);
            formData.append('location', buildLocationAddress({ district, homeAddress, city }));
            formData.append('expiry_time', new Date(expiryDate).toISOString());
            formData.append('description', description);
            formData.append('is_recurring', isRecurring);
            formData.append('is_urgent', isUrgent);
            formData.append('destination_type', destinationType);
            formData.append('destination_name', destinationName.trim());

            if (matchRequestId) {
                formData.append('request_id', matchRequestId);
                formData.append('beneficiary_id', matchBeneficiaryId);
            }

            const itemsForJson = items.map(item => ({
                category: item.category,
                name: item.name || '',
                quantity: item.quantity
            }));
            formData.append('items', JSON.stringify(itemsForJson));

            if (isRecurring) {
                formData.append('frequency', frequency);
                formData.append('day', recurringDay);
            }

            items.forEach((item, index) => {
                item.images.forEach((image) => {
                    formData.append(`item_images_${index}`, image);
                });
            });

            const endpoint = matchRequestId ? '/food/fulfill-request' : '/food/';
            await api.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success(matchRequestId ? t('donor.postFood.fulfillSuccess') : t('donor.postFood.postSuccess'));
            
            setItems([{ category: '', name: '', quantity: '', images: [], previews: [] }]);
            setDescription('');
            setPickupTimes('');
            setIsUrgent(false);
            setMatchRequestId(null);
            setMatchBeneficiaryId(null);
            setDestinationType('');
            setDestinationName('');
        } catch (err) {
            toast.error(t('donor.postFood.postFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white font-sans text-gray-800">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
 
            <main className={`flex-1 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'} bg-white min-h-screen`}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <div className="p-4 md:p-6">
                    <header className="mb-6 text-left">
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">{t('donor.postFood.title')}</h2>
                        <p className="text-gray-500 text-sm mt-1">{t('donor.postFood.subtitle')}</p>
                    </header>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                        <h3 className="text-xl font-bold mb-6 text-gray-800">{t('donor.postFood.foodDetails')}</h3>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-gray-600">{t('donor.postFood.donatedItems')}</label>
                                <div className="space-y-3">
                                    {items.map((item, index) => (
                                        <div key={index} className="flex flex-col md:flex-row items-center gap-3 p-3 bg-gray-50/50 rounded-2xl border border-gray-100 animate-fade-in group hover:bg-gray-50 hover:border-gray-200 transition-all">
                                            <div className="w-full md:flex-[2] relative">
                                                <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <select
                                                    className="w-full border border-gray-100 bg-white rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all text-sm appearance-none cursor-pointer"
                                                    value={item.category}
                                                    onChange={e => handleItemChange(index, 'category', e.target.value)}
                                                >
                                                    <option value="" disabled>{t('donor.postFood.selectType')}</option>
                                                    {Object.entries(CATEGORY_KEY_MAP).map(([value, key]) => (
                                                        <option key={value} value={value}>{t(`donor.categories.${key}`)}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                                            </div>

                                            <div className="w-full md:flex-[2] relative">
                                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input
                                                    type="text"
                                                    placeholder={t('donor.postFood.itemNamePlaceholder')}
                                                    className="w-full border border-gray-100 bg-white rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all text-sm"
                                                    value={item.name || ''}
                                                    onChange={e => handleItemChange(index, 'name', e.target.value)}
                                                />
                                            </div>

                                            <div className="w-full md:flex-1 relative">
                                                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                <input
                                                    type="text"
                                                    placeholder={t('donor.postFood.qty')}
                                                    className="w-full border border-gray-100 bg-white rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all text-sm"
                                                    value={item.quantity}
                                                    onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                                />
                                            </div>

                                            <div className="flex items-center gap-2 px-1">
                                                <div className="flex gap-1.5 scrollbar-none overflow-x-auto max-w-[120px]">
                                                    {item.previews.map((preview, imgIndex) => (
                                                        <div key={imgIndex} className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 shadow-sm border border-white">
                                                            <img src={preview} alt="preview" className="w-full h-full object-cover" />
                                                            <button
                                                                onClick={() => removeItemImage(index, imgIndex)}
                                                                className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <Trash2 size={8} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>

                                                {item.previews.length < 1 && (
                                                    <label className="w-10 h-10 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:bg-white hover:border-green-500/50 transition-all cursor-pointer bg-white shrink-0 group/cam">
                                                        <Camera className="text-gray-400 group-hover/cam:text-green-600" size={16} />
                                                        <input
                                                            type="file"
                                                            multiple
                                                            accept="image/*"
                                                            onChange={(e) => handleItemImageChange(index, e)}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                )}
                                            </div>

                                            {items.length > 1 && (
                                                <button
                                                    onClick={() => removeItem(index)}
                                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title={t('donor.postFood.removeItem')}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={addItem}
                                    className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-2 px-2 py-1 mt-2 transition-all hover:translate-x-1"
                                >
                                    {t('donor.postFood.addAnotherItem')}
                                </button>
                            </div>

                            <div className="pt-2">
                                <label className="block text-sm font-semibold text-gray-600 mb-2">{t('donor.postFood.description')}</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-4 text-gray-400" size={18} />
                                    <textarea
                                        rows="3"
                                        placeholder={t('donor.postFood.descriptionPlaceholder')}
                                        className="w-full border border-gray-100 bg-gray-50/50 rounded-xl pl-10 pr-4 py-3.5 focus:ring-2 focus:ring-green-500 focus:bg-white focus:outline-none transition-all text-sm resize-none"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in relative pb-20">
                        <div className="space-y-8">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold mb-6 text-gray-800">{t('donor.postFood.pickupInfo')}</h3>
                                <div className="space-y-6">
                                    <div>
                                        <LocationFields
                                            district={district}
                                            homeAddress={homeAddress}
                                            city={city}
                                            onDistrictChange={setDistrict}
                                            onHomeAddressChange={setHomeAddress}
                                            onCityChange={setCity}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-2">{t('donor.postFood.pickupTimes')}</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder={t('donor.postFood.pickupTimesPlaceholder')}
                                                className="w-full border border-gray-100 bg-gray-50/50 rounded-xl pl-10 pr-4 py-3.5 focus:ring-2 focus:ring-green-500 focus:bg-white focus:outline-none transition-all text-sm"
                                                value={pickupTimes}
                                                onChange={e => setPickupTimes(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-600 mb-2">{t('donor.postFood.expiryDateTime')}</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="datetime-local"
                                                className="w-full border border-gray-100 bg-gray-50/50 rounded-xl pl-10 pr-4 py-3.5 focus:ring-2 focus:ring-green-500 focus:bg-white focus:outline-none transition-all text-sm"
                                                value={expiryDate}
                                                onChange={e => setExpiryDate(e.target.value)}
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-1 ml-1 italic">{t('donor.postFood.expiryHint')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-xl font-bold mb-2 text-gray-800">{t('donor.postFood.schedulingUrgency')}</h3>
                                <div className="space-y-8 mt-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-gray-700">{t('donor.postFood.recurringToggle')}</span>
                                        <button onClick={() => setIsRecurring(!isRecurring)} className={`w-12 h-6 rounded-full relative transition-colors ${isRecurring ? 'bg-green-600' : 'bg-gray-300'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${isRecurring ? 'left-7' : 'left-1'}`}></div>
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-gray-700">{t('donor.postFood.urgentToggle')}</span>
                                            <button onClick={() => setIsUrgent(!isUrgent)} className={`w-12 h-6 rounded-full relative transition-colors ${isUrgent ? 'bg-green-600' : 'bg-gray-300'}`}>
                                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${isUrgent ? 'left-7' : 'left-1'}`}></div>
                                            </button>
                                        </div>
                                        <p className="text-[11px] text-gray-400 italic">{t('donor.postFood.urgentHint')}</p>
                                    </div>

                                    <div className="space-y-4 pt-6 border-t border-gray-50">
                                        <h4 className="text-sm font-bold text-gray-800">{t('donor.postFood.targetBeneficiary')}</h4>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                                {t('donor.postFood.beneficiaryType')} <span className="text-red-500">{t('donor.postFood.required')}</span>
                                            </label>
                                            <select
                                                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 outline-none transition-all appearance-none cursor-pointer"
                                                value={destinationType}
                                                onChange={(e) => setDestinationType(e.target.value)}
                                            >
                                                <option value="">{t('donor.postFood.allBeneficiaries')}</option>
                                                {Object.entries(BENEFICIARY_TYPE_KEY_MAP).map(([value, key]) => (
                                                    <option key={value} value={value}>{t(`donor.beneficiaryTypes.${key}`)}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="relative" ref={suggestionRef}>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                                {t('donor.postFood.specificBeneficiary')}
                                            </label>
                                            <input
                                                type="text"
                                                placeholder={t('donor.postFood.searchBeneficiaryPlaceholder')}
                                                className={`w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 outline-none transition-all placeholder:text-gray-300 ${!isValidBeneficiary ? 'ring-2 ring-red-500/50' : 'focus:ring-green-500/20'}`}
                                                value={destinationName}
                                                onChange={(e) => handleBeneficiarySearch(e.target.value)}
                                                onBlur={validateBeneficiary}
                                            />
                                            {!isValidBeneficiary && destinationName.trim() && (
                                                <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold animate-pulse">
                                                    {t('donor.postFood.notRegisteredBeneficiary')}
                                                </p>
                                            )}
                                            {beneficiarySearchLoading && <div className="absolute right-3 top-[38px] animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full"></div>}
                                            
                                            {showSuggestions && suggestions.length > 0 && (
                                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                                    {suggestions.map((s) => (
                                                        <button
                                                            key={s._id}
                                                            onClick={() => handleBeneficiarySelect(s)}
                                                            className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors flex flex-col border-b border-gray-50 last:border-0"
                                                        >
                                                            <span className="text-sm font-bold text-gray-800">{s.name}</span>
                                                            <span className="text-[10px] text-gray-400 uppercase font-black tracking-tight">
                                                                {s.beneficiaryType ? translateBeneficiaryType(s.beneficiaryType, t) : t('donor.postFood.beneficiary')}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {isRecurring && (
                                        <div className="space-y-4 pt-4 border-t border-gray-50 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('donor.postFood.frequency')}</label>
                                                    <select
                                                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 outline-none transition-all appearance-none cursor-pointer"
                                                        value={frequency}
                                                        onChange={(e) => setFrequency(e.target.value)}
                                                    >
                                                        {FREQUENCY_OPTIONS.map(({ value, key }) => (
                                                            <option key={value} value={value}>{t(`donor.frequency.${key}`)}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('donor.postFood.preferredDay')}</label>
                                                    <select
                                                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 outline-none transition-all appearance-none cursor-pointer"
                                                        value={recurringDay}
                                                        onChange={(e) => setRecurringDay(e.target.value)}
                                                    >
                                                        {DAY_OPTIONS.map(({ value, key }) => (
                                                            <option key={value} value={value}>{t(`donor.days.${key}`)}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button onClick={handlePost} disabled={loading} className="bg-[#43A047] text-white font-bold px-12 py-3.5 rounded-lg shadow-lg hover:bg-[#2E7D32] transition-all transform active:scale-95 disabled:opacity-70 text-base">
                                    {loading ? t('donor.postFood.posting') : t('donor.postFood.donateFood')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PostFood;
