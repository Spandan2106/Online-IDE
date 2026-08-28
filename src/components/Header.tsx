import React from 'react';
import {
  Play,
  Square,
  FileText,
  BookOpen,
  Sun,
  Moon,
  RotateCcw,
  CheckCircle2,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { SupportedLanguage, ThemeMode } from '../types';
import { LANGUAGE_CONFIGS } from '../data/templates';
import { User } from 'firebase/auth';

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
  onOpenGoogleDocs: () => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
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
  onOpenGoogleDocs,
  user,
  onSignIn,
  onSignOut,
}) => {
  const isDark = themeMode === 'dark';

  return (
    <header
      id="main-header"
      className={`border-b px-4 lg:px-6 py-2.5 transition-colors duration-200 select-none ${
        isDark
          ? 'bg-[#1E293B] border-[#334155] text-[#F8FAFC]'
          : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand & Nav Links */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center font-bold text-white shadow-sm text-sm font-mono">
              {'{ }'}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg lg:text-xl font-semibold tracking-tight">SyntaxHub</span>
              <span
                className={`text-[10px] uppercase font-mono font-semibold px-1.5 py-0.5 rounded ${
                  isDark ? 'bg-[#0F172A] border border-[#334155] text-sky-400' : 'bg-slate-100 text-slate-600'
                }`}
              >
                IDE
              </span>
            </div>
          </div>

          <div className={`h-6 w-[1px] ${isDark ? 'bg-[#334155]' : 'bg-slate-200'} mx-1 hidden sm:block`} />

          {/* Quick Nav / Manual links */}
          <nav className="hidden md:flex items-center gap-3 text-sm font-medium">
            <button
              onClick={onOpenUserManual}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                isDark ? 'text-slate-300 hover:text-white hover:bg-[#0F172A]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span>User Manual</span>
            </button>
          </nav>
        </div>

        {/* Center: Language Switcher Dropdown/Pills */}
        <div className="flex items-center gap-2">
          {/* Language Selector Dropdown & Pills */}
          <div
            id="language-selector"
            className={`flex items-center p-1 rounded-lg border ${
              isDark ? 'bg-[#0F172A] border-[#334155]' : 'bg-slate-100 border-slate-200'
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
                  className={`relative px-2.5 lg:px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-all duration-150 ${
                    isSelected
                      ? isDark
                        ? 'bg-[#1E293B] text-sky-400 border border-[#334155] shadow-xs'
                        : 'bg-white text-sky-600 shadow-xs font-bold'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                  title={`Switch to ${config.name} (${config.compiler})`}
                >
                  <span>{config.name}</span>
                  <span
                    className={`text-[10px] font-mono ${
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
                ? 'bg-[#0F172A] border-[#334155] text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Reset code to template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Run Button, Export to Docs, Theme Switcher, Google Auth */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Run Code Button */}
          {isRunning ? (
            <button
              id="stop-code-btn"
              onClick={onStopCode}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Square className="w-3.5 h-3.5 fill-white animate-pulse" />
              <span>RUNNING</span>
            </button>
          ) : (
            <button
              id="run-code-btn"
              onClick={onRunCode}
              className="flex items-center gap-2 px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm active:scale-95 group tracking-wide"
              title="Run code (Ctrl + Enter)"
            >
              <span>▶</span>
              <span>RUN</span>
              <kbd className="hidden sm:inline-block text-[10px] font-mono bg-emerald-700/60 px-1 py-0.2 rounded text-emerald-100 font-normal">
                Ctrl+↵
              </kbd>
            </button>
          )}

          {/* Export to Docs Button */}
          <button
            id="google-docs-btn"
            onClick={onOpenGoogleDocs}
            className="flex items-center gap-1.5 bg-[#4285F4] hover:bg-[#357AE8] text-white px-3 py-1.5 rounded text-xs font-medium transition-colors shadow-xs"
            title="Export code and output to Google Docs"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            </svg>
            <span className="hidden sm:inline">Export to Docs</span>
          </button>

          {/* Theme Mode Toggle Container */}
          <div
            className={`flex items-center rounded p-0.5 border ${
              isDark ? 'bg-[#0F172A] border-[#334155]' : 'bg-slate-100 border-slate-300'
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

          {/* Google Sign In / User Status */}
          {user ? (
            <div className="flex items-center gap-1.5">
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded border text-xs ${
                  isDark ? 'bg-[#0F172A] border-[#334155] text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
                title={`Signed in as ${user.email}`}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-4 h-4 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className="max-w-[70px] truncate text-[11px] font-medium hidden md:inline">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              </div>
              <button
                id="sign-out-btn"
                onClick={onSignOut}
                className={`p-1.5 rounded border text-xs transition-colors ${
                  isDark
                    ? 'bg-[#0F172A] border-[#334155] text-slate-400 hover:text-red-400 hover:bg-[#1E293B]'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-red-600'
                }`}
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id="sign-in-btn"
              onClick={onSignIn}
              className={`flex items-center gap-1 px-2.5 py-1 rounded border text-xs font-medium transition-all ${
                isDark
                  ? 'bg-[#0F172A] border-[#334155] text-slate-300 hover:bg-[#1E293B] hover:text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title="Sign in with Google"
            >
              <LogIn className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
