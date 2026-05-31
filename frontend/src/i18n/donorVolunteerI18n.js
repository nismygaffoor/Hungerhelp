/** Shared status/category label helpers for donor & volunteer pages */
export const translateStatus = (status, t) => {
    const keyMap = {
        Delivered: 'delivered',
        'In Transit': 'inTransit',
        'Pending Pickup': 'pendingPickup',
        Claimed: 'claimed',
        Available: 'available',
        Active: 'active',
        Expired: 'expired',
        Assigned: 'assigned',
        PickedUp: 'pickedUp',
        Pending: 'pending',
        Paused: 'paused',
        Cancelled: 'cancelled',
        Rejected: 'rejected',
        Fulfilled: 'fulfilled',
    };
    const key = keyMap[status];
    return key ? t(`status.${key}`) : status;
};

export const CATEGORY_KEY_MAP = {
    Vegetables: 'vegetables',
    Fruits: 'fruits',
    'Cooked Meals': 'cookedMeals',
    'Baked Goods': 'bakedGoods',
    'Grains & Rice': 'grainsRice',
    Dairy: 'dairy',
    'Meat & Poultry': 'meatPoultry',
    'Canned Food': 'cannedFood',
    Beverages: 'beverages',
    Other: 'other',
};

export const FOOD_CATEGORIES = Object.keys(CATEGORY_KEY_MAP);

export const translateCategory = (category, t) => {
    const key = CATEGORY_KEY_MAP[category];
    return key ? t(`donor.categories.${key}`) : category;
};

export const translateBeneficiaryCategory = (category, t) => {
    const key = CATEGORY_KEY_MAP[category];
    return key ? t(`beneficiary.categories.${key}`) : category;
};

export const URGENCY_KEY_MAP = {
    Normal: 'normal',
    Medium: 'medium',
    High: 'high',
};

export const translateUrgency = (urgency, t) => {
    const key = URGENCY_KEY_MAP[urgency];
    return key ? t(`donor.urgency.${key}`) : urgency;
};

export const translateBeneficiaryUrgency = (urgency, t) => {
    const key = URGENCY_KEY_MAP[urgency];
    return key ? t(`beneficiary.urgency.${key}`) : urgency;
};

export const formatExpiryCountdown = (expiryTime, t) => {
    if (!expiryTime) return t('beneficiary.noExpirySet');
    const diff = new Date(expiryTime) - new Date();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (diff < 0) return t('status.expired');
    if (days > 0) return t('beneficiary.daysLeft', { count: days });
    if (hours > 0) return t('beneficiary.hoursLeft', { count: hours });
    return t('beneficiary.expiresSoon');
};

export const BENEFICIARY_TYPE_KEY_MAP = {
    "Elder's Home": 'eldersHome',
    Orphanage: 'orphanage',
    Individual: 'individual',
    'Community Center': 'communityCenter',
    Shelter: 'shelter',
};

export const translateBeneficiaryType = (type, t) => {
    const key = BENEFICIARY_TYPE_KEY_MAP[type];
    return key ? t(`donor.beneficiaryTypes.${key}`) : type;
};

export const FREQUENCY_KEY_MAP = {
    Daily: 'daily',
    Weekly: 'weekly',
    Monthly: 'monthly',
    Everyday: 'everyday',
};

export const translateFrequency = (frequency, t) => {
    const key = FREQUENCY_KEY_MAP[frequency];
    return key ? t(`donor.frequency.${key}`) : frequency;
};

export const DAY_KEY_MAP = {
    Monday: 'monday',
    Tuesday: 'tuesday',
    Wednesday: 'wednesday',
    Thursday: 'thursday',
    Friday: 'friday',
    Saturday: 'saturday',
    Sunday: 'sunday',
    Everyday: 'everyday',
};

export const translateDay = (day, t) => {
    const key = DAY_KEY_MAP[day];
    return key ? t(`donor.days.${key}`) : day;
};

export const FOOD_CATEGORIES = [
    'Vegetables',
    'Fruits',
    'Cooked Meals',
    'Baked Goods',
    'Grains & Rice',
    'Dairy',
    'Meat & Poultry',
    'Canned Food',
    'Beverages',
    'Other',
];
