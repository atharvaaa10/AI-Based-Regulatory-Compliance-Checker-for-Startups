import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, XCircle, FileText, Wrench, Sparkles, Cpu, BookOpen } from 'lucide-react';
import { CHECKLIST_METADATA } from '../constants/samplePolicies';

function StatusBadge({ status }) {
  if (status === 'Met') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        Met
      </span>
    );
  }
  if (status === 'Partially Met') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        Partially Met
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30">
      <XCircle className="w-3.5 h-3.5 text-rose-400" />
      Missing
    </span>
  );
}

export default function RequirementCard({
  index = 1,
  itemA,
  itemB,
  isDisagreement = false,
}) {
  const metadata = CHECKLIST_METADATA[itemA.id] || { category: "General DPDP", sections: [] };

  return (
    <div className={`rounded-2xl border transition-all page-break-avoid ${
      isDisagreement
        ? 'bg-slate-900/90 border-amber-500/50 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
        : 'glass-panel border-white/10 hover:border-white/20'
    } p-5 sm:p-6 mb-4`}>
      {/* Requirement Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
        <div className="flex items-start sm:items-center gap-3">
          <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center justify-center font-mono text-xs font-bold">
            #{String(index).padStart(2, '0')}
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                {itemA.requirement}
              </h4>
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {metadata.category}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                ID: <code className="text-indigo-300">{itemA.id}</code>
              </span>
            </div>
          </div>
        </div>

        {/* Disagreement / Agreement Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
          {isDisagreement ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              Models Disagree
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Consensus
            </span>
          )}
        </div>
      </div>

      {/* Dual Model Comparison Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Model A Card */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-cyan-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-white/5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-cyan-300">Model A</span>
                <span className="text-[11px] text-slate-400 font-mono">(gemini-3.7-flash)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  {itemA.confidence}% conf
                </span>
                <StatusBadge status={itemA.status} />
              </div>
            </div>

            {/* Cited Sections */}
            <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
              <BookOpen className="w-3 h-3 text-slate-400" />
              <span className="text-[11px] text-slate-400 font-mono">Citations:</span>
              {itemA.cited_sections && itemA.cited_sections.length > 0 ? (
                itemA.cited_sections.map((sec, i) => (
                  <span key={i} className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                    {sec}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-500 italic">None cited</span>
              )}
            </div>

            {/* Reason */}
            <div className="text-xs text-slate-300 leading-relaxed mb-3">
              <strong className="text-slate-400 font-medium">Evaluation: </strong>
              {itemA.reason}
            </div>
          </div>

          {/* Remediation Fix */}
          {itemA.suggested_fix && (
            <div className="mt-2 p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200">
              <div className="flex items-center gap-1.5 font-semibold text-indigo-300 text-[11px] mb-1">
                <Wrench className="w-3 h-3" />
                Statutory Fix
              </div>
              <p className="leading-snug">{itemA.suggested_fix}</p>
            </div>
          )}
        </div>

        {/* Model B Card */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-purple-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-white/5">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-mono font-bold text-purple-300">Model B</span>
                <span className="text-[11px] text-slate-400 font-mono">(gemini-3.5-flash)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">
                  {itemB.confidence}% conf
                </span>
                <StatusBadge status={itemB.status} />
              </div>
            </div>

            {/* Cited Sections */}
            <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
              <BookOpen className="w-3 h-3 text-slate-400" />
              <span className="text-[11px] text-slate-400 font-mono">Citations:</span>
              {itemB.cited_sections && itemB.cited_sections.length > 0 ? (
                itemB.cited_sections.map((sec, i) => (
                  <span key={i} className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30">
                    {sec}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-500 italic">None cited</span>
              )}
            </div>

            {/* Reason */}
            <div className="text-xs text-slate-300 leading-relaxed mb-3">
              <strong className="text-slate-400 font-medium">Evaluation: </strong>
              {itemB.reason}
            </div>
          </div>

          {/* Remediation Fix */}
          {itemB.suggested_fix && (
            <div className="mt-2 p-2.5 rounded-lg bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200">
              <div className="flex items-center gap-1.5 font-semibold text-purple-300 text-[11px] mb-1">
                <Wrench className="w-3 h-3" />
                Statutory Fix
              </div>
              <p className="leading-snug">{itemB.suggested_fix}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
