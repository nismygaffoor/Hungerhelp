export const DISTRICTS = [
    'Colombo',
    'Gampaha',
    'Kalutara',
    'Kandy',
    'Matale',
    'Nuwara Eliya',
    'Galle',
    'Matara',
    'Hambantota',
    'Jaffna',
    'Kilinochchi',
    'Mannar',
    'Vavuniya',
    'Mullaitivu',
    'Batticaloa',
    'Ampara',
    'Trincomalee',
    'Kurunegala',
    'Puttalam',
    'Anuradhapura',
    'Polonnaruwa',
    'Badulla',
    'Monaragala',
    'Ratnapura',
    'Kegalle',
];

export const buildLocationAddress = ({ district, homeAddress, city, homeNo, home_no, road }) => {
    const home = homeAddress || homeNo || home_no || '';
    const cityVal = city || road || '';
    const parts = [];
    if (district) parts.push(district);
    if (home) parts.push(home);
    if (cityVal) parts.push(cityVal);
    return parts.join(', ');
};

const getStructuredParts = (record) => ({
    district: record?.district || '',
    homeAddress: record?.home_address || record?.home_no || '',
    city: record?.city || record?.road || '',
});

export const getPostDistrict = (post) => {
    if (post?.district) return post.district;
    const address = (post?.location || '').split(' | ')[0] || '';
    const match = DISTRICTS.find((d) => address.startsWith(`${d},`) || address === d);
    return match || '';
};

export const getPostAddressDisplay = (post) => {
    const { district, homeAddress, city } = getStructuredParts(post);
    if (district || homeAddress || city) {
        return buildLocationAddress({ district, homeAddress, city });
    }
    return (post?.location || '').split(' | ')[0] || post?.address || 'Address not set';
};

export const getRequestAddressDisplay = (request) => {
    const { district, homeAddress, city } = getStructuredParts(request);
    if (district || homeAddress || city) {
        return buildLocationAddress({ district, homeAddress, city });
    }
    return request?.location || request?.address || 'Address not set';
};

export const getRequestDistrict = (request) => {
    if (request?.district) return request.district;
    const address = (request?.location || request?.address || '').split(' | ')[0].trim();
    const match = DISTRICTS.find((d) => address.startsWith(`${d},`) || address === d);
    return match || '';
};
