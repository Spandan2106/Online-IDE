import React, { useState } from 'react';
import { FileInput, Trash2, HelpCircle, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { ThemeMode, SupportedLanguage } from '../types';

interface InputPaneProps {
  stdin: string;
  onChangeStdin: (val: string) => void;
  themeMode: ThemeMode;
  language: SupportedLanguage;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const InputPane: React.FC<InputPaneProps> = ({
  stdin,
  onChangeStdin,
  themeMode,
  language,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const isDark = themeMode === 'dark';
  const [copiedPreset, setCopiedPreset] = useState<string | null>(null);

  const samplePresets = [
    { label: 'Numbers Array', val: '5\n10 20 30 40 50' },
    { label: 'String & Age', val: 'Alex\n24' },
    { label: 'Matrix 3x3', val: '3 3\n1 2 3\n4 5 6\n7 8 9' },
    { label: 'Words List', val: 'apple orange banana grape strawberry' },
  ];

  const handleApplyPreset = (val: string, label: string) => {
    onChangeStdin(val);
    setCopiedPreset(label);
    setTimeout(() => setCopiedPreset(null), 1500);
  };

  return (
    <div
      id="stdin-pane-container"
      className={`rounded-lg border transition-all duration-200 overflow-hidden shadow-xs ${
        isDark ? 'bg-[#0F172A] border-[#334155]' : 'bg-white border-slate-200'
      }`}
    >
      {/* Header Bar */}
      <div
        className={`flex items-center justify-between px-3 py-2 border-b select-none text-xs ${
          isDark ? 'bg-[#1E293B] border-[#334155] text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}
      >
        <div className="flex items-center gap-2">
          <FileInput className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold tracking-tight text-slate-200">Standard Input (stdin)</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              isDark ? 'bg-[#0F172A] border border-[#334155] text-slate-400' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {stdin.trim() ? `${stdin.split('\n').length} lines` : 'Empty'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Presets */}
          <div className="hidden sm:flex items-center gap-1">
            {samplePresets.map((p) => (
              <button
                key={p.label}
                onClick={() => handleApplyPreset(p.val, p.label)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                  copiedPreset === p.label
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : isDark
                    ? 'bg-[#0F172A] border-[#334155] hover:bg-[#1E293B] text-slate-300'
                    : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
                title={`Insert test preset: ${p.label}`}
              >
                {copiedPreset === p.label ? <Check className="w-2.5 h-2.5 inline mr-1" /> : null}
                {p.label}
              </button>
            ))}
          </div>

          {/* Clear Stdin */}
          {stdin && (
            <button
              id="clear-stdin-btn"
              onClick={() => onChangeStdin('')}
              className={`p-1 rounded text-slate-400 hover:text-red-400 hover:bg-[#1E293B] transition-colors`}
              title="Clear input"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Collapse Toggle */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]"
              title={isCollapsed ? 'Expand input pane' : 'Collapse input pane'}
            >
              {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Input Area */}
      {!isCollapsed && (
        <div className="p-2.5 bg-[#0F172A]">
          <textarea
            id="stdin-textarea"
            value={stdin}
            onChange={(e) => onChangeStdin(e.target.value)}
            rows={3}
            spellCheck={false}
            className={`w-full p-2.5 rounded-md border text-xs font-mono resize-y outline-none transition-colors leading-relaxed ${
              isDark
                ? 'bg-[#0F172A] border-[#334155] text-[#F8FAFC] placeholder-slate-600 focus:border-sky-500/60'
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500/60'
            }`}
            placeholder={`Enter input for your program (passed to ${
              language === 'c'
                ? 'scanf()'
                : language === 'cpp'
                ? 'std::cin'
                : language === 'java'
                ? 'Scanner'
                : 'sys.stdin / input()'
            }). Each line is sent as standard input.`}
          />
        </div>
      )}
    </div>
  );
};
