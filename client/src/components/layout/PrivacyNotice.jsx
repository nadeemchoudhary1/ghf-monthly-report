import { ShieldCheck } from 'lucide-react';

export default function PrivacyNotice({ compact = false }) {
  return (
    <div
      className={`rounded-xl border border-emerald-200 bg-emerald-50/80 text-emerald-950 ${
        compact ? 'px-3.5 py-2.5 text-xs' : 'p-4 text-sm'
      }`}
      role="note"
      aria-label="Local Storage Privacy Notice"
    >
      <div className="flex items-start gap-2.5">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
        <p className="leading-relaxed">
          <span className="font-semibold">डेटा सुरक्षा सूचना (लोकल ड्राफ्ट):</span>{' '}
          आपके द्वारा भरा गया अधूरा फ़ॉर्म डेटा केवल इसी ब्राउज़र के लोकल स्टोरेज (
          <code className="rounded bg-emerald-100 px-1 py-0.5 text-[11px] font-mono text-emerald-900">
            ghf_assessment_draft_v1
          </code>
          ) में स्वतः सहेजा जाता है (यह दूसरे डिवाइस या ब्राउज़र पर सिंक नहीं होता)। साझा कंप्यूटर या फोन उपयोग
          करने पर कृपया फ़ॉर्म पूरा होने या बीच में छोड़ने पर &quot;ड्राफ्ट साफ़ करें&quot; का उपयोग करें।
          &quot;जायज़ा सबमिट करें&quot; दबाने पर ही आपका डेटा सुरक्षित सर्वर पर भेजा जाता है।
        </p>
      </div>
    </div>
  );
}
