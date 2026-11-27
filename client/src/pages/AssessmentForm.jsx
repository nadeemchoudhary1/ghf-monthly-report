import { CheckCircle2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionRenderer from '../components/form/SectionRenderer.jsx';
import PrivacyNotice from '../components/layout/PrivacyNotice.jsx';
import ProgressBar from '../components/navigation/ProgressBar.jsx';
import SectionNavigation from '../components/navigation/SectionNavigation.jsx';
import { SECTIONS } from '../schemas/formSchema.js';
import { validateAllAnswers } from '../utils/formValidation.js';

export default function AssessmentForm({
  answers,
  currentSection,
  restoredFromStorage,
  onUpdateAnswer,
  onSelectSection,
}) {
  const navigate = useNavigate();
  const [showRestoredBanner, setShowRestoredBanner] = useState(restoredFromStorage);

  useEffect(() => {
    setShowRestoredBanner(restoredFromStorage);
  }, [restoredFromStorage]);

  const errors = validateAllAnswers(answers);

  const handleGoToSection = (sectionId) => {
    const clamped = Math.max(1, Math.min(SECTIONS.length, sectionId));
    onSelectSection(clamped);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevious = () => {
    if (currentSection > 1) {
      handleGoToSection(currentSection - 1);
    }
  };

  const handleNext = () => {
    if (currentSection < SECTIONS.length) {
      handleGoToSection(currentSection + 1);
    } else {
      navigate('/review');
    }
  };

  const handleGoToReview = () => {
    navigate('/review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-5">
      {showRestoredBanner && (
        <div
          className="flex items-center justify-between gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs text-emerald-950 sm:text-sm"
          role="status"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
            <span>
              पिछला सहेजा गया ड्राफ्ट स्वतः पुनः लोड किया गया है (भाग {currentSection} से जारी)।
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowRestoredBanner(false)}
            className="rounded-lg p-1 text-emerald-800 hover:bg-emerald-100"
            aria-label="सूचना बंद करें"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <ProgressBar
        currentSection={currentSection}
        answers={answers}
        onSelectSection={handleGoToSection}
        onGoToReview={handleGoToReview}
      />

      <SectionRenderer
        sectionId={currentSection}
        answers={answers}
        errors={errors}
        onChange={onUpdateAnswer}
      />

      <SectionNavigation
        currentSection={currentSection}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onGoToReview={handleGoToReview}
      />

      <PrivacyNotice compact />
    </div>
  );
}
