import { useRef, useEffect, useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { LANGUAGES } from '../i18n/languages';
import useLanguage from '../hooks/useLanguage';

const LanguageSwitcher = ({ className = '', buttonClassName = '' }) => {
    const { changeLanguage, currentLanguage } = useLanguage();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const active = LANGUAGES.find((lang) => lang.code === currentLanguage) || LANGUAGES[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = async (code) => {
        await changeLanguage(code);
        setOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-all ${buttonClassName}`}
            >
                <Globe size={16} className="text-gray-400" />
                <span className="text-[11px] font-bold hidden sm:inline">{active.nativeLabel}</span>
                <ChevronDown size={12} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 z-50">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.code}
                            type="button"
                            onClick={() => handleSelect(lang.code)}
                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                                currentLanguage === lang.code
                                    ? 'bg-green-50 text-green-700'
                                    : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {lang.nativeLabel}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
