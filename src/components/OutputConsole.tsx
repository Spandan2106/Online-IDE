import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal,
  Play,
  Square,
  Trash2,
  Maximize2,
  Minimize2,
  FileDown,
  CornerDownLeft,
  Clock,
  Sparkles,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { ExecutionResult, ThemeMode, SupportedLanguage, TerminalLogEntry } from '../types';

interface OutputConsoleProps {
  logs: TerminalLogEntry[];
  result: ExecutionResult;
  themeMode: ThemeMode;
  language: SupportedLanguage;
  isRunning: boolean;
  onRunCode: () => void;
  onStopCode: () => void;
  onClearOutput: () => void;
  onSendInput: (input: string) => void;
  onOpenPdfExport: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  fontSize?: number;
  onChangeFontSize?: (size: number) => void;
}

export const OutputConsole: React.FC<OutputConsoleProps> = ({
  logs,
  result,
  themeMode,
  language,
  isRunning,
  onRunCode,
  onStopCode,
  onClearOutput,
  onSendInput,
  onOpenPdfExport,
  isFullscreen,
  onToggleFullscreen,
  fontSize = 13,
  onChangeFontSize,
}) => {
  const isDark = themeMode === 'dark';
  const [currentInput, setCurrentInput] = useState('');
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const terminalScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll terminal on new logs
  useEffect(() => {
    if (terminalScrollRef.current) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
    }
  }, [logs, isRunning]);

  // Focus input when program starts running
  useEffect(() => {
    if (isRunning) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isRunning]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRunning && logs.length === 0) {
      onRunCode();
      return;
    }
    submitInput();
  };

  const submitInput = () => {
    const textToSend = currentInput;
    onSendInput(textToSend);

    if (textToSend.trim()) {
      setInputHistory((prev) => [...prev, textToSend]);
    }
    setHistoryIndex(-1);
    setCurrentInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (inputHistory.length > 0) {
        const newIndex = historyIndex === -1 ? inputHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(inputHistory[newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= inputHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(inputHistory[newIndex] || '');
        }
      }
    }
  };

  const hasLogs = logs.length > 0;
  const isSuccess = result.status === 'success';
  const isError = result.status === 'compile_error' || result.status === 'runtime_error' || result.status === 'system_error';

  return (
    <div
      id="terminal-container"
      className={`flex flex-col h-full w-full min-h-0 min-w-0 rounded-xl border overflow-hidden shadow-sm transition-all duration-200 ${
        isFullscreen ? 'fixed inset-3 z-50 shadow-2xl' : ''
      } ${isDark ? 'bg-[#0B0F19] border-[#2A3447]' : 'bg-slate-950 border-slate-800'}`}
    >
      {/* Terminal Top Bar */}
      <div
        id="terminal-header"
        className={`flex flex-wrap items-center justify-between px-3 py-2 border-b select-none text-xs gap-2 shrink-0 ${
          isDark ? 'bg-[#131B2E] border-[#2A3447] text-slate-300' : 'bg-slate-900 border-slate-800 text-slate-300'
        }`}
      >
        {/* Left: Title & Status */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-semibold text-slate-100">
            <Terminal className="w-4 h-4 text-sky-400" />
            <span className="tracking-tight">Interactive Terminal</span>
          </div>

          {/* Running / Status Badges */}
          {isRunning ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-400/40 text-sky-300 text-[11px] font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span>Interactive Session Live</span>
            </div>
          ) : isSuccess ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium">
              <span>● Completed (Exit 0)</span>
            </div>
          ) : isError ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-medium">
              <span>● {result.status === 'compile_error' ? 'Build Error' : `Exit ${result.exitCode ?? 1}`}</span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-500">Idle</span>
          )}

          {/* Execution Time */}
          {result.executionTimeMs !== undefined && result.status !== 'idle' && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{result.executionTimeMs}ms</span>
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Zoom font */}
          {onChangeFontSize && (
            <div className="hidden sm:flex items-center gap-0.5 bg-slate-800/80 border border-slate-700/80 rounded px-1 text-[11px]">
              <button
                onClick={() => onChangeFontSize(Math.max(11, fontSize - 1))}
                className="px-1 text-slate-400 hover:text-white"
                title="Decrease terminal font size"
              >
                A-
              </button>
              <span className="text-slate-500 text-[10px]">{fontSize}px</span>
              <button
                onClick={() => onChangeFontSize(Math.min(18, fontSize + 1))}
                className="px-1 text-slate-400 hover:text-white"
                title="Increase terminal font size"
              >
                A+
              </button>
            </div>
          )}

          {/* Stop / Re-run */}
          {isRunning ? (
            <button
              id="terminal-stop-btn"
              onClick={onStopCode}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-600/90 hover:bg-red-500 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
              title="Stop current running program"
            >
              <Square className="w-3 h-3 fill-white" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              id="terminal-rerun-btn"
              onClick={onRunCode}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
              title="Run program (Ctrl + Enter)"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Run</span>
            </button>
          )}

          {/* Export PDF */}
          <button
            id="terminal-export-pdf-btn"
            onClick={onOpenPdfExport}
            className="flex items-center gap-1 px-2 py-1 rounded border border-sky-800/60 bg-sky-950/50 hover:bg-sky-900/60 text-sky-300 text-xs font-medium transition-all"
            title="Export code and terminal session to PDF"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden md:inline">PDF</span>
          </button>

          {/* Clear */}
          <button
            id="terminal-clear-btn"
            onClick={onClearOutput}
            className="p-1 rounded border border-slate-700 hover:border-slate-600 bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear terminal output"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen */}
          <button
            id="terminal-fullscreen-btn"
            onClick={onToggleFullscreen}
            className="p-1 rounded border border-slate-700 hover:border-slate-600 bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Maximize terminal'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Main Stream Log View */}
      <div
        ref={terminalScrollRef}
        id="terminal-stream-body"
        onClick={() => inputRef.current?.focus()}
        style={{ fontSize: `${fontSize}px` }}
        className="flex-1 min-h-0 p-3.5 overflow-y-auto font-mono leading-relaxed select-text bg-[#0B0F19] text-[#E2E8F0] cursor-text"
      >
        {!hasLogs && !isRunning ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 select-none py-10">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 mb-3">
              <Terminal className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">Terminal Ready</p>
            <p className="text-xs text-slate-400 mt-1 max-w-md text-center leading-relaxed">
              Click <span className="text-emerald-400 font-bold">RUN</span> (or press Ctrl + Enter) to execute your {language.toUpperCase()} code. If your program asks for input (e.g. <code className="text-sky-300 font-mono">scanf</code>, <code className="text-sky-300 font-mono">cin</code>, <code className="text-sky-300 font-mono">Scanner</code>, <code className="text-sky-300 font-mono">input()</code>), type directly in the prompt below.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log) => {
              if (log.type === 'system') {
                return (
                  <div key={log.id} className="text-slate-400 text-[11px] font-mono select-none my-1 opacity-80 whitespace-pre-wrap">
                    {log.text}
                  </div>
                );
              }
              if (log.type === 'stdin') {
                return (
                  <div key={log.id} className="flex items-start gap-1.5 text-amber-300 font-mono font-semibold">
                    <span className="text-amber-400/70 select-none">❯</span>
                    <span className="whitespace-pre-wrap">{log.text}</span>
                  </div>
                );
              }
              if (log.type === 'stderr') {
                return (
                  <div key={log.id} className="text-red-400 font-mono whitespace-pre-wrap">
                    {log.text}
                  </div>
                );
              }
              return (
                <span key={log.id} className="text-[#F1F5F9] font-mono whitespace-pre-wrap">
                  {log.text}
                </span>
              );
            })}

            {/* Pulsing indicator when actively executing */}
            {isRunning && (
              <span className="inline-block w-2 h-4 bg-sky-400 ml-1 animate-pulse align-middle" />
            )}
          </div>
        )}
      </div>

      {/* Interactive Prompt & Input Box at Bottom of Terminal */}
      <div
        id="terminal-input-bar"
        className={`p-2 sm:p-2.5 border-t select-none transition-colors shrink-0 ${
          isRunning
            ? 'bg-[#10172A] border-sky-500/40 shadow-inner'
            : 'bg-[#0E1526] border-slate-800'
        }`}
      >
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
          {/* Prompt prefix symbol */}
          <div className="flex items-center gap-1 text-xs font-mono font-bold text-sky-400 shrink-0 pl-1">
            <span className={isRunning ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}>●</span>
            <span className="text-slate-300">❯</span>
          </div>

          {/* User Input Input Field */}
          <input
            ref={inputRef}
            id="terminal-user-input"
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isRunning
                ? 'Type input and press Enter (e.g. John, 42, yes)...'
                : 'Click RUN to start interactive program (or press Ctrl+Enter)'
            }
            className={`flex-1 bg-transparent text-xs font-mono text-white placeholder-slate-500 outline-none transition-all ${
              isRunning ? 'cursor-text' : 'cursor-default opacity-80'
            }`}
          />

          {/* Action Button: Send Input or Run */}
          {isRunning ? (
            <button
              id="terminal-send-input-btn"
              type="submit"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition-all active:scale-95 shrink-0 min-h-[36px] sm:min-h-0"
              title="Send line to program stdin (Enter)"
            >
              <span>Send</span>
              <CornerDownLeft className="w-3 h-3" />
            </button>
          ) : (
            <button
              id="terminal-start-run-btn"
              type="button"
              onClick={onRunCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all active:scale-95 shrink-0 min-h-[36px] sm:min-h-0"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>RUN</span>
            </button>
          )}
        </form>

        {/* Mobile / Quick Helper Bar */}
        <div className="flex items-center justify-between pt-1 px-1 text-[10px] text-slate-400">
          <span className="hidden sm:inline">
            {isRunning ? 'Interactive Mode: Press Enter to send input' : 'Keyboard shortcut: Ctrl + Enter to run'}
          </span>
          {isRunning && (
            <span className="text-emerald-400 font-mono">
              Process active
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
