import React, { useState } from 'react';
import { Printer, Copy, Check, RotateCcw, Download, Sparkles, FileCode } from 'lucide-react';

export default function ExportBar({
  resultsData,
  onReset = () => {}
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(resultsData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy JSON: ', err);
    }
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resultsData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dpdp_audit_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 no-print shadow-xl">
      {/* Left info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white tracking-tight">
            Audit Complete · Export & Report Options
          </h4>
          <p className="text-xs text-slate-400">
            Export full UI as high-fidelity PDF, copy structured JSON, or analyze another document.
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto justify-end">
        {/* Reset / New Check */}
        <button
          onClick={onReset}
          className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-all flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          Audit Another Policy
        </button>

        {/* Copy JSON */}
        <button
          onClick={handleCopyJson}
          className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-all flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">JSON Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy Full JSON</span>
            </>
          )}
        </button>

        {/* Download JSON */}
        <button
          onClick={handleDownloadJson}
          className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-all flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Save JSON</span>
        </button>

        {/* Print / Save as PDF */}
        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
        >
          <Printer className="w-4 h-4 text-white" />
          <span>Print / Export PDF</span>
        </button>
      </div>
    </div>
  );
}
