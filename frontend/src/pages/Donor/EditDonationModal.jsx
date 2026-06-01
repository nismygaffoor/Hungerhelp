import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Loader2, Plus, ChevronDown } from 'lucide-react';
import { CATEGORY_KEY_MAP, BENEFICIARY_TYPE_KEY_MAP, translateBeneficiaryType } from '../../i18n/donorVolunteerI18n';
import api from '../../api/axios';
import LocationFields from '../../components/location/LocationFields';
import { buildLocationAddress } from '../../constants/locations';
import { useDialog } from '../../context/DialogContext';

const FREQUENCY_OPTIONS = [
    { value: 'Daily', key: 'daily' },
    { value: 'Weekly', key: 'weekly' },
    { value: 'Monthly', key: 'monthly' },
];

const DAY_OPTIONS = [
    { value: 'Everyday', key: 'everyday' },
    { value: 'Monday', key: 'monday' },
    { value: 'Tuesday', key: 'tuesday' },
    { value: 'Wednesday', key: 'wednesday' },
    { value: 'Thursday', key: 'thursday' },
    { value: 'Friday', key: 'friday' },
    { value: 'Saturday', key: 'saturday' },
    { value: 'Sunday', key: 'sunday' },
];

const EditDonationModal = ({ isOpen, onClose, item, onUpdate }) => {
    const { t } = useTranslation();
    const { toast } = useDialog();
    const [formData, setFormData] = useState({
        items: [],
        district: '',
        home_address: '',
        city: '',
        pickup_times: '',
        description: '',
        expiry_time: '',
        is_urgent: false,
        is_recurring: false,
        frequency: '',
        day: '',
        destination: '',
        destination_type: '',
        destination_name: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (item) {
            const [loc, times] = (item.location || '').split(' | ');
            
            let initialItems = item.items;
            if (!initialItems || initialItems.length === 0) {
                initialItems = [{ 
                    category: item.food_type?.split(' - ')[0] || '', 
                    name: item.food_type?.split(' - ')[1] || '',
                    quantity: item.quantity || '', 
                    images: item.images || [] 
                }];
            }

            setFormData({
                items: initialItems,
                district: item.district || '',
                home_address: item.home_address || item.home_no || '',
                city: item.city || item.road || loc || '',
                pickup_times: times || '',
                description: item.description || '',
                expiry_time: item.expiry_time ? new Date(item.expiry_time).toISOString().slice(0, 16) : '',
                is_urgent: item.is_urgent || false,
                is_recurring: item.is_recurring || false,
                frequency: item.frequency || '',
                day: item.day || '',
                destination: item.destination || '',
                destination_type: item.destination_type || '',
                destination_name: item.destination_name || ''
            });
        }
    }, [item]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const foodTypeString = formData.items.map(i => i.category).join(', ');
            const quantityString = formData.items.map(i => i.quantity).join(', ');

            const food_type = formData.description ? `${foodTypeString} - ${formData.description}` : foodTypeString;
            const location = buildLocationAddress({
                district: formData.district,
                homeAddress: formData.home_address,
                city: formData.city,
            });

            const form = new FormData();
            form.append('food_type', food_type);
            form.append('quantity', quantityString);
            form.append('district', formData.district);
            form.append('home_address', formData.home_address);
            form.append('city', formData.city);
            form.append('pickup_times', formData.pickup_times);
            form.append('location', formData.pickup_times ? `${location} | ${formData.pickup_times}` : location);
            form.append('description', formData.description || '');
            form.append('is_urgent', String(formData.is_urgent));
            form.append('is_recurring', String(formData.is_recurring));
            form.append('destination_type', formData.destination_type || '');
            form.append('destination_name', formData.destination_name || '');

            if (formData.is_recurring) {
                form.append('frequency', formData.frequency);
                form.append('day', formData.day);
            } else {
                form.append('expiry_time', formData.expiry_time);
            }

            const cleanItems = formData.items.map(item => ({
                category: item.category,
                name: item.name || '',
                quantity: item.quantity,
                images: item.images || []
            }));
            form.append('items', JSON.stringify(cleanItems));

            formData.items.forEach((item, index) => {
                if (item.newFiles) {
                    item.newFiles.forEach(file => {
                        form.append(`item_images_${index}`, file);
                    });
                }
            });

            await api.put(`/food/${item._id}`, form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onUpdate();
            onClose();
        } catch (err) {
            console.error("Update failed:", err);
            toast.error(t('donor.editModal.updateFailed'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
                <div className="p-6 sticky top-0 bg-white z-10 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                            {t('donor.editModal.editTitle', {
                                type: item.is_recurring ? t('donor.editModal.editRecurring') : t('donor.editModal.editDonation')
                            })}
                        </h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('donor.editModal.foodItems')}</label>
                            {formData.items.map((foodItem, index) => (
                                <div key={index} className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50 space-y-4">
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <div className="relative">
                                                <select
                                                    required
                                                    className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none appearance-none cursor-pointer"
                                                    value={foodItem.category}
                                                    onChange={(e) => {
                                                        const newItems = [...formData.items];
                                                        newItems[index].category = e.target.value;
                                                        setFormData({ ...formData, items: newItems });
                                                    }}
                                                >
                                                    <option value="" disabled>{t('donor.editModal.selectType')}</option>
                                                    {foodItem.category && !Object.keys(CATEGORY_KEY_MAP).includes(foodItem.category) && (
                                                        <option value={foodItem.category}>{foodItem.category}</option>
                                                    )}
                                                    {Object.entries(CATEGORY_KEY_MAP).map(([value, key]) => (
                                                        <option key={value} value={value}>{t(`donor.categories.${key}`)}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                required
                                                type="text"
                                                placeholder={t('donor.editModal.itemNamePlaceholder')}
                                                className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                                                value={foodItem.name || ''}
                                                onChange={(e) => {
                                                    const newItems = [...formData.items];
                                                    newItems[index].name = e.target.value;
                                                    setFormData({ ...formData, items: newItems });
                                                }}
                                            />
                                        </div>
                                        <div className="w-1/4">
                                            <input
                                                required
                                                type="text"
                                                placeholder={t('donor.editModal.qty')}
                                                className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none"
                                                value={foodItem.quantity}
                                                onChange={(e) => {
                                                    const newItems = [...formData.items];
                                                    newItems[index].quantity = e.target.value;
                                                    setFormData({ ...formData, items: newItems });
                                                }}
                                            />
                                        </div>
                                        {formData.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newItems = formData.items.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, items: newItems });
                                                }}
                                                className="p-3 text-red-400 hover:text-red-600 transition-all"
                                            >
                                                <X size={18} />
                                            </button>
                                        )}
                                    </div>

                                    {foodItem.images?.length > 0 && (
                                        <div className="flex gap-2 overflow-x-auto pb-1">
                                            {foodItem.images.map((img, imgIdx) => (
                                                <div key={imgIdx} className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-gray-100 relative group">
                                                    <img
                                                        src={img.startsWith('http') ? img : `http://localhost:5000/uploads/${img}`}
                                                        className="w-full h-full object-cover"
                                                        alt="Item"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newItems = [...formData.items];
                                                            newItems[index].images = newItems[index].images.filter((_, i) => i !== imgIdx);
                                                            setFormData({ ...formData, items: newItems });
                                                        }}
                                                        className="absolute top-0 right-0 bg-red-500 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title={t('donor.editModal.removeImage')}
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="mt-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                                            {(foodItem.images?.length > 0 || foodItem.newFiles?.length > 0) ? t('donor.editModal.currentImage') : t('donor.editModal.addPhoto')}
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {(foodItem.newFiles || []).map((file, fIdx) => (
                                                <div key={fIdx} className="w-12 h-12 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center relative overflow-hidden">
                                                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="Preview" />
                                                    <button 
                                                        type="button"
                                                        onClick={() => {
                                                            const newItems = [...formData.items];
                                                            newItems[index].newFiles = newItems[index].newFiles.filter((_, i) => i !== fIdx);
                                                            setFormData({ ...formData, items: newItems });
                                                        }}
                                                        className="absolute top-0 right-0 bg-red-500 text-white p-0.5"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            ))}
                                            <label className={`w-12 h-12 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-green-400 transition-all ${(foodItem.newFiles?.length > 0 || foodItem.images?.length > 0) ? 'hidden' : ''}`}>
                                                <Plus size={16} className="text-gray-400" />
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    onChange={(e) => {
                                                        const files = Array.from(e.target.files);
                                                        if (files.length > 0) {
                                                            const newItems = [...formData.items];
                                                            newItems[index].newFiles = [files[0]];
                                                            setFormData({ ...formData, items: newItems });
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => setFormData({
                                    ...formData,
                                    items: [...formData.items, { category: '', name: '', quantity: '', images: [], newFiles: [] }]
                                })}
                                className="text-sm font-bold text-green-600 hover:text-green-700 ml-1"
                            >
                                {t('donor.editModal.addAnotherItem')}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">

                            <div className="col-span-2">
                                <LocationFields
                                    compact
                                    district={formData.district}
                                    homeAddress={formData.home_address}
                                    city={formData.city}
                                    onDistrictChange={(value) => setFormData({ ...formData, district: value })}
                                    onHomeAddressChange={(value) => setFormData({ ...formData, home_address: value })}
                                    onCityChange={(value) => setFormData({ ...formData, city: value })}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('donor.editModal.pickupTimes')}</label>
                                <input
                                    type="text"
                                    placeholder={t('donor.editModal.pickupTimesPlaceholder')}
                                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                                    value={formData.pickup_times}
                                    onChange={(e) => setFormData({ ...formData, pickup_times: e.target.value })}
                                />
                            </div>

                            {!formData.is_recurring && (
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('donor.editModal.expiryTime')}</label>
                                    <input
                                        required
                                        type="datetime-local"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                                        value={formData.expiry_time}
                                        onChange={(e) => setFormData({ ...formData, expiry_time: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="col-span-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('donor.editModal.description')}</label>
                                <textarea
                                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 outline-none transition-all resize-none"
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            {formData.is_recurring && (
                                <>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('donor.editModal.frequency')} <span className="text-red-500">*</span></label>
                                        <select
                                            required
                                            className={`w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-green-500/20 outline-none transition-all appearance-none cursor-pointer ${!formData.frequency ? 'text-red-400' : 'text-gray-700'}`}
                                            value={formData.frequency}
                                            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                        >
                                            <option value="">{t('donor.editModal.selectFrequency')}</option>
                                            {FREQUENCY_OPTIONS.map(({ value, key }) => (
                                                <option key={value} value={value}>{t(`donor.frequency.${key}`)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('donor.editModal.day')} <span className="text-red-500">*</span></label>
                                        <select
                                            required
                                            className={`w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-green-500/20 outline-none transition-all appearance-none cursor-pointer ${!formData.day ? 'text-red-400' : 'text-gray-700'}`}
                                            value={formData.day}
                                            onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                                        >
                                            <option value="">{t('donor.editModal.selectDay')}</option>
                                            {DAY_OPTIONS.map(({ value, key }) => (
                                                <option key={value} value={value}>{t(`donor.days.${key}`)}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            <div className="col-span-2 pt-4 border-t border-gray-100">
                                <h4 className="text-sm font-bold text-gray-800 mb-4">{t('donor.editModal.targetBeneficiary')}</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                            {t('donor.editModal.beneficiaryType')}
                                        </label>
                                        <select
                                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 outline-none transition-all appearance-none cursor-pointer"
                                            value={formData.destination_type}
                                            onChange={(e) => setFormData({ ...formData, destination_type: e.target.value })}
                                        >
                                            <option value="">{t('donor.editModal.allBeneficiaries')}</option>
                                            {Object.entries(BENEFICIARY_TYPE_KEY_MAP).map(([value, key]) => (
                                                <option key={value} value={value}>{t(`donor.beneficiaryTypes.${key}`)}</option>
                                            ))}
                                        </select>
                                        <p className="text-[10px] text-gray-400 mt-1 ml-1">
                                            {formData.destination_type
                                                ? t('donor.editModal.onlyTypeSee', { type: translateBeneficiaryType(formData.destination_type, t) })
                                                : t('donor.editModal.visibleToAll')}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                                            {t('donor.editModal.specificBeneficiary')}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={t('donor.editModal.beneficiaryPlaceholder')}
                                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                                            value={formData.destination_name}
                                            onChange={(e) => setFormData({ ...formData, destination_name: e.target.value })}
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1 ml-1">{t('donor.editModal.onlyBeneficiarySee')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 pt-2">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="text-sm font-bold text-gray-700">{t('donor.editModal.recurringToggle')}</span>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ 
                                        ...formData, 
                                        is_recurring: !formData.is_recurring,
                                        ...(!formData.is_recurring ? { 
                                            frequency: '', 
                                            day: '',
                                            status: 'Active'
                                        } : {
                                            status: 'Available'
                                        })
                                    })}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${formData.is_recurring ? 'bg-green-600' : 'bg-gray-300'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formData.is_recurring ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="text-sm font-bold text-gray-700">{t('donor.editModal.urgentToggle')}</span>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_urgent: !formData.is_urgent })}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${formData.is_urgent ? 'bg-red-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${formData.is_urgent ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            {formData.images?.length > 0 && (
                                <div className="p-4 bg-gray-50 rounded-2xl">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">{t('donor.editModal.currentImagesReadonly')}</label>
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {formData.images.map((img, i) => (
                                            <img
                                                key={i}
                                                src={img.startsWith('http') ? img : `http://localhost:5000/uploads/${img}`}
                                                alt="food"
                                                className="w-16 h-16 object-cover rounded-xl shadow-sm border border-white flex-shrink-0"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-4 bg-[#76B56E] hover:bg-[#65a35e] text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={20} /> : t('profile.saveChanges')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditDonationModal;
