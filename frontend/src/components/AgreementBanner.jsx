import React from 'react';
import { CheckCheck, AlertOctagon, Filter, CheckCircle, HelpCircle } from 'lucide-react';

export default function AgreementBanner({
  agreementRate = 1.0,
  disagreements = [],
  totalItems = 15,
  activeFilter = 'all',
  onFilterChange = () => {},
  counts = { all: 15, disagreed: 0, agreed: 15, missing: 0, met: 0 }
}) {
  const percent = Math.round(agreementRate * 100);
  const isFullConsensus = disagreements.length === 0;

  return (
    <div className="w-full glass-panel rounded-2xl p-6 border border-white/10 relative overflow-hidden page-break-avoid mb-6">
      {/* Top Banner Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className={`p-3 rounded-xl border ${
            isFullConsensus
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
          }`}>
            {isFullConsensus ? (
              <CheckCheck className="w-6 h-6" />
            ) : (
              <AlertOctagon className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-white tracking-tight">
                {isFullConsensus
                  ? `100% Dual-Model Consensus (${totalItems}/${totalItems} Agreed)`
                  : `${percent}% Model Agreement (${disagreements.length} Disagreements Detected)`}
              </h3>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold border ${
                isFullConsensus
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-950 text-amber-300 border-amber-500/40'
              }`}>
                {isFullConsensus ? 'High Confidence Audit' : 'Borderline Compliance Areas'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {isFullConsensus
                ? 'Gemini 3.7 Flash and Gemini 3.5 Flash reached identical statutory conclusions across every checklist requirement.'
                : `Models diverged on ${disagreements.length} items where statutory strictness or implied consent thresholds differed. Review flagged cards below.`}
            </p>
          </div>
        </div>

        {/* Large Percentage Badge */}
        <div className="flex items-center gap-2 self-start md:self-auto px-4 py-2 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
              Agreement Index
            </span>
            <span className={`text-2xl font-black font-mono ${isFullConsensus ? 'text-emerald-400' : 'text-amber-400'}`}>
              {percent}%
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Filter Pills (hidden in print) */}
      <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3 flex-wrap no-print">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Filter Cards:</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* All */}
          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            All Requirements ({counts.all})
          </button>

          {/* Disagreed */}
          <button
            onClick={() => onFilterChange('disagreed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeFilter === 'disagreed'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : disagreements.length > 0
                ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30 hover:bg-amber-900/50'
                : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed opacity-50'
            }`}
            disabled={disagreements.length === 0}
          >
            Disagreements ({disagreements.length})
          </button>

          {/* Agreed */}
          <button
            onClick={() => onFilterChange('agreed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'agreed'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            Agreed ({counts.agreed})
          </button>

          {/* Missing / Non-Compliant */}
          <button
            onClick={() => onFilterChange('missing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'missing'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-slate-900 text-rose-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            Missing ({counts.missing})
          </button>

          {/* Met */}
          <button
            onClick={() => onFilterChange('met')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'met'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-900 text-emerald-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            Met ({counts.met})
          </button>
        </div>
      </div>
    </div>
  );
}
