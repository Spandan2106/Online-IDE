import React, { useState } from 'react';
import {
  Square,
  FileDown,
  BookOpen,
  RotateCcw,
  Columns,
  Rows,
  SlidersHorizontal,
} from 'lucide-react';
import { SupportedLanguage, ThemeMode, LayoutOrientation } from '../types';
import { LANGUAGE_CONFIGS } from '../data/templates';

interface HeaderProps {
  currentLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  isRunning: boolean;
  onRunCode: () => void;
  onStopCode: () => void;
  onResetCode: () => void;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  onOpenUserManual: () => void;
  onOpenPdfExport: () => void;
  layoutOrientation: LayoutOrientation;
  onToggleOrientation: () => void;
  splitRatio: number;
  onSetSplitRatio: (ratio: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onSelectLanguage,
  isRunning,
  onRunCode,
  onStopCode,
  onResetCode,
  themeMode,
  onToggleTheme,
  onOpenUserManual,
  onOpenPdfExport,
  layoutOrientation,
  onToggleOrientation,
  splitRatio,
  onSetSplitRatio,
}) => {
  const isDark = themeMode === 'dark';
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);

  return (
    <header
      id="main-header"
      className={`border-b px-3 sm:px-4 lg:px-6 py-2.5 transition-colors duration-200 select-none shrink-0 ${
        isDark
          ? 'bg-[#131B2E] border-[#2A3447] text-[#F8FAFC]'
          : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        {/* Left: Brand & Nav Links */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center font-bold text-white shadow-sm text-sm font-mono">
              {'{ }'}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-bold tracking-tight">SyntaxHub</span>
              <span
                className={`text-[10px] uppercase font-mono font-semibold px-1.5 py-0.5 rounded ${
                  isDark ? 'bg-[#0B0F19] border border-[#2A3447] text-sky-400' : 'bg-slate-100 text-slate-600'
                }`}
              >
                IDE
              </span>
            </div>
          </div>

          <div className={`h-5 w-[1px] ${isDark ? 'bg-[#2A3447]' : 'bg-slate-200'} mx-0.5 hidden md:block`} />

          {/* User Manual link */}
          <nav className="hidden lg:flex items-center gap-2 text-xs font-medium">
            <button
              id="header-user-manual-btn"
              onClick={onOpenUserManual}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors ${
                isDark ? 'text-slate-300 hover:text-white hover:bg-[#1E293B]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span>User Manual</span>
            </button>
          </nav>
        </div>

        {/* Center: Language Selector Pills */}
        <div className="flex items-center gap-1.5 flex-1 max-w-full justify-center sm:justify-start lg:justify-center overflow-hidden">
          <div
            id="language-selector"
            className={`flex items-center p-0.5 sm:p-1 rounded-lg border overflow-x-auto no-scrollbar gap-0.5 sm:gap-1 max-w-full ${
              isDark ? 'bg-[#0B0F19] border-[#2A3447]' : 'bg-slate-100 border-slate-200'
            }`}
          >
            {(Object.keys(LANGUAGE_CONFIGS) as SupportedLanguage[]).map((langKey) => {
              const config = LANGUAGE_CONFIGS[langKey];
              const isSelected = currentLanguage === langKey;

              return (
                <button
                  key={langKey}
                  id={`lang-btn-${langKey}`}
                  onClick={() => onSelectLanguage(langKey)}
                  className={`relative px-2 sm:px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 shrink-0 transition-all duration-150 ${
                    isSelected
                      ? isDark
                        ? 'bg-[#1E293B] text-sky-400 border border-[#334155] shadow-xs'
                        : 'bg-white text-sky-600 shadow-xs font-bold'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                  title={`${config.name} (${config.compiler}) - ${config.isZeroSetup ? '⚡ Zero Setup / Native' : '🛠️ Compiled'}`}
                >
                  {config.isZeroSetup && (
                    <span className="text-[10px] text-amber-400 font-bold" title="Zero setup needed">⚡</span>
                  )}
                  <span>{config.name}</span>
                  <span
                    className={`hidden md:inline text-[10px] font-mono ${
                      isSelected ? (isDark ? 'text-sky-300' : 'text-sky-600') : 'text-slate-500'
                    }`}
                  >
                    {config.extension}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Reset Code button */}
          <button
            id="reset-code-btn"
            onClick={onResetCode}
            className={`p-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isDark
                ? 'bg-[#0B0F19] border-[#2A3447] text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Reset code to starter template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Layout controls, Run Button, PDF, Theme Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Layout Presets dropdown (Desktop & Tablet) */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowLayoutMenu((prev) => !prev)}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                isDark
                  ? 'bg-[#0B0F19] border-[#2A3447] text-slate-300 hover:bg-[#1E293B]'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title="Customize workspace layout & pane size"
            >
              {layoutOrientation === 'horizontal' ? <Columns className="w-3.5 h-3.5 text-sky-400" /> : <Rows className="w-3.5 h-3.5 text-sky-400" />}
              <span className="hidden xl:inline">Layout ({Math.round(splitRatio * 100)}:{Math.round((1 - splitRatio) * 100)})</span>
            </button>

            {showLayoutMenu && (
              <div
                className={`absolute right-0 mt-1.5 w-56 rounded-xl border shadow-xl p-2 z-50 text-xs ${
                  isDark ? 'bg-[#10172A] border-[#2A3447] text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="px-2 py-1 font-bold text-[11px] text-slate-400 uppercase tracking-wider">
                  Pane Orientation
                </div>
                <div className="grid grid-cols-2 gap-1 mb-2">
                  <button
                    onClick={() => {
                      if (layoutOrientation !== 'horizontal') onToggleOrientation();
                      setShowLayoutMenu(false);
                    }}
                    className={`flex items-center gap-1.5 p-1.5 rounded-lg text-xs font-medium transition-all ${
                      layoutOrientation === 'horizontal'
                        ? 'bg-sky-600 text-white font-bold'
                        : isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span>Side-by-Side</span>
                  </button>

                  <button
                    onClick={() => {
                      if (layoutOrientation !== 'vertical') onToggleOrientation();
                      setShowLayoutMenu(false);
                    }}
                    className={`flex items-center gap-1.5 p-1.5 rounded-lg text-xs font-medium transition-all ${
                      layoutOrientation === 'vertical'
                        ? 'bg-sky-600 text-white font-bold'
                        : isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Rows className="w-3.5 h-3.5" />
                    <span>Stacked</span>
                  </button>
                </div>

                <div className="px-2 py-1 font-bold text-[11px] text-slate-400 uppercase tracking-wider">
                  Size Ratio Presets
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => {
                      onSetSplitRatio(0.5);
                      setShowLayoutMenu(false);
                    }}
                    className={`py-1 px-1.5 rounded text-center font-mono text-[11px] border transition-all ${
                      Math.abs(splitRatio - 0.5) < 0.05
                        ? 'border-sky-500 bg-sky-500/10 text-sky-400 font-bold'
                        : isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    50 / 50
                  </button>
                  <button
                    onClick={() => {
                      onSetSplitRatio(0.68);
                      setShowLayoutMenu(false);
                    }}
                    className={`py-1 px-1.5 rounded text-center font-mono text-[11px] border transition-all ${
                      Math.abs(splitRatio - 0.68) < 0.05
                        ? 'border-sky-500 bg-sky-500/10 text-sky-400 font-bold'
                        : isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    70 / 30
                  </button>
                  <button
                    onClick={() => {
                      onSetSplitRatio(0.32);
                      setShowLayoutMenu(false);
                    }}
                    className={`py-1 px-1.5 rounded text-center font-mono text-[11px] border transition-all ${
                      Math.abs(splitRatio - 0.32) < 0.05
                        ? 'border-sky-500 bg-sky-500/10 text-sky-400 font-bold'
                        : isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    30 / 70
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Run / Stop Button */}
          {isRunning ? (
            <button
              id="stop-code-btn"
              onClick={onStopCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Square className="w-3.5 h-3.5 fill-white animate-pulse" />
              <span>STOP</span>
            </button>
          ) : (
            <button
              id="run-code-btn"
              onClick={onRunCode}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95 group tracking-wide"
              title="Run code in interactive terminal (Ctrl + Enter)"
            >
              <span>▶</span>
              <span>RUN</span>
              <kbd className="hidden sm:inline-block text-[10px] font-mono bg-emerald-700/70 px-1 rounded text-emerald-100 font-normal">
                Ctrl+↵
              </kbd>
            </button>
          )}

          {/* Export PDF Button */}
          <button
            id="export-pdf-header-btn"
            onClick={onOpenPdfExport}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs active:scale-95"
            title="Export code and terminal session as PDF"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          {/* Theme Toggle */}
          <div
            className={`flex items-center rounded-lg p-0.5 border ${
              isDark ? 'bg-[#0B0F19] border-[#2A3447]' : 'bg-slate-100 border-slate-300'
            }`}
          >
            <button
              onClick={() => {
                if (!isDark) onToggleTheme();
              }}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                isDark
                  ? 'bg-[#1E293B] text-slate-100 shadow-xs border border-[#334155]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => {
                if (isDark) onToggleTheme();
              }}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                !isDark
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Light
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
