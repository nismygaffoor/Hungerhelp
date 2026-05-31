import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Loader2, Trash2, ChevronDown } from 'lucide-react';
import { translateStatus, CATEGORY_KEY_MAP, URGENCY_KEY_MAP } from '../../i18n/donorVolunteerI18n';
import api from '../../api/axios';
import LocationFields from '../../components/location/LocationFields';
import { buildLocationAddress } from '../../constants/locations';

const CATEGORY_VALUES = Object.keys(CATEGORY_KEY_MAP);
const URGENCY_LEVELS = ['Normal', 'Medium', 'High'];

const EditRequestModal = ({ request, isOpen, onClose, onUpdated }) => {
    const { t } = useTranslation();
    const translateCategory = (c) => {
        const k = CATEGORY_KEY_MAP[c];
        return k ? t(`beneficiary.categories.${k}`) : c;
    };
    const translateUrgency = (u) => {
        const k = URGENCY_KEY_MAP[u];
        return k ? t(`beneficiary.urgency.${k}`) : u;
    };
    const [items, setItems] = useState([]);
    const [description, setDescription] = useState('');
    const [district, setDistrict] = useState('');
    const [homeAddress, setHomeAddress] = useState('');
    const [city, setCity] = useState('');
    const [urgency, setUrgency] = useState('Normal');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (request && isOpen) {
            setItems(
                (request.items?.length ? request.items : [{
                    category: request.food_type?.split(',')[0]?.trim() || '',
                    name: '',
                    quantity: request.quantity || '',
                }]).map((item) => ({
                    category: item.category || '',
                    name: item.name || '',
                    quantity: item.quantity || '',
                }))
            );
            setDescription(request.description || '');
            setDistrict(request.district || '');
            setHomeAddress(request.home_address || request.home_no || '');
            setCity(request.city || request.road || '');
            setUrgency(request.urgency || 'Normal');
        }
    }, [request, isOpen]);

    if (!isOpen || !request) return null;

    const handleItemChange = (index, field, value) => {
        const next = [...items];
        next[index][field] = value;
        setItems(next);
    };

    const addItem = () => setItems([...items, { category: '', name: '', quantity: '' }]);

    const removeItem = (index) => {
        if (items.length > 1) setItems(items.filter((_, i) => i !== index));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const invalidItems = items.some((item) => !item.category || !item.quantity);
        if (invalidItems || !district || !city) {
            alert(t('beneficiary.fillRequiredEdit'));
            return;
        }

        setSaving(true);
        try {
            const payload = {
                items: items.map((item) => ({
                    category: item.category,
                    name: item.name || '',
                    quantity: item.quantity,
                })),
                food_type: items.map((i) => i.category).join(', '),
                quantity: items.map((i) => i.quantity).join(', '),
                location: buildLocationAddress({ district, homeAddress, city }),
                district,
                home_address: homeAddress,
                city,
                description,
                urgency,
            };
            await api.patch(`/requests/${request._id}`, payload);
            alert(t('beneficiary.requestUpdated'));
            onUpdated();
            onClose();
        } catch (err) {
            alert(err.response?.data?.error || t('beneficiary.updateRequestFailed'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-lg font-black text-gray-900">{t('beneficiary.editRequestTitle')}</h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-50">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t('beneficiary.neededItems')}</label>
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="flex flex-col sm:flex-row gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex-1 relative">
                                        <select
                                            required
                                            className="w-full border border-gray-100 bg-white rounded-xl px-3 py-2.5 text-sm font-bold appearance-none cursor-pointer"
                                            value={item.category}
                                            onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                                        >
                                            <option value="" disabled>{t('beneficiary.category')}</option>
                                            {CATEGORY_VALUES.map((c) => (
                                                <option key={c} value={c}>{translateCategory(c)}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={t('beneficiary.itemNameOptionalShort')}
                                        className="flex-1 border border-gray-100 bg-white rounded-xl px-3 py-2.5 text-sm"
                                        value={item.name}
                                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        required
                                        placeholder={t('beneficiary.qty')}
                                        className="w-full sm:w-24 border border-gray-100 bg-white rounded-xl px-3 py-2.5 text-sm font-bold"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                    />
                                    {items.length > 1 && (
                                        <button type="button" onClick={() => removeItem(index)} className="p-2 text-gray-300 hover:text-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addItem} className="text-xs font-bold text-green-600 mt-2 hover:underline">
                            {t('beneficiary.addItem')}
                        </button>
                    </div>

                    <LocationFields
                        compact
                        district={district}
                        homeAddress={homeAddress}
                        city={city}
                        onDistrictChange={setDistrict}
                        onHomeAddressChange={setHomeAddress}
                        onCityChange={setCity}
                    />

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('beneficiary.urgencyLevel')}</label>
                        <div className="grid grid-cols-3 gap-2">
                            {URGENCY_LEVELS.map((level) => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setUrgency(level)}
                                    className={`py-2 text-[10px] font-black rounded-xl border uppercase tracking-widest ${
                                        urgency === level
                                            ? 'bg-[#1E5144] border-[#1E5144] text-white'
                                            : 'bg-white border-gray-100 text-gray-400'
                                    }`}
                                >
                                    {translateUrgency(level)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('beneficiary.notes')}</label>
                        <textarea
                            rows={3}
                            className="w-full border border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500/20"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('beneficiary.notesPlaceholder')}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all">
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-3 rounded-xl font-bold text-white bg-[#1E5144] hover:bg-[#163d33] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : t('profile.saveChanges')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditRequestModal;
