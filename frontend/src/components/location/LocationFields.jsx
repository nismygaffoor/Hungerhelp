import { MapPin, ChevronDown, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DISTRICTS } from '../../constants/locations';

const LocationFields = ({
    district,
    homeAddress,
    city,
    onDistrictChange,
    onHomeAddressChange,
    onCityChange,
    districtLabel,
    homeAddressLabel,
    cityLabel,
    compact = false,
}) => {
    const { t } = useTranslation();

    const resolvedDistrictLabel = districtLabel ?? t('components.locationFields.district');
    const resolvedHomeAddressLabel = homeAddressLabel ?? t('components.locationFields.homeAddress');
    const resolvedCityLabel = cityLabel ?? t('components.locationFields.city');

    const inputClass = compact
        ? 'w-full border border-gray-100 bg-gray-50/50 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-green-500/20 focus:bg-white focus:outline-none transition-all text-sm'
        : 'w-full border border-gray-100 bg-gray-50/50 rounded-xl pl-10 pr-4 py-3.5 focus:ring-2 focus:ring-green-500/20 focus:bg-white focus:outline-none transition-all text-sm';

    const labelClass = compact
        ? 'block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1'
        : 'block text-sm font-semibold text-gray-600 mb-2';

    return (
        <div className="space-y-4">
            <div>
                <label className={labelClass}>{resolvedDistrictLabel} <span className="text-red-500">*</span></label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                        required
                        className={`${inputClass} appearance-none cursor-pointer font-medium`}
                        value={district}
                        onChange={(e) => onDistrictChange(e.target.value)}
                    >
                        <option value="" disabled>{t('components.locationFields.selectDistrict')}</option>
                        {DISTRICTS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>{resolvedHomeAddressLabel}</label>
                    <div className="relative">
                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={t('components.locationFields.homeAddressPlaceholder')}
                            className={inputClass}
                            value={homeAddress}
                            onChange={(e) => onHomeAddressChange(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className={labelClass}>{resolvedCityLabel} <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            required
                            placeholder={t('components.locationFields.cityPlaceholder')}
                            className={inputClass}
                            value={city}
                            onChange={(e) => onCityChange(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationFields;
