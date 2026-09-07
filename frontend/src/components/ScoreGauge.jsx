import React from 'react';
import { Award, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';

export default function ScoreGauge({
  score = 0,
  modelName = "Model",
  tag = "Model A",
  results = [],
}) {
  // Score color tiers
  const isHigh = score >= 70;
  const isMedium = score >= 40 && score < 70;
  const isLow = score < 40;

  const colorClass = isHigh
    ? "text-emerald-400"
    : isMedium
    ? "text-amber-400"
    : "text-rose-400";

  const strokeColor = isHigh
    ? "#34d399"
    : isMedium
    ? "#fbbf24"
    : "#f87171";

  const statusLabel = isHigh
    ? "Substantially Compliant"
    : isMedium
    ? "Moderate / Partial Risk"
    : "High Regulatory Risk";

  const badgeBg = isHigh
    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
    : isMedium
    ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
    : "bg-rose-500/10 text-rose-300 border-rose-500/30";

  // Item counts
  const metCount = results.filter(r => r.status === 'Met').length;
  const partialCount = results.filter(r => r.status === 'Partially Met').length;
  const missingCount = results.filter(r => r.status === 'Missing').length;

  // SVG ring math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center relative overflow-hidden page-break-avoid">
      {/* Top Model header */}
      <div className="w-full flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {tag}
          </span>
          <span className="text-sm font-semibold text-white tracking-tight">
            {modelName}
          </span>
        </div>
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${badgeBg}`}>
          {statusLabel}
        </span>
      </div>

      {/* SVG Circular Gauge */}
      <div className="relative w-36 h-36 my-2 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            className="stroke-slate-800/80"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Animated score circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-extrabold tracking-tight font-mono ${colorClass}`}>
            {score.toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-semibold">
            DPDP Score
          </span>
        </div>
      </div>

      {/* Status Breakdown Pills */}
      <div className="w-full grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5 text-xs font-mono">
        <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-center">
          <div className="text-emerald-400 font-bold text-sm">{metCount}</div>
          <div className="text-[10px] text-slate-400">Met (1.0)</div>
        </div>
        <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-500/20 text-center">
          <div className="text-amber-400 font-bold text-sm">{partialCount}</div>
          <div className="text-[10px] text-slate-400">Partial (0.5)</div>
        </div>
        <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-500/20 text-center">
          <div className="text-rose-400 font-bold text-sm">{missingCount}</div>
          <div className="text-[10px] text-slate-400">Missing (0.0)</div>
        </div>
      </div>
    </div>
  );
}
