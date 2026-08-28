import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Search,
  Terminal,
  Cpu,
  Smartphone,
  Layout,
  FileDown,
  Keyboard,
  HelpCircle,
  Check,
  Copy,
} from 'lucide-react';
import { USER_MANUAL_TOPICS } from '../data/userManual';
import { ThemeMode } from '../types';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode: ThemeMode;
}

export const UserManualModal: React.FC<UserManualModalProps> = ({
  isOpen,
  onClose,
  themeMode,
}) => {
  const isDark = themeMode === 'dark';
  const [activeSectionId, setActiveSectionId] = useState<string>(USER_MANUAL_TOPICS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentSection = USER_MANUAL_TOPICS.find((s) => s.id === activeSectionId) || USER_MANUAL_TOPICS[0];

  const filteredSections = searchQuery.trim()
    ? USER_MANUAL_TOPICS.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : USER_MANUAL_TOPICS;

  const getSectionIcon = (id: string) => {
    switch (id) {
      case 'interactive-terminal':
        return <Terminal className="w-4 h-4 text-sky-400" />;
      case 'customizable-layout':
        return <Layout className="w-4 h-4 text-emerald-400" />;
      case 'mobile-compatibility':
        return <Smartphone className="w-4 h-4 text-purple-400" />;
      case 'runtimes-compilers':
        return <Cpu className="w-4 h-4 text-amber-400" />;
      case 'pdf-export':
        return <FileDown className="w-4 h-4 text-blue-400" />;
      case 'keyboard-shortcuts':
        return <Keyboard className="w-4 h-4 text-rose-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        id="user-manual-modal"
        className={`w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col h-[85vh] max-h-[850px] transition-all animate-in fade-in zoom-in-95 duration-150 ${
          isDark ? 'bg-[#0B0F19] border-[#2A3447] text-[#F8FAFC]' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark ? 'bg-[#131B2E] border-[#2A3447]' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">SyntaxHub IDE Manual & Guide</h2>
              <p className="text-xs text-slate-400">Interactive Terminal, Layout Customization & Compilers</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-lg border transition-colors ${
              isDark
                ? 'bg-[#0B0F19] border-[#2A3447] text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Manual Layout: Sidebar Navigation + Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar */}
          <div
            className={`w-full md:w-64 border-b md:border-b-0 md:border-r flex flex-col select-none ${
              isDark ? 'bg-[#10172A] border-[#2A3447]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            {/* Search within manual */}
            <div className={`p-3 border-b ${isDark ? 'border-[#2A3447]' : 'border-slate-200'}`}>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search guide..."
                  className={`w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs outline-none focus:ring-1 focus:ring-sky-500 ${
                    isDark ? 'bg-[#0B0F19] border-[#2A3447] text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                />
              </div>
            </div>

            {/* Section Links */}
            <div className="p-2 overflow-y-auto space-y-1 flex-1">
              {filteredSections.map((section) => {
                const isActive = activeSectionId === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSectionId(section.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                      isActive
                        ? isDark
                          ? 'bg-sky-600/20 text-sky-300 border border-sky-500/40 shadow-xs'
                          : 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                        : isDark
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {getSectionIcon(section.id)}
                    <span className="truncate">{section.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Manual Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-2xl space-y-4">
              <div className={`flex items-center gap-2 pb-2 border-b ${isDark ? 'border-[#2A3447]' : 'border-slate-200'}`}>
                {getSectionIcon(currentSection.id)}
                <h3 className="text-lg font-bold text-slate-100">{currentSection.title}</h3>
              </div>

              {/* Render Section Text */}
              <div
                className={`prose prose-sm max-w-none text-xs leading-relaxed space-y-3 whitespace-pre-wrap font-sans ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                {currentSection.content}
              </div>

              {/* Bullet points */}
              {currentSection.bulletPoints && currentSection.bulletPoints.length > 0 && (
                <div className={`p-4 rounded-xl border space-y-2 text-xs ${isDark ? 'bg-[#10172A] border-[#2A3447]' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="font-semibold text-sky-400">Key Takeaways & Instructions:</h4>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-300">
                    {currentSection.bulletPoints.map((bp, idx) => (
                      <li key={idx} className="leading-relaxed">{bp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Code sample if available */}
              {currentSection.codeSample && (
                <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-[#0B0F19] border-[#2A3447]' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 text-slate-400 text-[11px] font-mono border-b border-slate-800">
                    <span>{currentSection.codeSample.language.toUpperCase()} Example</span>
                    <button
                      onClick={() => handleCopyCode(currentSection.codeSample!.code, currentSection.id)}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      {copiedCodeId === currentSection.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCodeId === currentSection.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-3 text-xs font-mono text-slate-200 overflow-x-auto">
                    <code>{currentSection.codeSample.code}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3 border-t flex items-center justify-between text-xs ${
            isDark ? 'bg-[#131B2E] border-[#2A3447] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
        >
          <span>Online IDE Manual • Built with GCC 12, OpenJDK 17 & Python 3.10</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
