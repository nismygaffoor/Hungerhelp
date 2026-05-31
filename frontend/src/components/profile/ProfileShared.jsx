import { User, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LocationFields from '../location/LocationFields';
import { buildLocationAddress } from '../../constants/locations';

const ICONS = { User, Mail, Phone, MapPin };

export const ProfileField = ({ label, value, field, icon = 'User', editing, formValue, onChange, type = 'text' }) => {
    const Icon = ICONS[icon] || User;

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{label}</label>
            {editing && field ? (
                type === 'textarea' ? (
                    <textarea
                        rows={3}
                        value={formValue}
                        onChange={(e) => onChange(field, e.target.value)}
                        className="w-full border border-gray-100 bg-white rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 focus:outline-none resize-none"
                    />
                ) : (
                    <input
                        type={type}
                        value={formValue}
                        onChange={(e) => onChange(field, e.target.value)}
                        className="w-full border border-gray-100 bg-white rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                    />
                )
            ) : (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                    <Icon size={18} className="text-gray-400 shrink-0" />
                    <span className="text-sm font-bold text-gray-700 break-words">{value || '—'}</span>
                </div>
            )}
        </div>
    );
};

export const ProfileAddressField = ({
    label,
    profile,
    editing,
    form,
    onChange,
}) => {
    const { t } = useTranslation();
    const displayLabel = label || t('profile.address');
    const displayValue = profile?.address
        || buildLocationAddress({
            district: profile?.district || '',
            homeAddress: profile?.home_address || profile?.home_no || '',
            city: profile?.city || profile?.road || '',
        })
        || '—';

    if (editing) {
        return (
            <div className="md:col-span-2">
                <LocationFields
                    compact
                    district={form.district || ''}
                    homeAddress={form.home_address || ''}
                    city={form.city || ''}
                    onDistrictChange={(value) => onChange('district', value)}
                    onHomeAddressChange={(value) => onChange('home_address', value)}
                    onCityChange={(value) => onChange('city', value)}
                />
            </div>
        );
    }

    return (
        <ProfileField label={displayLabel} value={displayValue} icon="MapPin" />
    );
};

export const ProfileLoading = () => (
    <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-green-600" size={40} />
    </div>
);

export const ProfileAvatar = ({ initials, accentClass = 'bg-green-600', borderClass = 'border-green-100' }) => (
    <div className={`w-24 h-24 rounded-full border-4 ${borderClass} shadow-lg flex items-center justify-center ${accentClass} text-white text-2xl font-black`}>
        {initials}
    </div>
);

export const EditProfileButtons = ({ editing, saving, onEdit, onSave, onCancel, accentClass = 'text-green-700' }) => {
    const { t } = useTranslation();
    return editing ? (
        <div className="flex gap-2">
            <button onClick={onCancel} className="text-sm font-bold text-gray-500 hover:underline">{t('common.cancel')}</button>
            <button
                onClick={onSave}
                disabled={saving}
                className={`text-sm font-black ${accentClass} hover:underline disabled:opacity-50`}
            >
                {saving ? t('profile.saving') : t('profile.saveChanges')}
            </button>
        </div>
    ) : (
        <button onClick={onEdit} className={`text-sm font-black ${accentClass} hover:underline underline-offset-4`}>
            {t('profile.editProfile')}
        </button>
    );
};

export const StatCard = ({ value, label, bgClass, textClass }) => (
    <div className={`${bgClass} p-5 rounded-3xl border border-transparent`}>
        <p className={`text-2xl font-black ${textClass} mb-1`}>{value ?? 0}</p>
        <p className={`text-[10px] font-black uppercase tracking-widest leading-tight opacity-70 ${textClass}`}>{label}</p>
    </div>
);
