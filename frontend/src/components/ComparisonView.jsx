import React, { useState } from 'react';
import ScoreGauge from './ScoreGauge';
import AgreementBanner from './AgreementBanner';
import RequirementCard from './RequirementCard';
import ExportBar from './ExportBar';
import { ShieldCheck, FileCheck2, AlertCircle, Info, Calendar, Hash } from 'lucide-react';

export default function ComparisonView({
  data,
  policyText = "",
  onReset = () => {}
}) {
  const [activeFilter, setActiveFilter] = useState('all');

  const { model_a, model_b, agreement_rate, disagreements = [] } = data;

  const itemsA = model_a?.results || [];
  const itemsB = model_b?.results || [];

  // Map disagreement IDs for quick lookup
  const disagreementIds = new Set(disagreements.map(d => d.item_id));

  // Count metrics for filters
  const counts = {
    all: itemsA.length,
    disagreed: disagreements.length,
    agreed: itemsA.length - disagreements.length,
    missing: itemsA.filter(a => a.status === 'Missing' || itemsB.find(b => b.id === a.id)?.status === 'Missing').length,
    met: itemsA.filter(a => a.status === 'Met' && itemsB.find(b => b.id === a.id)?.status === 'Met').length,
  };

  // Filter items based on active filter (for screen view)
  const filteredItems = itemsA.filter((itemA) => {
    const itemB = itemsB.find(b => b.id === itemA.id) || itemA;
    const isDisagreed = disagreementIds.has(itemA.id);

    if (activeFilter === 'disagreed') return isDisagreed;
    if (activeFilter === 'agreed') return !isDisagreed;
    if (activeFilter === 'missing') return itemA.status === 'Missing' || itemB.status === 'Missing';
    if (activeFilter === 'met') return itemA.status === 'Met' && itemB.status === 'Met';
    return true; // 'all'
  });

  const wordCount = policyText.trim() ? policyText.trim().split(/\s+/).length : 0;
  const auditDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* Print-Only Formal Report Header */}
      <div className="hidden print-only mb-8 pb-4 border-b-2 border-slate-300">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              India DPDP Act 2023 Statutory Compliance Audit Report
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Automated Dual-Model Statutory Evaluation · Grounded RAG Analysis
            </p>
          </div>
          <div className="text-right text-xs font-mono text-slate-600">
            <div><strong>Date:</strong> {auditDate}</div>
            <div><strong>Standard:</strong> Digital Personal Data Protection Act 2023</div>
          </div>
        </div>
      </div>

      {/* Screen Executive Header Banner */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-white/10 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Compliance Evaluation Results
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-0.5">
              <span>{wordCount} words evaluated</span>
              <span>•</span>
              <span>15 Statutory DPDP Requirements</span>
              <span>•</span>
              <span>{auditDate}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono">
            RAG Grounded: <strong className="text-indigo-400">dpdp_act_full_text.txt</strong>
          </span>
        </div>
      </div>

      {/* Top Gauges Grid: Overview + Model A Gauge + Model B Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Executive Summary Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between page-break-avoid">
          <div>
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Executive Audit Summary
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Dual-model consensus is measured by evaluating identical statutory provisions against India's DPDP Act 2023. Model A acts as primary analyzer, while Model B provides an independent verification check.
            </p>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-white/5 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total Requirements:</span>
              <span className="font-bold text-white">15</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Consensus Items:</span>
              <span className="font-bold text-emerald-400">{counts.agreed} / 15</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Divergent Items:</span>
              <span className={`font-bold ${counts.disagreed > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                {counts.disagreed}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Overall Agreement:</span>
              <span className={`font-bold ${agreement_rate === 1.0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {(agreement_rate * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Model A Gauge (gemini-3.7-flash) */}
        <ScoreGauge
          score={model_a.score}
          modelName={model_a.model_name}
          tag="Model A (Primary)"
          results={model_a.results}
        />

        {/* Model B Gauge (gemini-3.5-flash) */}
        <ScoreGauge
          score={model_b.score}
          modelName={model_b.model_name}
          tag="Model B (Baseline)"
          results={model_b.results}
        />
      </div>

      {/* Agreement Banner with consensus statistics and filter chips */}
      <AgreementBanner
        agreementRate={agreement_rate}
        disagreements={disagreements}
        totalItems={itemsA.length}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={counts}
      />

      {/* Filter Active Notice (screen only) */}
      {activeFilter !== 'all' && (
        <div className="no-print mb-4 flex items-center justify-between px-4 py-2 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-300">
          <span>
            Showing <strong>{filteredItems.length}</strong> of <strong>{itemsA.length}</strong> requirements matching filter: <code className="text-white font-bold">{activeFilter}</code>
          </span>
          <button
            onClick={() => setActiveFilter('all')}
            className="text-indigo-400 hover:text-white underline text-[11px]"
          >
            Clear Filter (Show All 15)
          </button>
        </div>
      )}

      {/* Requirements List (Screen view renders filteredItems; Print view renders ALL 15 items) */}
      <div className="space-y-4">
        {/* On screen: render filtered items */}
        <div className="no-print space-y-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((itemA, idx) => {
              const originalIndex = itemsA.findIndex(i => i.id === itemA.id) + 1;
              const itemB = itemsB.find(b => b.id === itemA.id) || itemA;
              const isDisagreed = disagreementIds.has(itemA.id);

              return (
                <RequirementCard
                  key={itemA.id}
                  index={originalIndex}
                  itemA={itemA}
                  itemB={itemB}
                  isDisagreement={isDisagreed}
                />
              );
            })
          ) : (
            <div className="p-8 text-center glass-panel rounded-2xl border border-white/10 text-slate-400">
              <p>No requirements match the selected filter.</p>
              <button
                onClick={() => setActiveFilter('all')}
                className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>

        {/* In Print: Always render all 15 items sequentially */}
        <div className="hidden print-only space-y-4">
          {itemsA.map((itemA, idx) => {
            const itemB = itemsB.find(b => b.id === itemA.id) || itemA;
            const isDisagreed = disagreementIds.has(itemA.id);

            return (
              <RequirementCard
                key={itemA.id}
                index={idx + 1}
                itemA={itemA}
                itemB={itemB}
                isDisagreement={isDisagreed}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom Export Bar */}
      <ExportBar
        resultsData={data}
        onReset={onReset}
      />
    </div>
  );
}
