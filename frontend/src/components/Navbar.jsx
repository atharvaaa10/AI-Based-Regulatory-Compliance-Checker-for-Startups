import React, { useEffect, useState } from 'react';
import { ShieldCheck, Cpu, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { checkHealth } from '../services/api';

export default function Navbar() {
  const [backendOnline, setBackendOnline] = useState(null);

  useEffect(() => {
    let mounted = true;
    checkHealth().then(status => {
      if (mounted) setBackendOnline(status);
    });
    return () => { mounted = false; };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                DPDP Act Compliance Checker
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                  DPDP 2023
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Statutory RAG Grounding · Dual-Model Comparison
            </p>
          </div>
        </div>

        {/* Right status & models */}
        <div className="flex items-center gap-2.5 flex-wrap no-print">
          {/* Model A Tag */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">Model A:</span> gemini-3.7-flash
          </div>

          {/* Model B Tag */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold">Model B:</span> gemini-3.5-flash
          </div>

          {/* Backend Health Dot */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            {backendOnline === true ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-medium">API Online</span>
              </>
            ) : backendOnline === false ? (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="text-rose-400 font-medium">API Offline</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-slate-400">Connecting...</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
