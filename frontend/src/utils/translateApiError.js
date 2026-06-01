const EXACT_MAP = {
    'Admin access required': 'api.adminAccessRequired',
    'User not found': 'api.userNotFound',
    'Cannot modify admin accounts': 'api.cannotModifyAdmin',
    'User has not uploaded verification documents': 'api.noVerificationDocs',
    'Cannot reject admin accounts': 'api.cannotRejectAdmin',
    'Post not found': 'api.postNotFound',
    'Delivery task not found': 'api.deliveryNotFound',
    'Email, password, and role are required': 'api.loginFieldsRequired',
    'Invalid email or password': 'api.invalidCredentials',
    'No valid fields to update': 'api.noValidFields',
    'Email already exists': 'api.emailExists',
    'Token is missing': 'api.tokenMissing',
    'Token has expired': 'api.tokenExpired',
    'Invalid token': 'api.invalidToken',
    'Token invalid': 'api.tokenInvalid',
    'Only donors can post food': 'api.onlyDonorsPost',
    'Missing required fields (food_type)': 'api.missingFoodType',
    'District and city are required': 'api.districtCityRequired',
    'Location is required': 'api.locationRequired',
    'Only donors can fulfill requests': 'api.onlyDonorsFulfill',
    'Missing request_id or beneficiary_id': 'api.missingRequestIds',
    'Only beneficiaries can claim food': 'api.onlyBeneficiariesClaim',
    'Food post not found or already claimed': 'api.postNotFoundOrClaimed',
    'Only beneficiaries can create food requests': 'api.onlyBeneficiariesCreateRequest',
    'Only beneficiaries can delete requests': 'api.onlyBeneficiariesDeleteRequest',
    'Request not found': 'api.requestNotFound',
    'You can only delete your own requests': 'api.deleteOwnRequestsOnly',
    'Failed to delete request': 'api.deleteRequestFailed',
    'Only beneficiaries can update requests': 'api.onlyBeneficiariesUpdateRequest',
    'You can only edit your own requests': 'api.editOwnRequestsOnly',
    'Matched requests cannot be edited. Check My Claims for delivery progress.': 'api.matchedRequestNotEditable',
    'This request was removed': 'api.requestRemoved',
    'Nothing to update': 'api.nothingToUpdate',
    'This request was already matched by a donor. Check My Claims for delivery progress.': 'api.requestAlreadyMatched',
    'Unsupported role': 'api.unsupportedRole',
    'Admins cannot upload verification documents': 'api.adminNoUpload',
    'No document file provided': 'api.noDocumentFile',
    'Invalid file': 'api.invalidFile',
    'Allowed formats: PDF, JPG, JPEG, PNG': 'api.allowedFormats',
    'Document not found': 'api.documentNotFound',
    'Unauthorized': 'api.unauthorized',
    'Only volunteers can see delivery tasks': 'api.onlyVolunteersViewTasks',
    'Only volunteers can accept tasks': 'api.onlyVolunteersAccept',
    'Failed to accept task or task already taken': 'api.acceptTaskFailed',
    'Invalid status': 'api.invalidStatus',
    'Unauthorized or task not found': 'api.unauthorizedOrTaskNotFound',
    'Failed to update status': 'api.updateStatusFailed',
    'Post not found': 'api.postNotFound',
    'You do not have permission to view this donation': 'api.noDonationPermission',
    'Invalid post ID': 'api.invalidPostId',
    'Missing status': 'api.missingStatus',
    'Status updated': 'api.statusUpdated',
    'Failed to update': 'api.updateFailed',
    'Missing update data': 'api.missingUpdateData',
    'Login successful': 'api.loginSuccess',
    'Profile updated successfully': 'api.profileUpdated',
    'User created successfully': 'api.userCreated',
    'Food request created successfully': 'api.requestCreated',
    'Request deleted successfully': 'api.requestDeleted',
    'Request updated successfully': 'api.requestUpdated',
    'Food post created': 'api.foodPostCreated',
    'Request fulfilled successfully. Delivery task created.': 'api.requestFulfilled',
    'Food claimed successfully. Delivery task created.': 'api.foodClaimed',
    'Document uploaded successfully': 'api.documentUploaded',
    'Document removed successfully': 'api.documentRemoved',
    'User verified successfully': 'api.userVerified',
    'User rejected successfully': 'api.userRejected',
    'Food post rejected and hidden from the platform': 'api.postRejected',
    'Food post approved and published': 'api.postApproved',
    'Task accepted successfully': 'api.taskAccepted',
    'Your re-submitted documents are under review. Platform access stays locked until an admin re-approves your account.': 'api.resubmitUnderReview',
    'Your account was rejected. Please re-upload verification documents in your profile. Food and claim features stay locked until an admin re-approves you.': 'api.accountRejectedLocked',
};

const PATTERNS = [
    {
        test: (msg) => /^Status must be one of:/.test(msg),
        key: 'api.statusMustBeOneOf',
        params: (msg) => ({ list: msg.replace('Status must be one of: ', '') }),
    },
    {
        test: (msg) => msg.startsWith('This account is registered as a '),
        key: 'api.wrongRoleLogin',
        params: (msg) => {
            const match = msg.match(/This account is registered as a (.+), not a (.+)/);
            return match ? { registered: match[1], attempted: match[2] } : {};
        },
    },
    {
        test: (msg) => msg.endsWith(' is required'),
        key: 'api.fieldRequired',
        params: (msg) => ({ field: msg.replace(' is required', '') }),
    },
    {
        test: (msg) => msg.startsWith('Failed to fulfill request:'),
        key: 'api.fulfillRequestFailed',
    },
    {
        test: (msg) => msg.startsWith('Failed to claim food:'),
        key: 'api.claimFoodFailed',
    },
    {
        test: (msg) => msg.startsWith('Delivery updated to '),
        key: 'api.deliveryUpdated',
        params: (msg) => ({ status: msg.replace('Delivery updated to ', '') }),
    },
    {
        test: (msg) => msg.startsWith('Status updated to '),
        key: 'api.statusUpdatedTo',
        params: (msg) => ({ status: msg.replace('Status updated to ', '') }),
    },
];

export const translateApiMessage = (message, t) => {
    if (!message || typeof message !== 'string') return message;

    const exactKey = EXACT_MAP[message];
    if (exactKey) {
        const translated = t(exactKey);
        return translated !== exactKey ? translated : message;
    }

    for (const pattern of PATTERNS) {
        if (pattern.test(message)) {
            const params = pattern.params ? pattern.params(message) : {};
            const translated = t(pattern.key, params);
            return translated !== pattern.key ? translated : message;
        }
    }

    return message;
};

export default translateApiMessage;
