import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import {
    X,
    FileText,
    ExternalLink,
    User as UserIcon,
    Mail,
    Phone,
    MapPin,
    ShieldCheck,
    ShieldX,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { useDialog } from '../../context/DialogContext';

const BACKEND_URL = 'http://localhost:5000/uploads/';

const DOC_TYPE_KEYS = {
    'National ID': 'nationalId',
    'Proof of Address': 'proofOfAddress',
    'Organization Letter': 'organizationLetter',
    Other: 'other',
};

const getFileUrl = (filename) => {
    if (!filename) return '';
    return filename.startsWith('http') ? filename : `${BACKEND_URL}${filename}`;
};

const isImageFile = (name = '') => /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
const isPdfFile = (name = '') => /\.pdf$/i.test(name);

const VerificationReviewModal = ({ userId, onClose, onUpdated }) => {
    const { t } = useTranslation();
    const { toast, confirmDialog } = useDialog();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [selectedDocId, setSelectedDocId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [error, setError] = useState('');

    const getDocTypeLabel = (type) => t(`components.verificationUpload.docTypes.${DOC_TYPE_KEYS[type] || 'other'}`);

    useEffect(() => {
        fetchUser();
    }, [userId]);

    const fetchUser = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/admin/users/${userId}`);
            setUser(res.data);
            const docs = res.data.verification_documents || [];
            if (docs.length > 0) {
                setSelectedDocId(docs[0]._id);
            }
        } catch (err) {
            setError(err.response?.data?.error || t('components.verificationReviewModal.failedLoadUser'));
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        const docCount = user?.verification_documents?.length || 0;
        if (docCount === 0) {
            toast.warning(t('components.verificationReviewModal.noDocumentsAlert'));
            return;
        }
        const name = user.name || user.businessName;
        const ok = await confirmDialog(t('components.verificationReviewModal.verifyConfirm', { name }), { variant: 'danger' });
        if (!ok) return;

        setVerifying(true);
        try {
            await api.post(`/admin/users/${userId}/verify`);
            onUpdated?.('verified');
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.error || t('components.verificationReviewModal.verifyFailed'));
        } finally {
            setVerifying(false);
        }
    };

    const handleReject = async () => {
        const name = user.name || user.businessName;
        const ok = await confirmDialog(t('components.verificationReviewModal.rejectConfirm', { name }), { variant: 'danger' });
        if (!ok) return;

        setRejecting(true);
        try {
            await api.post(`/admin/users/${userId}/reject`, {
                reason: rejectReason.trim() || undefined,
            });
            onUpdated?.('rejected');
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.error || t('components.verificationReviewModal.rejectFailed'));
        } finally {
            setRejecting(false);
        }
    };

    const documents = user?.verification_documents || [];
    const selectedDoc = documents.find((d) => d._id === selectedDocId);
    const previewUrl = selectedDoc ? getFileUrl(selectedDoc.filename) : '';
    const previewName = selectedDoc?.original_name || selectedDoc?.filename || '';
    const locationParts = [user?.home_address, user?.city, user?.district].filter(Boolean);
    const isRejected = user?.verification_status === 'rejected';
    const isVerified = user?.is_verified;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                    <div>
                        <h3 className="text-lg font-black text-gray-900">{t('components.verificationReviewModal.title')}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {t('components.verificationReviewModal.subtitle')}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-[#1E5144]" size={36} />
                    </div>
                ) : error ? (
                    <div className="p-8 text-center">
                        <AlertCircle className="mx-auto text-red-400 mb-3" size={32} />
                        <p className="text-red-600 font-medium">{error}</p>
                    </div>
                ) : (
                    <>
                        {(isVerified || isRejected) && (
                            <div className={`mx-6 mt-4 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 ${
                                isRejected ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'
                            }`}>
                                {isRejected ? <ShieldX size={16} /> : <ShieldCheck size={16} />}
                                {isRejected ? t('components.verificationReviewModal.accountRejected') : t('components.verificationReviewModal.accountVerified')}
                                {isRejected && user.rejection_reason && (
                                    <span className="font-normal text-red-600"> — {user.rejection_reason}</span>
                                )}
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 lg:divide-x divide-gray-100">
                                <div className="lg:col-span-2 p-6 space-y-5">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t('components.verificationReviewModal.userDetails')}</p>
                                        <div className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#1E5144]">
                                                    <UserIcon size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900">{user.name || user.businessName}</p>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#1E5144]">{t(`roles.${(user.role || '').toLowerCase()}`, user.role)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                <Mail size={14} className="text-gray-400 shrink-0" />
                                                {user.email}
                                            </div>
                                            {user.contact && (
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <Phone size={14} className="text-gray-400 shrink-0" />
                                                    {user.contact}
                                                </div>
                                            )}
                                            {(locationParts.length > 0 || user.address) && (
                                                <div className="flex items-start gap-2 text-xs text-gray-600">
                                                    <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                                                    <span>{locationParts.join(', ') || user.address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                            {t('components.verificationReviewModal.uploadedDocuments', { count: documents.length })}
                                        </p>
                                        {documents.length === 0 ? (
                                            <div className="text-center py-8 bg-amber-50 rounded-2xl border border-amber-100">
                                                <AlertCircle className="mx-auto text-amber-500 mb-2" size={24} />
                                                <p className="text-sm text-amber-800 font-medium">{t('components.verificationReviewModal.noDocumentsUploaded')}</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {documents.map((doc) => (
                                                    <button
                                                        key={doc._id}
                                                        onClick={() => setSelectedDocId(doc._id)}
                                                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                                                            selectedDocId === doc._id
                                                                ? 'bg-[#E8F5E9] border-[#1E5144]/30'
                                                                : 'bg-white border-gray-100 hover:border-gray-200'
                                                        }`}
                                                    >
                                                        <FileText size={18} className="text-[#1E5144] shrink-0" />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-bold text-gray-800 truncate">{doc.original_name || doc.doc_type}</p>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase">{getDocTypeLabel(doc.doc_type)}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="lg:col-span-3 p-6 bg-gray-50/50 min-h-[320px] flex flex-col">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('components.verificationReviewModal.documentPreview')}</p>
                                        {selectedDoc && (
                                            <a
                                                href={previewUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-xs font-bold text-[#1E5144] hover:underline"
                                            >
                                                {t('components.verificationReviewModal.openInNewTab')} <ExternalLink size={14} />
                                            </a>
                                        )}
                                    </div>

                                    {!selectedDoc ? (
                                        <div className="flex-1 flex items-center justify-center border border-dashed border-gray-200 rounded-2xl bg-white">
                                            <p className="text-sm text-gray-400">{t('components.verificationReviewModal.selectDocumentPreview')}</p>
                                        </div>
                                    ) : isImageFile(previewName) || isImageFile(selectedDoc.filename) ? (
                                        <div className="flex-1 flex items-center justify-center bg-white rounded-2xl border border-gray-100 overflow-hidden p-2">
                                            <img src={previewUrl} alt={previewName} className="max-w-full max-h-[420px] object-contain rounded-lg" />
                                        </div>
                                    ) : isPdfFile(previewName) || isPdfFile(selectedDoc.filename) ? (
                                        <iframe src={previewUrl} title={previewName} className="flex-1 w-full min-h-[420px] rounded-2xl border border-gray-100 bg-white" />
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 p-8">
                                            <FileText size={48} className="text-gray-300 mb-4" />
                                            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#1E5144] hover:underline">
                                                {t('components.verificationReviewModal.downloadViewFile')}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {showRejectForm && (
                            <div className="px-6 py-3 border-t border-red-100 bg-red-50/50">
                                <label className="text-[10px] font-black text-red-600 uppercase tracking-widest">{t('components.verificationReviewModal.rejectionReasonLabel')}</label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder={t('components.verificationReviewModal.rejectionReasonPlaceholder')}
                                    className="w-full mt-2 p-3 rounded-xl border border-red-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
                                    rows={2}
                                />
                            </div>
                        )}

                        <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap gap-3 shrink-0 bg-white">
                            <button
                                onClick={onClose}
                                className="py-3 px-5 rounded-xl font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200"
                            >
                                {t('common.close')}
                            </button>
                            {user.role !== 'Admin' && (
                                <>
                                    <button
                                        onClick={() => {
                                            if (!showRejectForm) {
                                                setShowRejectForm(true);
                                                return;
                                            }
                                            handleReject();
                                        }}
                                        disabled={rejecting}
                                        className="py-3 px-5 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {rejecting ? <Loader2 size={16} className="animate-spin" /> : <ShieldX size={16} />}
                                        {rejecting ? t('components.verificationReviewModal.rejecting') : isVerified ? t('components.verificationReviewModal.revokeReject') : t('components.verificationReviewModal.rejectUser')}
                                    </button>
                                    <button
                                        onClick={handleVerify}
                                        disabled={verifying || documents.length === 0}
                                        className="flex-1 min-w-[180px] py-3 rounded-xl font-bold text-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {verifying ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                                        {verifying ? t('components.verificationReviewModal.verifying') : isRejected ? t('components.verificationReviewModal.reapproveVerify') : t('components.verificationReviewModal.approveVerify')}
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerificationReviewModal;
