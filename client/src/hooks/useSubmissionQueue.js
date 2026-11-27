import { useCallback, useEffect, useRef, useState } from 'react';
import { checkHealthRequest } from '../services/api.js';
import { loadPendingQueue } from '../services/submissionQueue.js';
import {
  buildSubmissionPayload,
  processDuePendingSubmissions,
  retryPendingSubmission,
  submitNewAssessment,
} from '../services/submissionService.js';

/**
 * Manages the persistent pending submission queue (`ghf_pending_submissions_v1`),
 * automatic retry on reopen / internet reconnection / exponential backoff,
 * and draft cleanup strictly after backend acknowledgement.
 */
export function useSubmissionQueue({ draft, flushSave, resetDraft }) {
  const [pendingItems, setPendingItems] = useState(() => loadPendingQueue());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryingSid, setRetryingSid] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [confirmedReceipt, setConfirmedReceipt] = useState(null);

  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const syncQueueState = useCallback(() => {
    setPendingItems(loadPendingQueue());
  }, []);

  const handleConfirmedSuccess = useCallback(
    (result) => {
      if (!result?.ok) return;
      const currentAnswers = buildSubmissionPayload(
        draftRef.current?.answers || {},
        result.sid
      ).answers;
      const submittedAnswers = result.submittedAnswers;
      // Clear draft ONLY if current draft answers still match the submitted payload
      if (
        !submittedAnswers ||
        JSON.stringify(currentAnswers) === JSON.stringify(submittedAnswers)
      ) {
        resetDraft();
      }
      setSubmissionError(null);
      setConfirmedReceipt({
        sid: result.sid,
        status: result.status,
        month: result.month,
        confirmedAt: new Date().toISOString(),
      });
    },
    [resetDraft]
  );

  const runDueRetries = useCallback(
    async ({ forceAll = false } = {}) => {
      const currentQueue = loadPendingQueue();
      if (currentQueue.length === 0) return;

      const results = await processDuePendingSubmissions({ forceAll });
      syncQueueState();
      for (const res of results) {
        if (res.ok) {
          handleConfirmedSuccess(res);
        }
      }
    },
    [handleConfirmedSuccess, syncQueueState]
  );

  // On mount: warm up backend & immediately retry any pending submissions from previous session
  useEffect(() => {
    const initialQueue = loadPendingQueue();
    if (initialQueue.length > 0) {
      runDueRetries({ forceAll: true });
    } else {
      // Non-blocking warm-up ping for Render free-tier cold start
      checkHealthRequest().catch(() => {});
    }
  }, [runDueRetries]);

  // Auto-retry immediately when browser regains internet connectivity
  useEffect(() => {
    const handleOnline = () => {
      runDueRetries({ forceAll: true });
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [runDueRetries]);

  // Schedule next exponential-backoff retry timer whenever pendingItems changes
  useEffect(() => {
    const activePending = pendingItems.filter((item) => item.status === 'pending');
    if (activePending.length === 0) return undefined;

    const earliestNextRetry = Math.min(
      ...activePending.map((item) => item.nextRetryAt || Date.now())
    );
    const delayMs = Math.max(1000, earliestNextRetry - Date.now());

    const timerId = setTimeout(() => {
      runDueRetries({ forceAll: false });
    }, delayMs);

    return () => clearTimeout(timerId);
  }, [pendingItems, runDueRetries]);

  const submitForm = useCallback(
    async (answers) => {
      setIsSubmitting(true);
      setSubmissionError(null);
      setConfirmedReceipt(null);

      try {
        const saveRes = flushSave();
        const draftUpdatedAt =
          saveRes?.updatedAt ?? draftRef.current?.updatedAt ?? null;

        const result = await submitNewAssessment({ answers, draftUpdatedAt });
        syncQueueState();

        if (result.ok) {
          handleConfirmedSuccess(result);
        } else {
          setSubmissionError({
            kind: result.kind,
            sid: result.sid || null,
            message: result.message,
            errors: result.errors || [],
          });
        }
        return result;
      } finally {
        setIsSubmitting(false);
      }
    },
    [flushSave, handleConfirmedSuccess, syncQueueState]
  );

  const retryOne = useCallback(
    async (sid) => {
      setRetryingSid(sid);
      setSubmissionError(null);
      try {
        const result = await retryPendingSubmission(sid);
        syncQueueState();
        if (result.ok) {
          handleConfirmedSuccess(result);
        } else {
          setSubmissionError({
            kind: result.kind,
            sid: result.sid || sid,
            message: result.message,
            errors: result.errors || [],
          });
        }
        return result;
      } finally {
        setRetryingSid(null);
      }
    },
    [handleConfirmedSuccess, syncQueueState]
  );

  const clearReceipt = useCallback(() => {
    setConfirmedReceipt(null);
  }, []);

  return {
    pendingItems,
    isSubmitting,
    retryingSid,
    submissionError,
    confirmedReceipt,
    submitForm,
    retryOne,
    runDueRetries,
    clearReceipt,
  };
}
