import { useCallback, useEffect, useRef, useState } from 'react';
import { ASSESSMENT_MONTH_FIELD_ID } from '../schemas/formSchema.js';
import {
  clearDraft,
  createEmptyDraft,
  extractPersonalInfo,
  hasSavedDraftData,
  loadDraft,
  saveDraft,
} from '../services/localStorageService.js';

const DEBOUNCE_MS = 350;

/**
 * Hook that manages the assessment draft state with automatic debounced
 * Local Storage persistence, reload restoration, and flush-on-unload protection.
 */
export function useAutoSave() {
  const initialLoadRef = useRef(null);
  if (initialLoadRef.current === null) {
    initialLoadRef.current = loadDraft();
  }

  const [draft, setDraft] = useState(() => initialLoadRef.current.draft);
  const [restoredFromStorage, setRestoredFromStorage] = useState(
    () => initialLoadRef.current.found && hasSavedDraftData(initialLoadRef.current.draft)
  );
  const [saveStatus, setSaveStatus] = useState(() => {
    if (!initialLoadRef.current.ok) return 'error';
    return initialLoadRef.current.found ? 'saved' : 'idle';
  });
  const [saveError, setSaveError] = useState(() => initialLoadRef.current.error);
  const [lastSavedAt, setLastSavedAt] = useState(
    () => initialLoadRef.current.draft?.updatedAt ?? null
  );

  // Track pending save mode across renders without mutating state inside updaters
  const pendingModeRef = useRef(null); // null | 'debounced' | 'immediate'
  const latestDraftRef = useRef(draft);
  const timerRef = useRef(null);

  const performSave = useCallback((draftToSave) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const result = saveDraft(draftToSave);
    pendingModeRef.current = null;
    if (result.ok) {
      setSaveStatus('saved');
      setSaveError(null);
      setLastSavedAt(result.updatedAt);
    } else {
      setSaveStatus('error');
      setSaveError(result.error);
    }
    return result;
  }, []);

  // Trigger debounced or immediate save cleanly whenever `draft` updates
  useEffect(() => {
    latestDraftRef.current = draft;
    const mode = pendingModeRef.current;
    if (!mode) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (mode === 'immediate') {
      performSave(draft);
      return;
    }

    setSaveStatus('saving');
    setSaveError(null);
    timerRef.current = setTimeout(() => {
      performSave(latestDraftRef.current);
    }, DEBOUNCE_MS);
  }, [draft, performSave]);

  // Flush unsaved debounced edits immediately on page reload / tab close
  useEffect(() => {
    const handleFlush = () => {
      if (pendingModeRef.current !== null) {
        saveDraft(latestDraftRef.current);
        pendingModeRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleFlush();
      }
    };

    window.addEventListener('beforeunload', handleFlush);
    window.addEventListener('pagehide', handleFlush);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      window.removeEventListener('beforeunload', handleFlush);
      window.removeEventListener('pagehide', handleFlush);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const updateAnswer = useCallback((fieldId, value) => {
    const key = String(fieldId);
    pendingModeRef.current = 'debounced';
    setDraft((prev) => {
      const nextAnswers = { ...prev.answers };
      const isEmpty =
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0);

      if (isEmpty) {
        delete nextAnswers[key];
      } else {
        nextAnswers[key] = value;
      }

      const nextDraft = {
        ...prev,
        assessmentMonth:
          key === ASSESSMENT_MONTH_FIELD_ID
            ? value || ''
            : nextAnswers[ASSESSMENT_MONTH_FIELD_ID] ?? prev.assessmentMonth,
        personalInfo: extractPersonalInfo(nextAnswers),
        answers: nextAnswers,
      };
      latestDraftRef.current = nextDraft;
      return nextDraft;
    });
  }, []);

  const setCurrentSection = useCallback((sectionNumber) => {
    setDraft((prev) => {
      if (prev.currentSection === sectionNumber) return prev;
      pendingModeRef.current = 'immediate';
      const nextDraft = {
        ...prev,
        currentSection: sectionNumber,
      };
      latestDraftRef.current = nextDraft;
      return nextDraft;
    });
  }, []);

  const flushSave = useCallback(() => {
    return performSave(latestDraftRef.current);
  }, [performSave]);

  const resetDraft = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    pendingModeRef.current = null;
    const res = clearDraft();
    const empty = createEmptyDraft();
    latestDraftRef.current = empty;
    setDraft(empty);
    setRestoredFromStorage(false);
    setLastSavedAt(null);
    if (res.ok) {
      setSaveStatus('idle');
      setSaveError(null);
    } else {
      setSaveStatus('error');
      setSaveError(res.error);
    }
    return res.ok;
  }, []);

  return {
    draft,
    answers: draft.answers,
    currentSection: draft.currentSection,
    assessmentMonth: draft.assessmentMonth,
    saveStatus,
    saveError,
    lastSavedAt,
    restoredFromStorage,
    hasDraftData: hasSavedDraftData(draft),
    updateAnswer,
    setCurrentSection,
    flushSave,
    resetDraft,
  };
}
