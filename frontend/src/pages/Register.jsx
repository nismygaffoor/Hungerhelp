import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, User, Heart, Truck } from 'lucide-react';
import LocationFields from '../components/location/LocationFields';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { buildLocationAddress } from '../constants/locations';
import { LANGUAGES, getLanguageLabel, getStoredLanguage } from '../i18n/languages';

const Register = () => {
    const { t } = useTranslation();
    const [selectedRole, setSelectedRole] = useState('Donor');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        contact: '',
        address: '',
        district: '',
        home_address: '',
        city: '',
        businessName: '',
        beneficiaryType: '',
        language: getLanguageLabel(getStoredLanguage()),
        experience: ''
    });
    const [error, setError] = useState('');
    const { registerUser } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (selectedRole === 'Beneficiary' && (!formData.district || !formData.city)) {
            setError(t('auth.districtCityRequired'));
            return;
        }

        const payload = {
            ...formData,
            role: selectedRole,
            address: formData.district
                ? buildLocationAddress({ district: formData.district, homeAddress: formData.home_address, city: formData.city })
                : formData.address,
        };

        const res = await registerUser(payload);
        if (res.success) {
            navigate('/login');
        } else {
            setError(res.message || t('auth.registerFailed'));
        }
    };

    // Role-specific config
    const roleContent = {
        Donor: {
            title: t('auth.donorTitle'),
            slogan: t('auth.donorSlogan'),
            icon: <Heart size={20} />,
            color: "border-green-600 bg-green-50 text-green-700"
        },
        Beneficiary: {
            title: t('auth.beneficiaryTitle'),
            slogan: t('auth.beneficiarySlogan'),
            icon: <User size={20} />,
            color: "border-blue-600 bg-blue-50 text-blue-700"
        },
        Volunteer: {
            title: t('auth.volunteerTitle'),
            slogan: t('auth.volunteerSlogan'),
            icon: <Truck size={20} />,
            color: "border-orange-600 bg-orange-50 text-orange-700"
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-gray-50 overflow-hidden py-10">

            {/* Background Layer */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0 opacity-80"
                style={{ backgroundImage: "url('/login-bg.png')" }}
            ></div>

            <div className="absolute top-4 right-4 z-20">
                <LanguageSwitcher />
            </div>

            {/* Register Card */}
            <div className="relative z-10 bg-white p-6 rounded-3xl shadow-2xl w-full max-w-md mx-4 border border-white/50 backdrop-blur-sm bg-white/95">

                {/* Logo Section */}
                <div className="flex flex-col items-center mb-3">
                    <div className="flex items-center gap-2">
                        <Leaf className="text-green-600" size={20} />
                        <span className="text-xl font-bold text-green-700 tracking-tight">Hunger<span className="text-gray-500 font-light">Help</span></span>
                    </div>
                </div>

                <div className="text-center mb-4">
                    <h2 className="text-2xl font-serif font-bold text-gray-700">{roleContent[selectedRole].title}</h2>
                    <p className="text-xs text-green-600 font-medium mt-1">{roleContent[selectedRole].slogan}</p>
                </div>

                {/* Role Switcher */}
                <div className="flex justify-center gap-3 mb-8">
                    {Object.keys(roleContent).map((role) => (
                        <button
                            key={role}
                            onClick={() => setSelectedRole(role)}
                            className={`flex flex-col items-center gap-1 min-w-[90px] py-2 px-1 rounded-2xl border-2 transition-all group
                                ${selectedRole === role
                                    ? roleContent[role].color
                                    : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}
                        >
                            <div className={`p-2 rounded-full transition-colors ${selectedRole === role ? 'bg-white/50' : 'bg-gray-50'}`}>
                                {roleContent[role].icon}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider">{t(`roles.${role.toLowerCase()}`)}</span>
                        </button>
                    ))}
                </div>

                {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded-lg text-sm text-center font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-2">
                    <InputField placeholder={t('auth.fullName')} name="name" value={formData.name} onChange={handleChange} />

                    {selectedRole === 'Donor' && (
                        <InputField placeholder={t('auth.businessNameOptional')} name="businessName" value={formData.businessName} onChange={handleChange} />
                    )}

                    <InputField placeholder={t('auth.email')} name="email" type="email" value={formData.email} onChange={handleChange} />
                    <InputField placeholder={t('auth.phoneNumber')} name="contact" type="tel" value={formData.contact} onChange={handleChange} />

                    {selectedRole === 'Beneficiary' && (
                        <>
                            <InputField placeholder={t('auth.beneficiaryType')} name="beneficiaryType" value={formData.beneficiaryType} onChange={handleChange} />
                            <div className="py-2">
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
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">{t('auth.languagePreference')}</label>
                            <select
                                name="language"
                                value={formData.language}
                                onChange={handleChange}
                                className="w-full border-b-2 border-gray-100 py-2 px-1 focus:outline-none focus:border-green-600 transition-colors text-base bg-white"
                            >
                                {LANGUAGES.map((lang) => (
                                    <option key={lang.code} value={lang.label}>{lang.nativeLabel}</option>
                                ))}
                            </select>
                        </>
                    )}

                    {(selectedRole === 'Donor' || selectedRole === 'Volunteer') && (
                        <div className="py-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t('auth.addressOptional')}</p>
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
                    )}

                    {selectedRole === 'Volunteer' && (
                        <InputField placeholder={t('auth.experienceOptional')} name="experience" value={formData.experience} onChange={handleChange} />
                    )}

                    <InputField placeholder={t('auth.password')} name="password" type="password" value={formData.password} onChange={handleChange} />

                    <button
                        type="submit"
                        className="w-full bg-[#1E5144] text-white font-bold py-2 rounded-xl shadow-lg hover:shadow-xl hover:bg-[#163d33] transition-all transform active:scale-95 text-base mt-4"
                    >
                        {t('auth.signUpToHelp')}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm">
                    <p className="text-gray-500">
                        {t('auth.alreadyHaveAccount')} <Link to="/login" className="text-green-700 font-bold hover:underline">{t('nav.login')}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

const InputField = ({ placeholder, name, type = "text", value, onChange }) => (
    <input
        type={type}
        name={name}
        placeholder={placeholder}
        className="w-full border-b-2 border-gray-100 py-1 px-1 focus:outline-none focus:border-green-600 transition-colors text-base"
        value={value}
        onChange={onChange}
        required={name !== 'businessName' && name !== 'experience'}
    />
);

export default Register;
