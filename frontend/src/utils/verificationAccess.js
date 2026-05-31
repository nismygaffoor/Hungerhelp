/**
 * First-time unverified users have full platform access.
 * Access is locked only after admin rejection (including pending re-submission).
 */
export const isAccessLocked = (user) => {
    if (!user || user.role === 'Admin' || user.is_verified) return false;
    if (user.verification_status === 'rejected') return true;
    if (user.rejection_reason) return true;
    return false;
};

export const PROFILE_BY_ROLE = {
    Donor: '/donor/profile',
    Beneficiary: '/beneficiary/profile',
    Volunteer: '/volunteer/profile',
};
