import React, { useState } from 'react';
import Navbar from './components/Navbar';
import InputForm from './components/InputForm';
import ProgressBar from './components/ProgressBar';
import ComparisonView from './components/ComparisonView';
import { checkCompliance } from './services/api';
import { SAMPLE_POLICY_QUICKCART, SAMPLE_POLICY_FINPULSE } from './constants/samplePolicies';
import { QUICKCART_BENCHMARK, FINPULSE_BENCHMARK } from './constants/benchmarks';
import { AlertCircle, RotateCcw, ShieldCheck, Scale, ExternalLink } from 'lucide-react';

export default function App() {
  const [policyText, setPolicyText] = useState(SAMPLE_POLICY_QUICKCART);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'results' | 'error'
  const [resultsData, setResultsData] = useState(null);
  const [startTime, setStartTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  // Run live compliance check via backend API
  const handleRunCompliance = async () => {
    if (!policyText.trim() || policyText.trim().length < 50) return;

    setStatus('loading');
    setStartTime(Date.now());
    setErrorMessage(null);

    try {
      const response = await checkCompliance(policyText);
      setResultsData(response);
      setStatus('results');
    } catch (err) {
      console.error('Audit failed:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during the compliance audit.');
      setStatus('error');
    }
  };

  // Instant benchmark demonstration (preserves daily API quota)
  const handleLoadBenchmark = (benchmarkKey) => {
    if (benchmarkKey === 'finpulse') {
      setPolicyText(SAMPLE_POLICY_FINPULSE);
      setResultsData(FINPULSE_BENCHMARK);
    } else {
      setPolicyText(SAMPLE_POLICY_QUICKCART);
      setResultsData(QUICKCART_BENCHMARK);
    }
    setStatus('results');
  };

  const handleReset = () => {
    setStatus('idle');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        {status === 'idle' && (
          <InputForm
            policyText={policyText}
            onChangeText={setPolicyText}
            onSubmit={handleRunCompliance}
            onLoadBenchmark={handleLoadBenchmark}
            isLoading={false}
          />
        )}

        {status === 'loading' && (
          <div className="py-12 px-4">
            <ProgressBar startTime={startTime} />
          </div>
        )}

        {status === 'results' && resultsData && (
          <ComparisonView
            data={resultsData}
            policyText={policyText}
            onReset={handleReset}
          />
        )}

        {status === 'error' && (
          <div className="w-full max-w-2xl mx-auto my-16 p-8 glass-panel rounded-3xl border border-rose-500/30 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Compliance Audit Failed
            </h3>
            <p className="text-sm text-rose-300 font-mono bg-rose-950/40 p-4 rounded-xl border border-rose-900/60 mb-6 text-left break-words">
              {errorMessage}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Return to Editor
              </button>
              <button
                onClick={() => handleLoadBenchmark('quickcart')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30"
              >
                View QuickCart Benchmark
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-6 px-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>DPDP Act 2023 Automated Compliance Checker for Indian Startups</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Model A: gemini-3.7-flash</span>
            <span>•</span>
            <span>Model B: gemini-3.5-flash</span>
            <span>•</span>
            <span>Batched RAG Pipeline v0.2</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
