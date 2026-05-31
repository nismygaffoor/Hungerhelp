import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { Upload, FileText, Trash2, ExternalLink, Loader2, ShieldCheck, ShieldX, AlertCircle } from 'lucide-react';

const DOC_TYPES = ['National ID', 'Proof of Address', 'Organization Letter', 'Other'];
const DOC_TYPE_KEYS = {
    'National ID': 'nationalId',
    'Proof of Address': 'proofOfAddress',
    'Organization Letter': 'organizationLetter',
    Other: 'other',
};
const BACKEND_URL = 'http://localhost:5000/uploads/';

const STATUS_KEYS = {
    not_submitted: 'notSubmitted',
    pending: 'underReview',
    verified: 'verified',
    rejected: 'rejected',
};

const STATUS_CLASS_NAMES = {
    not_submitted: 'bg-gray-50 text-gray-600 border-gray-100',
    pending: 'bg-amber-50 text-amber-700 border-amber-100',
    verified: 'bg-green-50 text-green-700 border-green-100',
    rejected: 'bg-red-50 text-red-700 border-red-100',
};

const VerificationUpload = ({ profile, onUpdated, accentClass = 'bg-[#1E5144] hover:bg-[#163d33]' }) => {
    const { t } = useTranslation();
    const fileRef = useRef(null);
    const [docType, setDocType] = useState('National ID');
    const [uploading, setUploading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const documents = profile?.verification_documents || [];
    const status = profile?.is_verified ? 'verified' : (profile?.verification_status || 'not_submitted');
    const statusKey = STATUS_KEYS[status] || STATUS_KEYS.not_submitted;
    const statusClassName = STATUS_CLASS_NAMES[status] || STATUS_CLASS_NAMES.not_submitted;
    const rejectionReason = profile?.rejection_reason || '';
    const isRejected = status === 'rejected';
    const isPendingReReview = status === 'pending' && Boolean(rejectionReason);
    const canUpload = !profile?.is_verified;

    const getDocTypeLabel = (type) => t(`components.verificationUpload.docTypes.${DOC_TYPE_KEYS[type] || 'other'}`);

    const handleUpload = async () => {
        const file = fileRef.current?.files?.[0];
        if (!file) {
            alert(t('components.verificationUpload.selectDocumentAlert'));
            return;
        }

        const formData = new FormData();
        formData.append('document', file);
        formData.append('doc_type', docType);

        setUploading(true);
        try {
            await api.post('/users/verification-documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const msg = isRejected || rejectionReason
                ? t('components.verificationUpload.reverifySuccess')
                : t('components.verificationUpload.uploadSuccess');
            alert(msg);
            fileRef.current.value = '';
            onUpdated?.();
        } catch (err) {
            alert(err.response?.data?.error || t('components.verificationUpload.uploadFailed'));
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (docId) => {
        if (!confirm(t('components.verificationUpload.removeConfirm'))) return;
        setDeletingId(docId);
        try {
            await api.delete(`/users/verification-documents/${docId}`);
            onUpdated?.();
        } catch (err) {
            alert(err.response?.data?.error || t('components.verificationUpload.removeFailed'));
        } finally {
            setDeletingId(null);
        }
    };

    const getFileUrl = (filename) => {
        if (!filename) return '#';
        return filename.startsWith('http') ? filename : `${BACKEND_URL}${filename}`;
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{t('components.verificationUpload.title')}</h3>
                    <p className="text-xs text-gray-500 mt-1">{t('components.verificationUpload.subtitle')}</p>
                </div>
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${statusClassName}`}>
                    {t(`components.verificationUpload.status.${statusKey}`)}
                </span>
            </div>

            {(isRejected || isPendingReReview) && rejectionReason && (
                <div className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 ${
                    isRejected ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'
                }`}>
                    {isRejected ? (
                        <ShieldX className="text-red-500 shrink-0 mt-0.5" size={20} />
                    ) : (
                        <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                    )}
                    <div>
                        <p className={`text-sm font-black ${isRejected ? 'text-red-800' : 'text-amber-800'}`}>
                            {isRejected ? t('components.verificationUpload.accountRejected') : t('components.verificationUpload.reverifyUnderReview')}
                        </p>
                        <p className={`text-xs mt-1 ${isRejected ? 'text-red-700' : 'text-amber-700'}`}>
                            <span className="font-bold">{t('components.verificationUpload.adminReason')}</span> {rejectionReason}
                        </p>
                        {isRejected ? (
                            <p className="text-xs text-red-600 mt-2">
                                {t('components.verificationUpload.rejectedInstructions')}
                            </p>
                        ) : (
                            <p className="text-xs text-amber-700 mt-2">
                                {t('components.verificationUpload.reverifyPendingInstructions')}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {!profile?.is_verified && status === 'pending' && !rejectionReason && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                    <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                    <div>
                        <p className="text-sm font-black text-amber-800">{t('components.verificationUpload.documentsUnderReview')}</p>
                        <p className="text-xs text-amber-700 mt-1">
                            {t('components.verificationUpload.documentsUnderReviewDesc')}
                        </p>
                    </div>
                </div>
            )}

            {canUpload && (
                <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                        {isRejected || rejectionReason ? t('components.verificationUpload.reuploadForVerification') : t('components.verificationUpload.uploadDocuments')}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <select
                            value={docType}
                            onChange={(e) => setDocType(e.target.value)}
                            className="border border-gray-100 bg-white rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                        >
                            {DOC_TYPES.map(type => (
                                <option key={type} value={type}>{getDocTypeLabel(type)}</option>
                            ))}
                        </select>
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-white file:font-bold file:text-gray-700"
                        />
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-black uppercase tracking-widest disabled:opacity-60 ${accentClass}`}
                        >
                            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                            {uploading ? t('components.verificationUpload.uploading') : isRejected || rejectionReason ? t('components.verificationUpload.submitForRereview') : t('components.verificationUpload.upload')}
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium">{t('components.verificationUpload.acceptedFormats')}</p>
                </div>
            )}

            {documents.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-gray-200 rounded-2xl">
                    <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500 font-medium">{t('components.verificationUpload.noDocumentsUploaded')}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {documents.map((doc) => (
                        <div key={doc._id} className="flex items-center justify-between gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 bg-white rounded-xl text-[#1E5144] shrink-0">
                                    <FileText size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-800 truncate">{doc.original_name || doc.doc_type}</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{getDocTypeLabel(doc.doc_type)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <a
                                    href={getFileUrl(doc.filename)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-400 hover:text-[#1E5144] hover:bg-green-50 rounded-lg transition-all"
                                    title={t('components.verificationUpload.viewDocument')}
                                >
                                    <ExternalLink size={16} />
                                </a>
                                {canUpload && (
                                    <button
                                        onClick={() => handleDelete(doc._id)}
                                        disabled={deletingId === doc._id}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                        title={t('components.verificationUpload.removeDocument')}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {profile?.is_verified && (
                <div className="mt-4 flex items-center gap-2 text-green-700 bg-green-50 rounded-xl px-4 py-3 text-sm font-medium">
                    <ShieldCheck size={18} />
                    {t('components.verificationUpload.verifiedMessage')}
                </div>
            )}
        </div>
    );
};

export default VerificationUpload;
