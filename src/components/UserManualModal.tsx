import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Search,
  Code,
  Terminal,
  FileText,
  Volume2,
  Sparkles,
  Command,
  HelpCircle,
  Cpu,
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
      case 'overview':
        return <BookOpen className="w-4 h-4 text-blue-400" />;
      case 'languages':
        return <Cpu className="w-4 h-4 text-indigo-400" />;
      case 'stdin':
        return <Terminal className="w-4 h-4 text-amber-400" />;
      case 'google-docs':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'tts-speech':
        return <Volume2 className="w-4 h-4 text-purple-400" />;
      case 'ai-assistant':
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case 'shortcuts':
        return <Command className="w-4 h-4 text-rose-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        id="user-manual-modal"
        className={`w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col h-[85vh] max-h-[850px] transition-all animate-in fade-in zoom-in-95 duration-150 ${
          isDark ? 'bg-[#0F172A] border-[#334155] text-[#F8FAFC]' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark ? 'bg-[#1E293B] border-[#334155]' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-200">Online IDE User Manual & Documentation</h2>
              <p className="text-xs text-slate-400">Complete guide for C, C++, Java, Python, Google Docs & Speech</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-lg border transition-colors ${
              isDark
                ? 'bg-[#0F172A] border-[#334155] text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]'
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
              isDark ? 'bg-[#1E293B]/60 border-[#334155]' : 'bg-slate-50/80 border-slate-200'
            }`}
          >
            {/* Search within manual */}
            <div className="p-3 border-b border-[#334155]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search manual..."
                  className={`w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs outline-none focus:ring-1 focus:ring-sky-500 ${
                    isDark ? 'bg-[#0F172A] border-[#334155] text-slate-200' : 'bg-white border-slate-300 text-slate-800'
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
              <div className="flex items-center gap-2 pb-2 border-b border-[#334155]">
                {getSectionIcon(currentSection.id)}
                <h3 className="text-lg font-semibold text-slate-200">{currentSection.title}</h3>
              </div>

              {/* Render Section Text */}
              <div
                className={`prose prose-sm max-w-none text-xs leading-relaxed space-y-3 whitespace-pre-wrap font-sans ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                {currentSection.content}
              </div>

              {/* Tips or Code sample if shortcuts */}
              {currentSection.id === 'shortcuts' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {[
                    { key: 'Ctrl + Enter / ⌘ + Enter', desc: 'Compile & Run code immediately' },
                    { key: 'Ctrl + F / ⌘ + F', desc: 'Open Find & Replace toolbar' },
                    { key: 'Tab / Shift + Tab', desc: 'Indent or outdent 4 spaces' },
                    { key: 'Ctrl + / / ⌘ + /', desc: 'Toggle line comment' },
                    { key: 'Ctrl + S / ⌘ + S', desc: 'Save & Download current source file' },
                    { key: 'Esc', desc: 'Close open dialogs & search bars' },
                  ].map((sc, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                        isDark ? 'bg-[#1E293B] border-[#334155]' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="text-slate-400 text-[11px]">{sc.desc}</span>
                      <kbd className={`px-2 py-1 rounded border text-[10px] font-mono font-bold shadow-xs ${
                        isDark ? 'bg-[#0F172A] border-[#334155] text-slate-200' : 'bg-slate-200 border-slate-300 text-slate-800'
                      }`}>
                        {sc.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3 border-t flex items-center justify-between text-xs ${
            isDark ? 'bg-[#1E293B] border-[#334155] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
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
