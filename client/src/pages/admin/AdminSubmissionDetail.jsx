import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Save,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReviewStatusBadge from '../../components/admin/ReviewStatusBadge.jsx';
import {
  EmailStatusBadge,
  SheetStatusBadge,
} from '../../components/admin/SyncStatusBadges.jsx';
import FieldRenderer from '../../components/form/FieldRenderer.jsx';
import { formatFieldAnswer } from '../../schemas/answerMappings.js';
import {
  FIELDS,
  getSectionFields,
  SECTION_9_ID,
  SECTIONS,
} from '../../schemas/formSchema.js';
import {
  fetchAdminSubmissionDetailRequest,
  retrySubmissionEmailsRequest,
  retrySubmissionSheetsRequest,
  saveAdminReviewRequest,
} from '../../services/adminApi.js';

export default function AdminSubmissionDetail() {
  const { sid } = useParams();
  const [submission, setSubmission] = useState(null);
  const [reviewStatus, setReviewStatus] = useState(0);
  const [reviewAnswers, setReviewAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncBusy, setSyncBusy] = useState('');
  const [syncBanner, setSyncBanner] = useState('');
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchAdminSubmissionDetailRequest(sid);
      setSubmission(res.submission);
      setReviewStatus(res.submission?.rs ?? 0);
      setReviewAnswers(res.submission?.rv || {});
    } catch (err) {
      setError(err?.message || 'सबमिशन विवरण लोड करने में त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  }, [sid]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleReviewFieldChange = (fieldId, value) => {
    const key = String(fieldId);
    setSaveMessage('');
    setReviewAnswers((prev) => {
      const next = { ...prev };
      if (value === undefined || value === null || value === '') {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaveMessage('');
    try {
      const res = await saveAdminReviewRequest(sid, {
        rs: reviewStatus,
        rv: reviewAnswers,
      });
      setSubmission(res.submission);
      setReviewStatus(res.submission.rs);
      setReviewAnswers(res.submission.rv || {});
      setSaveMessage('ज़िम्मेदार की समीक्षा सफलतापूर्वक सहेजी गई।');
    } catch (err) {
      setError(err?.message || 'समीक्षा सहेजने में त्रुटि हुई।');
    } finally {
      setSaving(false);
    }
  };

  const handleRetrySync = async (type) => {
    setSyncBusy(type);
    setSyncBanner('');
    setError('');
    try {
      if (type === 'email') {
        await retrySubmissionEmailsRequest(sid);
        setSyncBanner('ईमेल सूचना पुनः प्रयास निष्पादित किया गया।');
      } else {
        await retrySubmissionSheetsRequest(sid);
        setSyncBanner('Google Sheets सिंक पुनः प्रयास निष्पादित किया गया।');
      }
      await loadDetail();
    } catch (err) {
      setError(err?.message || 'सिंक पुनः प्रयास असफल रहा।');
    } finally {
      setSyncBusy('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-900/10 bg-white py-16 text-sm text-slate-600">
        <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
        <span>विवरण लोड हो रहा है...</span>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="space-y-4 rounded-2xl border border-red-200 bg-white p-6 text-center">
        <p className="text-sm font-semibold text-red-700">
          {error || 'यह सबमिशन रिकॉर्ड नहीं मिला।'}
        </p>
        <Link
          to="/admin/submissions"
          className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>सूची पर वापस जाएँ</span>
        </Link>
      </div>
    );
  }

  const memberSections = SECTIONS.filter((s) => s.id !== SECTION_9_ID);
  const section9Fields = getSectionFields(SECTION_9_ID);

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <section className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/admin/submissions"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>सभी जायज़ों पर वापस जाएँ</span>
            </Link>
            <h2 className="mt-1.5 text-xl font-bold text-slate-900">
              {submission.a?.['1'] || 'साथी विवरण'}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              SID: <span className="font-mono font-bold text-slate-800">{submission.sid}</span> •
              महीना: {formatFieldAnswer(FIELDS['2'], submission.month)} •
              सबमिशन: {new Date(submission.createdAt).toLocaleString('hi-IN')}
            </p>
          </div>
          <ReviewStatusBadge status={submission.rs} />
        </div>

        {/* Integration Sync Status Row */}
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600">सिंक स्थिति:</span>
            <EmailStatusBadge status={submission.emailStatus} />
            <SheetStatusBadge status={submission.sheetStatus} />
            {submission.outbox?.lastError && (
              <span className="text-red-700">({submission.outbox.lastError})</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={Boolean(syncBusy)}
              onClick={() => handleRetrySync('email')}
              className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw className={`h-3 w-3 ${syncBusy === 'email' ? 'animate-spin' : ''}`} />
              <span>Retry Email</span>
            </button>
            <button
              type="button"
              disabled={Boolean(syncBusy)}
              onClick={() => handleRetrySync('sheets')}
              className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 disabled:opacity-60"
            >
              <RefreshCw className={`h-3 w-3 ${syncBusy === 'sheets' ? 'animate-spin' : ''}`} />
              <span>Retry Sheets Sync</span>
            </button>
          </div>
        </div>

        {syncBanner && (
          <p className="mt-2 text-xs font-semibold text-emerald-800">{syncBanner}</p>
        )}
      </section>

      {/* Sections 1–8 Decoded Answers */}
      <div className="space-y-4">
        {memberSections.map((section) => {
          const fields = getSectionFields(section.id);
          return (
            <section
              key={section.id}
              className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-xs"
            >
              <h3 className="mb-4 border-b border-slate-100 pb-2.5 text-base font-bold text-emerald-950">
                {section.title}
              </h3>

              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {fields.map((field) => {
                  const rawVal = submission.a?.[String(field.id)];
                  const displayVal = formatFieldAnswer(field, rawVal);
                  const isWide = field.type === 'textarea';

                  return (
                    <div
                      key={field.id}
                      className={`rounded-xl border border-slate-100 bg-slate-50/60 p-3 ${
                        isWide ? 'sm:col-span-2' : ''
                      }`}
                    >
                      <dt className="text-xs font-semibold text-slate-500">
                        {field.reviewLabel || field.label}
                      </dt>
                      <dd
                        className={`mt-1 text-sm whitespace-pre-line ${
                          displayVal
                            ? 'font-medium text-slate-900'
                            : 'italic text-slate-400'
                        }`}
                      >
                        {displayVal || 'उत्तर दर्ज नहीं किया गया'}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </section>
          );
        })}
      </div>

      {/* Section 9: Interactive Responsible Review Editor */}
      <section className="rounded-2xl border-2 border-amber-400/80 bg-white p-5 shadow-xs sm:p-6">
        <div className="mb-4 border-b border-amber-200 pb-3">
          <h3 className="text-lg font-bold text-emerald-950">
            भाग 9 : ज़िम्मेदार की समीक्षा (Responsible Review)
          </h3>
          {submission.reviewedAt && (
            <p className="mt-1 text-xs text-slate-500">
              अंतिम समीक्षा: {new Date(submission.reviewedAt).toLocaleString('hi-IN')}
              {submission.reviewedBy ? ` (${submission.reviewedBy})` : ''}
            </p>
          )}
        </div>

        <form onSubmit={handleSaveReview} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800 sm:text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {saveMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs font-semibold text-emerald-900 sm:text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
              <span>{saveMessage}</span>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label
              htmlFor="review-status-select"
              className="block text-sm font-bold text-slate-800"
            >
              समीक्षा स्थिति (Review Status)
            </label>
            <select
              id="review-status-select"
              value={reviewStatus}
              onChange={(e) => setReviewStatus(Number(e.target.value))}
              className="mt-2 min-h-[44px] w-full max-w-xs rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold focus:border-emerald-700 focus:outline-none"
            >
              <option value={0}>0 — लंबित समीक्षा (Pending Review)</option>
              <option value={1}>1 — समीक्षित (Reviewed)</option>
              <option value={2}>2 — स्वीकृत (Approved)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {section9Fields
              .filter((f) => f.group === 'review_grid')
              .map((field) => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  value={reviewAnswers[String(field.id)]}
                  onChange={handleReviewFieldChange}
                />
              ))}
          </div>

          {section9Fields
            .filter((f) => f.group === 'review_plan')
            .map((field) => (
              <FieldRenderer
                key={field.id}
                field={field}
                value={reviewAnswers[String(field.id)]}
                onChange={handleReviewFieldChange}
              />
            ))}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {section9Fields
              .filter((f) => f.group === 'review_signatures')
              .map((field) => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  value={reviewAnswers[String(field.id)]}
                  onChange={handleReviewFieldChange}
                />
              ))}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-emerald-800 px-6 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-emerald-900 disabled:opacity-70"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>सहेजा जा रहा है...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>समीक्षा सहेजें</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
