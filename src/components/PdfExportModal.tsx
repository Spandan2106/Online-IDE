import React, { useState } from 'react';
import {
  X,
  FileDown,
  CheckCircle2,
  Code,
  Terminal,
  Clock,
  Sparkles,
} from 'lucide-react';
import { SupportedLanguage, ExecutionResult, ThemeMode, TerminalLogEntry } from '../types';
import { generateAndDownloadPdf } from '../utils/pdfGenerator';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: SupportedLanguage;
  code: string;
  logs: TerminalLogEntry[];
  result: ExecutionResult;
  themeMode: ThemeMode;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  language,
  code,
  logs,
  result,
  themeMode,
}) => {
  const isDark = themeMode === 'dark';
  const defaultReportTitle = `${language.toUpperCase()} Code & Terminal Report`;
  const defaultFilename = `${language}_terminal_report_${new Date().toISOString().slice(0, 10)}`;

  const [title, setTitle] = useState(defaultReportTitle);
  const [filename, setFilename] = useState(defaultFilename);
  const [customNotes, setCustomNotes] = useState('');
  const [pdfTheme, setPdfTheme] = useState<'light' | 'dark' | 'monochrome'>('light');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [includeCode, setIncludeCode] = useState(true);
  const [includeTerminal, setIncludeTerminal] = useState(true);

  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    setIsExporting(true);
    setDownloadSuccess(null);

    try {
      const fullResult: ExecutionResult = {
        ...result,
        history: logs,
      };

      const savedName = generateAndDownloadPdf({
        title,
        filename: filename.trim() || defaultFilename,
        language,
        code,
        result: fullResult,
        theme: pdfTheme,
        orientation,
        includeCode,
        includeTerminal,
        customNotes,
      });

      setDownloadSuccess(savedName);
      setTimeout(() => {
        setIsExporting(false);
      }, 400);
    } catch (err: any) {
      console.error('PDF export error:', err);
      setIsExporting(false);
    }
  };

  const lineCount = code.split('\n').length;
  const statusLabel =
    result.status === 'success'
      ? 'Success'
      : result.status === 'compile_error'
      ? 'Compiler Error'
      : result.status === 'runtime_error'
      ? 'Runtime Error'
      : 'Ready';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        id="pdf-export-modal"
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all animate-in fade-in zoom-in-95 duration-150 ${
          isDark ? 'bg-[#10172A] border-[#2A3447] text-slate-200' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark ? 'bg-[#131E36] border-[#2A3447]' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Export Code & Terminal as PDF</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate high-resolution formatted PDF document
              </p>
            </div>
          </div>
          <button
            id="close-pdf-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Quick Summary Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
              isDark ? 'bg-[#162038] border-[#2A3447]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-medium">
                <Code className="w-3.5 h-3.5 text-sky-500" />
                <span>{language.toUpperCase()}</span>
                <span className="text-slate-500">({lineCount} lines)</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                <span>{logs.length} Terminal Events</span>
              </div>
            </div>
            <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
              <Clock className="w-3 h-3" />
              <span>{result.executionTimeMs ?? 0}ms</span>
            </div>
          </div>

          {/* Title & Filename Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Document Title
              </label>
              <input
                id="pdf-title-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-xs outline-none transition-all ${
                  isDark
                    ? 'bg-[#0B0F19] border-[#2A3447] focus:border-sky-500 text-slate-200'
                    : 'bg-white border-slate-300 focus:border-sky-500 text-slate-800'
                }`}
                placeholder="e.g. Solution for Problem A"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Filename (.pdf)
              </label>
              <input
                id="pdf-filename-input"
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-xs outline-none transition-all ${
                  isDark
                    ? 'bg-[#0B0F19] border-[#2A3447] focus:border-sky-500 text-slate-200'
                    : 'bg-white border-slate-300 focus:border-sky-500 text-slate-800'
                }`}
                placeholder="e.g. program_output"
              />
            </div>
          </div>

          {/* Document Sections Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
              Include Sections
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer select-none transition-colors ${
                  includeCode
                    ? isDark
                      ? 'bg-sky-950/40 border-sky-600/60 text-sky-200'
                      : 'bg-sky-50 border-sky-300 text-sky-800'
                    : isDark
                    ? 'bg-[#0B0F19] border-[#2A3447] text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={includeCode}
                  onChange={(e) => setIncludeCode(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-0"
                />
                <span className="font-medium">Source Code & Line Numbers</span>
              </label>

              <label
                className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer select-none transition-colors ${
                  includeTerminal
                    ? isDark
                      ? 'bg-sky-950/40 border-sky-600/60 text-sky-200'
                      : 'bg-sky-50 border-sky-300 text-sky-800'
                    : isDark
                    ? 'bg-[#0B0F19] border-[#2A3447] text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={includeTerminal}
                  onChange={(e) => setIncludeTerminal(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-0"
                />
                <span className="font-medium">Interactive Terminal Session</span>
              </label>
            </div>
          </div>

          {/* Theme & Orientation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Color Style
              </label>
              <div className="flex rounded-lg border p-1 gap-1 border-slate-200 dark:border-[#2A3447] bg-slate-50 dark:bg-[#0B0F19]">
                {(['light', 'dark', 'monochrome'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPdfTheme(t)}
                    className={`flex-1 py-1 text-xs font-medium rounded-md capitalize transition-all ${
                      pdfTheme === t
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                Page Orientation
              </label>
              <div className="flex rounded-lg border p-1 gap-1 border-slate-200 dark:border-[#2A3447] bg-slate-50 dark:bg-[#0B0F19]">
                {(['portrait', 'landscape'] as const).map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setOrientation(o)}
                    className={`flex-1 py-1 text-xs font-medium rounded-md capitalize transition-all ${
                      orientation === o
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Custom Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Custom Notes / Assignment Details (Optional)
            </label>
            <textarea
              id="pdf-custom-notes-input"
              rows={2}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Lab Exercise 3 - Submitted by Alex, Roll: 1042"
              className={`w-full px-3 py-2 rounded-lg border text-xs outline-none resize-none transition-all ${
                isDark
                  ? 'bg-[#0B0F19] border-[#2A3447] focus:border-sky-500 text-slate-200'
                  : 'bg-white border-slate-300 focus:border-sky-500 text-slate-800'
              }`}
            />
          </div>

          {/* Success Download Notice */}
          {downloadSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                Downloaded <strong>{downloadSuccess}</strong> successfully!
              </span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div
          className={`flex items-center justify-end gap-2.5 px-6 py-4 border-t ${
            isDark ? 'bg-[#131E36] border-[#2A3447]' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            Cancel
          </button>

          <button
            id="generate-pdf-submit-btn"
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all active:scale-95"
          >
            <FileDown className="w-4 h-4" />
            <span>{isExporting ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
