import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import PublicNav from '../components/PublicNav';
import { useDialog } from '../context/DialogContext';
import api from '../api/axios';

const INITIAL_FORM = {
    name: '',
    email: '',
    subject: '',
    message: '',
};

const Contact = () => {
    const { t } = useTranslation();
    const { toast } = useDialog();
    const [form, setForm] = useState(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
            toast.error(t('contact.formRequired'));
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/contact/', {
                name: form.name.trim(),
                email: form.email.trim(),
                subject: form.subject.trim(),
                message: form.message.trim(),
            });
            setForm(INITIAL_FORM);
            toast.success(t('contact.formSuccess'));
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || t('contact.formError');
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const contactCards = [
        { icon: Mail, labelKey: 'contact.emailLabel', valueKey: 'contact.emailValue', href: 'mailto:support@hungerhelp.lk' },
        { icon: Phone, labelKey: 'contact.phoneLabel', valueKey: 'contact.phoneValue', href: 'tel:+94771234567' },
        { icon: MapPin, labelKey: 'contact.locationLabel', valueKey: 'contact.locationValue' },
        { icon: Clock, labelKey: 'contact.hoursLabel', valueKey: 'contact.hoursValue' },
    ];

    return (
        <div className="font-sans bg-white text-gray-800 min-h-screen">
            <PublicNav />

            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                        {t('contact.pageTitle')}
                    </h1>
                    <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
                        {t('contact.pageSubtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    <div className="lg:col-span-2 space-y-6">
                        {contactCards.map(({ icon: Icon, labelKey, valueKey, href }) => (
                            <div
                                key={labelKey}
                                className="flex items-start gap-4 p-6 rounded-[1.5rem] border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] flex items-center justify-center shrink-0">
                                    <Icon size={20} className="text-[#1E5144]" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                        {t(labelKey)}
                                    </p>
                                    {href ? (
                                        <a href={href} className="text-sm font-bold text-gray-800 hover:text-green-700 transition-colors">
                                            {t(valueKey)}
                                        </a>
                                    ) : (
                                        <p className="text-sm font-bold text-gray-800">{t(valueKey)}</p>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div className="p-6 rounded-[1.5rem] bg-[#1E5144] text-white">
                            <h3 className="text-lg font-black mb-2">{t('contact.helpTitle')}</h3>
                            <p className="text-sm text-green-100 font-medium leading-relaxed">
                                {t('contact.helpDesc')}
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <form
                            onSubmit={handleSubmit}
                            className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)]"
                        >
                            <h2 className="text-2xl font-black text-gray-900 mb-8">{t('contact.formTitle')}</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label htmlFor="name" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                        {t('contact.nameLabel')}
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder={t('contact.namePlaceholder')}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none font-medium text-gray-800"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                        {t('contact.emailFieldLabel')}
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder={t('contact.emailPlaceholder')}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none font-medium text-gray-800"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label htmlFor="subject" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                    {t('contact.subjectLabel')}
                                </label>
                                <input
                                    id="subject"
                                    name="subject"
                                    type="text"
                                    value={form.subject}
                                    onChange={handleChange}
                                    placeholder={t('contact.subjectPlaceholder')}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none font-medium text-gray-800"
                                />
                            </div>

                            <div className="mb-8">
                                <label htmlFor="message" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                    {t('contact.messageLabel')}
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={5}
                                    value={form.message}
                                    onChange={handleChange}
                                    placeholder={t('contact.messagePlaceholder')}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none font-medium text-gray-800 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-[#41834F] text-white px-10 py-4 rounded-xl font-bold shadow-lg hover:bg-green-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <Send size={18} />
                                {submitting ? t('contact.sending') : t('contact.sendButton')}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <footer className="py-8 bg-gray-50 text-center border-t border-gray-100">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('about.footer')}</p>
            </footer>
        </div>
    );
};

export default Contact;
