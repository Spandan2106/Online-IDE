import React, { useState } from 'react';
import {
  X,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Code,
  Terminal,
  Layers,
  History,
  Sparkles,
} from 'lucide-react';
import { SupportedLanguage, ExecutionResult, ThemeMode, ExportedDocRecord } from '../types';
import { User } from 'firebase/auth';

interface GoogleDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: SupportedLanguage;
  code: string;
  stdin: string;
  result: ExecutionResult;
  themeMode: ThemeMode;
  user: User | null;
  onSignIn: () => void;
  onExportDoc: (title: string) => Promise<{ documentId: string; documentUrl: string }>;
  exportHistory: ExportedDocRecord[];
}

export const GoogleDocsModal: React.FC<GoogleDocsModalProps> = ({
  isOpen,
  onClose,
  language,
  code,
  stdin,
  result,
  themeMode,
  user,
  onSignIn,
  onExportDoc,
  exportHistory,
}) => {
  const isDark = themeMode === 'dark';
  const defaultTitle = `[Online IDE] ${language.toUpperCase()} - Code & Execution Report (${new Date().toLocaleDateString()})`;

  const [docTitle, setDocTitle] = useState(defaultTitle);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [createdDoc, setCreatedDoc] = useState<{ documentId: string; documentUrl: string; title: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'export' | 'history'>('export');

  if (!isOpen) return null;

  const handleExport = async () => {
    if (!user) {
      onSignIn();
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      const res = await onExportDoc(docTitle);
      setCreatedDoc({
        documentId: res.documentId,
        documentUrl: res.documentUrl,
        title: docTitle,
      });
    } catch (err: any) {
      setExportError(err.message || 'Failed to export to Google Docs. Please ensure permissions are granted.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        id="google-docs-modal"
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all animate-in fade-in zoom-in-95 duration-150 ${
          isDark ? 'bg-[#0F172A] border-[#334155] text-[#F8FAFC]' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isDark ? 'bg-[#1E293B] border-[#334155]' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-200">Google Docs Converter & Exporter</h2>
              <p className="text-[11px] text-slate-400">Convert code, stdin, and compiler output into a Google Doc</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border p-0.5 text-xs bg-[#0F172A] border-[#334155]">
              <button
                onClick={() => setActiveTab('export')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  activeTab === 'export'
                    ? 'bg-sky-600 text-white font-bold'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Export
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                  activeTab === 'history'
                    ? 'bg-sky-600 text-white font-bold'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-3 h-3" />
                <span>History ({exportHistory.length})</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg border transition-colors ${
                isDark
                  ? 'bg-[#0F172A] border-[#334155] text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === 'history' ? (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-300">Recently Exported Google Docs</h3>
              {exportHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>No Google Docs exported yet in this session.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {exportHistory.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                        isDark ? 'bg-[#1E293B] border-[#334155] hover:border-slate-500' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="space-y-0.5 max-w-[340px]">
                        <p className="font-semibold truncate text-slate-200">{item.title}</p>
                        <p className="text-[11px] text-slate-400">
                          {item.language.toUpperCase()} • Exported on {item.timestamp}
                        </p>
                      </div>
                      <a
                        href={item.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-xs transition-all"
                      >
                        <span>Open Doc</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* If not logged in, show Google Sign In prompt */}
              {!user ? (
                <div
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-3 ${
                    isDark ? 'bg-[#1E293B] border-[#334155]' : 'bg-sky-50/50 border-sky-200'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-200">Google Account Required</h3>
                    <p className="text-slate-400 text-xs mt-1 max-w-sm">
                      To create and export documents directly to your Google Docs & Drive, please sign in with your Google account.
                    </p>
                  </div>

                  {/* Standard Sign in with Google Button */}
                  <button
                    onClick={onSignIn}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs border border-slate-300 shadow-xs transition-all active:scale-95"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    <span>Sign in with Google</span>
                  </button>
                </div>
              ) : null}

              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Document Title</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. My Algorithm Report"
                  className={`w-full px-3 py-2 rounded-lg border text-xs font-mono outline-none focus:ring-1 focus:ring-sky-500 ${
                    isDark ? 'bg-[#1E293B] border-[#334155] text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Summary of What Will Be Converted */}
              <div
                className={`p-3.5 rounded-xl border space-y-2.5 ${
                  isDark ? 'bg-[#1E293B] border-[#334155]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <h4 className="font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                  Conversion & Document Preview:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Code className="w-3.5 h-3.5 text-sky-400" />
                    <span>Language:</span>
                    <strong className="text-slate-200 font-mono uppercase">{language}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    <span>Code Lines:</span>
                    <strong className="text-slate-200 font-mono">{code.split('\n').length} lines</strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Status:</span>
                    <strong
                      className={`font-mono ${
                        result.status === 'success'
                          ? 'text-emerald-400'
                          : result.status === 'compile_error' || result.status === 'runtime_error'
                          ? 'text-red-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {result.status.toUpperCase()}
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>Runtime:</span>
                    <strong className="text-slate-200 font-mono">{result.executionTimeMs ?? 0}ms</strong>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {exportError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <div className="space-y-1">
                    <p className="font-bold">Export Error</p>
                    <p className="text-[11px] opacity-90">{exportError}</p>
                  </div>
                </div>
              )}

              {/* Success Result */}
              {createdDoc && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="font-bold text-sm">Successfully Exported to Google Docs!</p>
                      <p className="text-[11px] text-emerald-300 opacity-90">{createdDoc.title}</p>
                    </div>
                  </div>

                  <a
                    href={createdDoc.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition-all active:scale-95"
                  >
                    <span>Open in Google Docs</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'export' && (
          <div
            className={`px-5 py-3 border-t flex items-center justify-between ${
              isDark ? 'bg-[#1E293B] border-[#334155]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="text-[11px] text-slate-400">Google Workspace API Integration</div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                  isDark
                    ? 'bg-[#0F172A] border-[#334155] text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                id="export-to-google-docs-submit-btn"
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-all active:scale-95"
              >
                {isExporting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Converting & Exporting...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    <span>Export to Google Docs</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
