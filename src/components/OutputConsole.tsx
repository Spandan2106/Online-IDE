import React, { useState } from 'react';
import {
  Terminal,
  AlertTriangle,
  CheckCircle,
  Clock,
  Copy,
  Check,
  Trash2,
  Maximize2,
  Minimize2,
  FileText,
  AlertCircle,
  HelpCircle,
  CornerDownRight,
  Code2,
} from 'lucide-react';
import { ExecutionResult, ThemeMode, SupportedLanguage } from '../types';

interface OutputConsoleProps {
  result: ExecutionResult;
  themeMode: ThemeMode;
  language: SupportedLanguage;
  isRunning: boolean;
  onClearOutput: () => void;
  onExportToDocs: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const OutputConsole: React.FC<OutputConsoleProps> = ({
  result,
  themeMode,
  language,
  isRunning,
  onClearOutput,
  onExportToDocs,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const isDark = themeMode === 'dark';
  const [activeTab, setActiveTab] = useState<'all' | 'stdout' | 'stderr'>('all');
  const [copied, setCopied] = useState(false);

  const hasOutput = Boolean(result.stdout || result.stderr);
  const isError = result.status === 'compile_error' || result.status === 'runtime_error' || result.status === 'system_error';
  const isSuccess = result.status === 'success';

  const handleCopyOutput = async () => {
    const textToCopy = `${result.stdout ? `=== STDOUT ===\n${result.stdout}\n` : ''}${
      result.stderr ? `=== STDERR / DIAGNOSTICS ===\n${result.stderr}\n` : ''
    }`;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      id="output-console-container"
      className={`flex flex-col h-full rounded-lg border overflow-hidden shadow-xs transition-all duration-200 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''
      } ${isDark ? 'bg-[#0F172A] border-[#334155]' : 'bg-white border-slate-200'}`}
    >
      {/* Console Top Toolbar */}
      <div
        id="console-toolbar"
        className={`flex flex-wrap items-center justify-between px-3 py-2 border-b select-none text-xs gap-2 ${
          isDark ? 'bg-[#1E293B] border-[#334155] text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}
      >
        {/* Left: Status Badge & Execution Metrics */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span>Output Console</span>
          </div>

          {/* Status Indicator */}
          {isRunning ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[11px] font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span>Compiling & Running...</span>
            </div>
          ) : isSuccess ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>Executed (Exit code 0)</span>
            </div>
          ) : isError ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-[11px] font-semibold">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span>
                {result.status === 'compile_error'
                  ? 'Compilation Failed'
                  : result.status === 'runtime_error'
                  ? `Runtime Error (code ${result.exitCode})`
                  : 'System Error'}
              </span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500 italic">Ready to run</div>
          )}

          {/* Execution Time Badge */}
          {result.executionTimeMs !== undefined && result.status !== 'idle' && (
            <div
              className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-mono ${
                isDark ? 'bg-[#0F172A] border-[#334155] text-slate-300' : 'bg-white border-slate-200 text-slate-600'
              }`}
              title="Execution runtime"
            >
              <Clock className="w-3 h-3 text-sky-400" />
              <span>{result.executionTimeMs}ms</span>
            </div>
          )}
        </div>

        {/* Right: Actions (Export Docs, Copy, Clear, Fullscreen) */}
        <div className="flex items-center gap-1.5">
          {/* Export to Google Docs */}
          {hasOutput && (
            <button
              id="export-docs-quick-btn"
              onClick={onExportToDocs}
              className={`flex items-center gap-1 px-2 py-1 rounded-md border transition-colors ${
                isDark
                  ? 'bg-[#0F172A] border-[#334155] hover:bg-[#1E293B] text-sky-400'
                  : 'bg-white border-slate-200 hover:bg-slate-100 text-sky-600'
              }`}
              title="Export code & output to Google Docs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Docs</span>
            </button>
          )}

          {/* Copy Output */}
          {hasOutput && (
            <button
              id="copy-output-btn"
              onClick={handleCopyOutput}
              className={`flex items-center gap-1 px-2 py-1 rounded-md border transition-colors ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : isDark
                  ? 'bg-[#0F172A] border-[#334155] hover:bg-[#1E293B] text-slate-300'
                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
              title="Copy output text"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}

          {/* Clear Console */}
          {hasOutput && (
            <button
              id="clear-console-btn"
              onClick={onClearOutput}
              className={`p-1.5 rounded-md border transition-colors ${
                isDark
                  ? 'bg-[#0F172A] border-[#334155] hover:bg-[#1E293B] text-slate-400 hover:text-red-400'
                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-red-600'
              }`}
              title="Clear console output"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            id="fullscreen-output-btn"
            onClick={onToggleFullscreen}
            className={`p-1.5 rounded-md border transition-colors ${
              isDark
                ? 'bg-[#0F172A] border-[#334155] hover:bg-[#1E293B] text-slate-300'
                : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Terminal'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Filter Tabs if both stdout and stderr exist */}
      {result.stdout && result.stderr && (
        <div
          className={`flex items-center gap-2 px-3 py-1.5 border-b text-[11px] font-mono ${
            isDark ? 'bg-[#0F172A]/70 border-[#334155]' : 'bg-slate-100/60 border-slate-200'
          }`}
        >
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeTab === 'all'
                ? 'bg-sky-600 text-white font-bold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Stream
          </button>
          <button
            onClick={() => setActiveTab('stdout')}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeTab === 'stdout'
                ? 'bg-sky-600 text-white font-bold'
                : isDark
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stdout only
          </button>
          <button
            onClick={() => setActiveTab('stderr')}
            className={`px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${
              activeTab === 'stderr'
                ? 'bg-red-600 text-white font-bold'
                : isDark
                ? 'text-red-400 hover:text-red-300'
                : 'text-red-600 hover:text-red-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Diagnostics (Stderr)
          </button>
        </div>
      )}

      {/* Terminal View Content Area */}
      <div
        id="terminal-output-body"
        className={`flex-1 p-3.5 overflow-auto font-mono text-xs leading-relaxed select-text transition-colors ${
          isDark
            ? 'bg-[#0F172A] text-[#F8FAFC] selection:bg-sky-700/40'
            : 'bg-slate-950 text-emerald-400 selection:bg-emerald-900'
        }`}
      >
        {isRunning ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400 py-12">
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <p className="font-semibold text-slate-200">Executing {language.toUpperCase()} Program...</p>
              <p className="text-[11px] text-slate-500">Compiling with optimizations and capturing stream</p>
            </div>
          </div>
        ) : !hasOutput ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 select-none py-12">
            <Terminal className="w-10 h-10 mb-2 opacity-40 text-sky-400" />
            <p className="text-sm font-semibold text-slate-300">Terminal is Idle</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
              Write your code on the left, add custom input if required, and click{' '}
              <span className="text-sky-400 font-bold">RUN</span> (Ctrl + Enter) to see the output here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Standard Output Section */}
            {(activeTab === 'all' || activeTab === 'stdout') && result.stdout && (
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5 select-none">
                  <CornerDownRight className="w-3 h-3 text-emerald-400" />
                  <span>Program Standard Output (stdout):</span>
                </div>
                <pre className="whitespace-pre-wrap font-mono text-[#F8FAFC] bg-[#1E293B]/60 p-3 rounded-lg border border-[#334155] overflow-x-auto shadow-inner">
                  {result.stdout}
                </pre>
              </div>
            )}

            {/* Diagnostics / Stderr Section */}
            {(activeTab === 'all' || activeTab === 'stderr') && result.stderr && (
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-red-400 flex items-center gap-1.5 select-none">
                  <AlertCircle className="w-3 h-3 text-red-400" />
                  <span>Compiler Warnings & Error Diagnostics:</span>
                </div>
                <pre className="whitespace-pre-wrap font-mono text-red-300 bg-red-950/40 p-3 rounded-lg border border-red-900/60 overflow-x-auto shadow-inner">
                  {result.stderr}
                </pre>
              </div>
            )}

            {/* Execution Footer Summary */}
            <div className="pt-2 border-t border-[#334155] text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2 select-none">
              <div className="flex items-center gap-2">
                <span>Process exited with code {result.exitCode ?? 0}</span>
                <span>•</span>
                <span>Runtime: {result.executionTimeMs ?? 0}ms</span>
                {result.compilationTimeMs ? (
                  <>
                    <span>•</span>
                    <span>Compile: {result.compilationTimeMs}ms</span>
                  </>
                ) : null}
              </div>
              <div>{result.timestamp}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
