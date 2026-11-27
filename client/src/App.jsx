import { Loader2, RefreshCw, WifiOff } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute.jsx';
import ConfirmDialog from './components/layout/ConfirmDialog.jsx';
import Footer from './components/layout/Footer.jsx';
import Header from './components/layout/Header.jsx';
import { AdminAuthProvider } from './context/AdminAuthContext.jsx';
import { useAutoSave } from './hooks/useAutoSave.js';
import { useSubmissionQueue } from './hooks/useSubmissionQueue.js';
import AssessmentForm from './pages/AssessmentForm.jsx';
import Home from './pages/Home.jsx';
import ReviewPage from './pages/ReviewPage.jsx';

// Route-based code splitting: Admin bundle is loaded only when visiting /admin/*
const AdminLayout = lazy(() => import('./components/admin/AdminLayout.jsx'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin.jsx'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminSubmissions = lazy(() => import('./pages/admin/AdminSubmissions.jsx'));
const AdminSubmissionDetail = lazy(() => import('./pages/admin/AdminSubmissionDetail.jsx'));
const AdminIntegrations = lazy(() => import('./pages/admin/AdminIntegrations.jsx'));
const AdminSystemHealth = lazy(() => import('./pages/admin/AdminSystemHealth.jsx'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings.jsx'));

function AdminRouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-emerald-50/40 p-6">
      <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-white px-5 py-3.5 text-sm font-semibold text-emerald-900 shadow-xs">
        <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
        <span>एडमिन मॉड्यूल लोड हो रहा है...</span>
      </div>
    </div>
  );
}

function PublicPortalShell() {
  const {
    draft,
    answers,
    currentSection,
    saveStatus,
    saveError,
    lastSavedAt,
    restoredFromStorage,
    hasDraftData,
    updateAnswer,
    setCurrentSection,
    flushSave,
    resetDraft,
  } = useAutoSave();

  const {
    pendingItems,
    isSubmitting,
    retryingSid,
    submissionError,
    confirmedReceipt,
    submitForm,
    retryOne,
    clearReceipt,
  } = useSubmissionQueue({ draft, flushSave, resetDraft });

  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const handleConfirmClear = () => {
    resetDraft();
    setClearDialogOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        saveStatus={saveStatus}
        saveError={saveError}
        lastSavedAt={lastSavedAt}
        hasDraftData={hasDraftData}
        onRequestClearDraft={() => setClearDialogOpen(true)}
      />

      {pendingItems.length > 0 && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-950 sm:px-6">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 shrink-0 text-amber-700" />
              <span>
                <strong>{pendingItems.length}</strong> सबमिशन ब्राउज़र कतार में सुरक्षित है और
                कनेक्शन उपलब्ध होने पर स्वतः पुनः भेजा जाएगा।
              </span>
            </div>
            <button
              type="button"
              disabled={Boolean(retryingSid)}
              onClick={() => retryOne(pendingItems[0].sid)}
              className="inline-flex min-h-[32px] items-center gap-1 rounded-lg bg-amber-600 px-3 py-1 font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${retryingSid ? 'animate-spin' : ''}`}
              />
              <span>अभी पुनः भेजें</span>
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <Routes>
          <Route
            index
            element={
              <Home
                answers={answers}
                currentSection={currentSection}
                hasDraftData={hasDraftData}
                lastSavedAt={lastSavedAt}
                onSelectSection={setCurrentSection}
                onRequestClearDraft={() => setClearDialogOpen(true)}
              />
            }
          />
          <Route
            path="form"
            element={
              <AssessmentForm
                answers={answers}
                currentSection={currentSection}
                restoredFromStorage={restoredFromStorage}
                onUpdateAnswer={updateAnswer}
                onSelectSection={setCurrentSection}
              />
            }
          />
          <Route
            path="review"
            element={
              <ReviewPage
                draft={draft}
                answers={answers}
                pendingItems={pendingItems}
                isSubmitting={isSubmitting}
                retryingSid={retryingSid}
                submissionError={submissionError}
                confirmedReceipt={confirmedReceipt}
                onSelectSection={setCurrentSection}
                onSubmitForm={submitForm}
                onRetryPending={retryOne}
                onClearReceipt={clearReceipt}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      <ConfirmDialog
        open={clearDialogOpen}
        title="सहेजा गया ड्राफ्ट साफ़ करें?"
        message="क्या आप वाकई ब्राउज़र में सहेजे गए सभी उत्तरों को हटाना चाहते हैं? साफ़ करने के बाद यह डेटा वापस नहीं आ सकेगा।"
        confirmLabel="हाँ, ड्राफ्ट साफ़ करें"
        cancelLabel="नहीं, सुरक्षित रखें"
        onConfirm={handleConfirmClear}
        onCancel={() => setClearDialogOpen(false)}
      />
    </div>
  );
}

function AdminRoutes() {
  return (
    <AdminAuthProvider>
      <Suspense fallback={<AdminRouteFallback />}>
        <Routes>
          <Route path="login" element={<AdminLogin />} />
          <Route element={<AdminProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="submissions" element={<AdminSubmissions />} />
              <Route path="submissions/:sid" element={<AdminSubmissionDetail />} />
              <Route path="integrations" element={<AdminIntegrations />} />
              <Route path="system-health" element={<AdminSystemHealth />} />
              <Route path="change-password" element={<AdminSettings />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Suspense>
    </AdminAuthProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/*" element={<PublicPortalShell />} />
      </Routes>
    </BrowserRouter>
  );
}
