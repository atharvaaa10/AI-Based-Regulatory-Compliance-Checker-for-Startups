import React from 'react';
import { ShieldCheck, Sparkles, Scale, BookOpen, ArrowRight, Trash2, Zap, FileText } from 'lucide-react';
import { SAMPLE_POLICY_QUICKCART, SAMPLE_POLICY_FINPULSE } from '../constants/samplePolicies';

export default function InputForm({
  policyText = "",
  onChangeText = () => {},
  onSubmit = () => {},
  onLoadBenchmark = () => {},
  isLoading = false,
}) {
  const wordCount = policyText.trim() ? policyText.trim().split(/\s+/).length : 0;
  const charCount = policyText.length;
  const isTooShort = charCount < 50;

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Hero Header */}
      <div className="text-center mb-8 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          RAG-Grounded Statutory Legal Auditor · DPDP Act 2023
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          Audit Startup Privacy Policies Against <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            India's DPDP Act 2023
          </span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Retrieves exact grounding clauses from India's Digital Personal Data Protection Act and evaluates policy clauses across dual Gemini models (<strong className="text-slate-200">Gemini 3.7 Flash</strong> vs <strong className="text-slate-200">Gemini 3.5 Flash</strong>) to detect regulatory risks and compliance divergence.
        </p>
      </div>

      {/* Main Input Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative">
        {/* Top toolbar & pre-fills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Load Sample Startup Benchmarks:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* QuickCart Sample */}
            <button
              type="button"
              onClick={() => onChangeText(SAMPLE_POLICY_QUICKCART)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-950/40 text-rose-300 border border-rose-500/30 hover:bg-rose-900/40 transition-all flex items-center gap-1.5"
            >
              <span>QuickCart (Non-Compliant)</span>
            </button>

            {/* FinPulse Sample */}
            <button
              type="button"
              onClick={() => onChangeText(SAMPLE_POLICY_FINPULSE)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-950/40 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900/40 transition-all flex items-center gap-1.5"
            >
              <span>FinPulse (Divergence Demo)</span>
            </button>

            {/* Clear button */}
            {policyText && (
              <button
                type="button"
                onClick={() => onChangeText('')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Text Area */}
        <div className="relative mb-4">
          <textarea
            value={policyText}
            onChange={(e) => onChangeText(e.target.value)}
            placeholder="Paste complete startup privacy policy text here (minimum 50 characters)..."
            rows={14}
            className="w-full rounded-2xl bg-slate-950/80 border border-white/10 p-4 sm:p-5 text-sm font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-y leading-relaxed"
          />

          {/* Word / Character count pill */}
          <div className="absolute bottom-4 right-4 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-700/60 font-mono text-[11px] text-slate-400 flex items-center gap-3 shadow-lg pointer-events-none">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} chars</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>Audits all 15 statutory requirements in 1 single batched API call per model</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Quick Demo Pre-calculated results button */}
            <button
              type="button"
              onClick={() => {
                if (policyText.includes("FinPulse")) {
                  onLoadBenchmark("finpulse");
                } else {
                  onLoadBenchmark("quickcart");
                }
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-all flex items-center gap-1.5"
              title="Load empirical benchmark instantly without waiting or spending daily API quota"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant Benchmark View</span>
            </button>

            {/* Primary Submit Live API Button */}
            <button
              type="button"
              disabled={isTooShort || isLoading}
              onClick={onSubmit}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xl flex items-center gap-2 transition-all ${
                isTooShort || isLoading
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <span>Run Compliance Audit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 15 Requirements Preview Grid */}
      <div className="mt-8 p-6 rounded-2xl glass-panel-subtle border border-white/5">
        <div className="flex items-center gap-2 mb-3 text-xs font-mono font-semibold text-indigo-300 uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          15 Statutory DPDP Act 2023 Requirements Evaluated
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs font-mono text-slate-400">
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">1. Purpose Specificity</div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">2. Consent Mechanism</div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">3. Notice Before Collect</div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">4. Consent Withdrawal</div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">5. Lawful Basis</div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">6. Data Minimisation</div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">7. Retention & Erasure</div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">8. Security Safeguards</div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">9. Breach Intimation</div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">10. Right of Access</div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">11. Correction & Erasure</div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">12. Grievance Officer</div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">13. Children Data (Sec 9)</div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">14. Third-Party Sharing</div>
          <div className="p-2 rounded bg-slate-900/60 border border-slate-800">15. Cross-Border Transfer</div>
        </div>
      </div>
    </div>
  );
}
