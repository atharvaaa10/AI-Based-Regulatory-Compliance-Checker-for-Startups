import React, { useState, useEffect } from 'react';
import { Sparkles, Database, Scale, CheckCircle2, Clock } from 'lucide-react';

const STAGES = [
  {
    label: "Retrieving Grounding Clauses",
    desc: "Fetching top statutory sections from local DPDP Act vector index (top-4 per requirement)...",
    icon: Database,
    color: "from-blue-500 to-cyan-400",
    minTime: 0,
    maxTime: 6,
  },
  {
    label: "Analyzing with Model A (Gemini 3.7 Flash)",
    desc: "Evaluating all 15 checklist items with statutory grounding and zero truncation headroom...",
    icon: Sparkles,
    color: "from-cyan-500 to-indigo-500",
    minTime: 6,
    maxTime: 16,
  },
  {
    label: "Analyzing with Model B (Gemini 3.5 Flash)",
    desc: "Executing independent baseline legal audit to contrast strictness and detect hallucinated citations...",
    icon: Scale,
    color: "from-indigo-500 to-purple-500",
    minTime: 16,
    maxTime: 25,
  },
  {
    label: "Synthesizing Consensus & Citations",
    desc: "Cross-validating cited sections against retrieved context, computing agreement rate & generating fixes...",
    icon: CheckCircle2,
    color: "from-purple-500 to-pink-500",
    minTime: 25,
    maxTime: 35,
  },
];

export default function ProgressBar({ startTime }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const diffSec = Math.floor((now - startTime) / 1000);
      setElapsed(diffSec);
    }, 500);

    return () => clearInterval(timer);
  }, [startTime]);

  // Determine current active stage index
  let currentStageIndex = 0;
  if (elapsed >= 25) currentStageIndex = 3;
  else if (elapsed >= 16) currentStageIndex = 2;
  else if (elapsed >= 6) currentStageIndex = 1;
  else currentStageIndex = 0;

  // Approximate progress percentage capped at 96% until resolved
  const progressPercent = Math.min(96, Math.max(8, Math.round((elapsed / 32) * 100)));
  const currentStage = STAGES[currentStageIndex];
  const CurrentIcon = currentStage.icon;

  return (
    <div className="w-full max-w-4xl mx-auto my-12 p-8 rounded-2xl glass-panel border border-indigo-500/20 shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header with live timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
            <CurrentIcon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white tracking-tight">
              {currentStage.label}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              {currentStage.desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 font-mono text-xs text-indigo-300 self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Elapsed: <strong className="text-white">{elapsed}s</strong> / ~30s</span>
        </div>
      </div>

      {/* Main animated progress bar */}
      <div className="relative w-full h-3 bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-slate-700/50 mb-8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500 ease-out shadow-lg shadow-indigo-500/50"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 4 Multi-stage steps visualizer */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative z-10">
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIndex;
          const isActive = idx === currentStageIndex;
          const StepIcon = stage.icon;

          return (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-xs transition-all ${
                isActive
                  ? 'bg-indigo-950/40 border-indigo-500/50 ring-1 ring-indigo-500/30 text-indigo-200'
                  : isDone
                  ? 'bg-slate-900/50 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-900/20 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <StepIcon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400 animate-spin' : isDone ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span className="font-semibold uppercase tracking-wider text-[10px]">
                  Step {idx + 1}
                </span>
              </div>
              <p className="font-medium line-clamp-1">{stage.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
