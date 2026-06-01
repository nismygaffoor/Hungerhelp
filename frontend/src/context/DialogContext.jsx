import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const DialogContext = createContext(null);

const TOAST_ICONS = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const TOAST_STYLES = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const TOAST_ICON_STYLES = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-amber-600',
    info: 'text-blue-600',
};

export const DialogProvider = ({ children }) => {
    const { t } = useTranslation();
    const [confirmState, setConfirmState] = useState(null);
    const [toasts, setToasts] = useState([]);

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback((type, message, duration = 4500) => {
        if (!message) return;
        const id = `${Date.now()}-${Math.random()}`;
        setToasts((prev) => [...prev, { id, type, message }]);
        window.setTimeout(() => dismissToast(id), duration);
    }, [dismissToast]);

    const toast = useMemo(() => ({
        success: (message) => addToast('success', message),
        error: (message) => addToast('error', message),
        warning: (message) => addToast('warning', message),
        info: (message) => addToast('info', message),
    }), [addToast]);

    const confirmDialog = useCallback((message, options = {}) => {
        return new Promise((resolve) => {
            setConfirmState({
                message,
                title: options.title || t('common.confirmTitle'),
                confirmLabel: options.confirmLabel || t('common.confirm'),
                cancelLabel: options.cancelLabel || t('common.cancel'),
                variant: options.variant || 'primary',
                resolve,
            });
        });
    }, [t]);

    const closeConfirm = (result) => {
        confirmState?.resolve(result);
        setConfirmState(null);
    };

    return (
        <DialogContext.Provider value={{ toast, confirmDialog }}>
            {children}

            {confirmState && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        aria-label={t('common.close')}
                        onClick={() => closeConfirm(false)}
                    />
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
                                    confirmState.variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-[#E8F5E9] text-[#1E5144]'
                                }`}>
                                    <AlertTriangle size={22} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-black text-gray-900">{confirmState.title}</h3>
                                    <p className="text-sm text-gray-600 mt-2 leading-relaxed whitespace-pre-line">
                                        {confirmState.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => closeConfirm(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                {confirmState.cancelLabel}
                            </button>
                            <button
                                type="button"
                                onClick={() => closeConfirm(true)}
                                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${
                                    confirmState.variant === 'danger'
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : 'bg-[#1E5144] hover:bg-[#163d33]'
                                }`}
                            >
                                {confirmState.confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed top-4 right-4 z-[190] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
                {toasts.map(({ id, type, message }) => {
                    const Icon = TOAST_ICONS[type] || Info;
                    return (
                        <div
                            key={id}
                            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-sm ${TOAST_STYLES[type]}`}
                            role="alert"
                        >
                            <Icon size={20} className={`shrink-0 mt-0.5 ${TOAST_ICON_STYLES[type]}`} />
                            <p className="flex-1 text-sm font-semibold leading-relaxed">{message}</p>
                            <button
                                type="button"
                                onClick={() => dismissToast(id)}
                                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                                aria-label={t('common.close')}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </DialogContext.Provider>
    );
};

export const useDialog = () => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('useDialog must be used within DialogProvider');
    }
    return context;
};

export default DialogContext;
