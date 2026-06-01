import { Navigation2, XCircle, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDialog } from '../../context/DialogContext';
import api from '../../api/axios';

const EscalationActions = ({ role, postId, delivery, onUpdated }) => {
    const { t } = useTranslation();
    const { toast, confirmDialog } = useDialog();

    if (!delivery?.escalated || !delivery?.awaiting_volunteer) {
        return null;
    }

    const handleSelfPickup = async () => {
        const ok = await confirmDialog(t('escalation.confirmSelfPickup'), { variant: 'danger' });
        if (!ok) return;
        try {
            const res = await api.post(`/food/${postId}/self-pickup`);
            toast.success(res.data.message);
            onUpdated?.();
        } catch (err) {
            toast.error(err.response?.data?.error || t('escalation.actionFailed'));
        }
    };

    const handleCancelClaim = async () => {
        const ok = await confirmDialog(t('escalation.confirmCancelClaim'), { variant: 'danger' });
        if (!ok) return;
        try {
            const res = await api.post(`/food/${postId}/cancel-claim`);
            toast.success(res.data.message);
            onUpdated?.();
        } catch (err) {
            toast.error(err.response?.data?.error || t('escalation.actionFailed'));
        }
    };

    const handleDonorDelivery = async () => {
        const ok = await confirmDialog(t('escalation.confirmDonorDelivery'), { variant: 'danger' });
        if (!ok) return;
        try {
            const res = await api.post(`/food/${postId}/donor-delivery`);
            toast.success(res.data.message);
            onUpdated?.();
        } catch (err) {
            toast.error(err.response?.data?.error || t('escalation.actionFailed'));
        }
    };

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-6 space-y-4">
            <div>
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2">
                    {t('escalation.title')}
                </p>
                <p className="text-sm text-amber-900 leading-relaxed">{t('escalation.description')}</p>
            </div>

            {role === 'Beneficiary' && (
                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={handleSelfPickup}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-[#1E5144] text-white hover:bg-[#163d33] transition-colors"
                    >
                        <Navigation2 size={16} className="rotate-90" />
                        {t('escalation.selfPickup')}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancelClaim}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                    >
                        <XCircle size={16} />
                        {t('escalation.cancelClaim')}
                    </button>
                </div>
            )}

            {role === 'Donor' && (
                <button
                    type="button"
                    onClick={handleDonorDelivery}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-[#1E5144] text-white hover:bg-[#163d33] transition-colors"
                >
                    <Truck size={16} />
                    {t('escalation.donorDelivery')}
                </button>
            )}
        </div>
    );
};

export default EscalationActions;
