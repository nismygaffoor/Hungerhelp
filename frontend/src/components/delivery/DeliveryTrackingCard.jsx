import { Truck, User, MapPin, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { translateStatus } from '../../i18n/donorVolunteerI18n';

const DELIVERY_STATUS_STYLES = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-100',
    Assigned: 'bg-blue-50 text-blue-700 border-blue-100',
    PickedUp: 'bg-purple-50 text-purple-700 border-purple-100',
    Delivered: 'bg-green-50 text-green-700 border-green-100',
};

const getDisplayDeliveryStatus = (status) => {
    if (status === 'PickedUp') return 'In Transit';
    return status;
};

const formatLocation = (location) => {
    if (!location) return '';
    return location.split('|')[0].trim();
};

const DeliveryTrackingCard = ({ delivery, showDropoff = false }) => {
    const { t } = useTranslation();

    if (!delivery || !delivery.delivery_status) {
        return null;
    }

    const status = delivery.delivery_status;
    const displayStatus = getDisplayDeliveryStatus(status);
    const statusStyle = DELIVERY_STATUS_STYLES[status] || 'bg-gray-50 text-gray-700 border-gray-100';

    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-[#E8F5E9] rounded-xl">
                    <Truck size={20} className="text-[#1E5144]" />
                </div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {t('deliveryTracking.title')}
                </h3>
            </div>

            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        {t('deliveryTracking.deliveryStatus')}
                    </span>
                    <span className={`text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest border ${statusStyle}`}>
                        {translateStatus(displayStatus, t)}
                    </span>
                </div>

                {status === 'Pending' ? (
                    <p className="text-sm text-gray-600 leading-relaxed flex items-start gap-2">
                        <Clock size={16} className="text-amber-500 shrink-0 mt-0.5" />
                        {delivery.escalated
                            ? t('deliveryTracking.escalatedWaiting')
                            : t('deliveryTracking.waitingForVolunteer')}
                    </p>
                ) : (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <User size={18} className="text-[#1E5144] shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                {t('deliveryTracking.volunteer')}
                            </p>
                            <p className="text-sm font-bold text-gray-900">
                                {delivery.volunteer_name || t('deliveryTracking.notAssigned')}
                            </p>
                        </div>
                    </div>
                )}

                {showDropoff && delivery.dropoff_location && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <MapPin size={18} className="text-[#1E5144] shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                {t('deliveryTracking.dropoffLocation')}
                            </p>
                            <p className="text-sm font-bold text-gray-800">
                                {formatLocation(delivery.dropoff_location)}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryTrackingCard;
