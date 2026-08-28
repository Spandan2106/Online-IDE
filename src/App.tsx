import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { CodeEditor } from './components/CodeEditor';
import { OutputConsole } from './components/OutputConsole';
import { PdfExportModal } from './components/PdfExportModal';
import { UserManualModal } from './components/UserManualModal';
import {
  SupportedLanguage,
  ThemeMode,
  ExecutionResult,
  CodeTemplate,
  TerminalLogEntry,
  LayoutOrientation,
} from './types';
import { DEFAULT_TEMPLATES } from './data/templates';
import {
  startTerminalSession,
  sendTerminalInput,
  stopTerminalSession,
  subscribeToTerminalStream,
} from './services/api';
import { Code, Terminal, GripVertical, GripHorizontal, Play, Square } from 'lucide-react';

export const App: React.FC = () => {
  // 1. Language & Code State
  const [language, setLanguage] = useState<SupportedLanguage>('c');
  const [codes, setCodes] = useState<Record<SupportedLanguage, string>>({
    c: DEFAULT_TEMPLATES.c,
    cpp: DEFAULT_TEMPLATES.cpp,
    java: DEFAULT_TEMPLATES.java,
    python: DEFAULT_TEMPLATES.python,
  });

  // 2. Interactive Terminal & Stream State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLogEntry[]>([]);
  const [result, setResult] = useState<ExecutionResult>({
    status: 'idle',
    stdout: '',
    stderr: '',
  });
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const streamUnsubscribeRef = useRef<(() => void) | null>(null);

  // 3. Theme & Font Size
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('ide_theme_mode');
    return saved === 'bright' || saved === 'dark' ? (saved as ThemeMode) : 'dark';
  });
  const [editorFontSize, setEditorFontSize] = useState<number>(14);
  const [terminalFontSize, setTerminalFontSize] = useState<number>(13);

  // 4. Layout, Resizing & Mobile State
  const [layoutOrientation, setLayoutOrientation] = useState<LayoutOrientation>(() => {
    const saved = localStorage.getItem('ide_layout_orientation');
    return saved === 'vertical' ? 'vertical' : 'horizontal';
  });
  const [splitRatio, setSplitRatio] = useState<number>(() => {
    const saved = localStorage.getItem('ide_split_ratio');
    const parsed = saved ? parseFloat(saved) : 0.55;
    return !isNaN(parsed) && parsed >= 0.2 && parsed <= 0.8 ? parsed : 0.55;
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<'editor' | 'terminal'>('editor');

  // 5. Modals & Panels State
  const [isUserManualOpen, setIsUserManualOpen] = useState<boolean>(false);
  const [isPdfExportModalOpen, setIsPdfExportModalOpen] = useState<boolean>(false);
  const [isOutputFullscreen, setIsOutputFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync theme class to root html element
  useEffect(() => {
    localStorage.setItem('ide_theme_mode', themeMode);
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  // Persist layout preferences
  useEffect(() => {
    localStorage.setItem('ide_layout_orientation', layoutOrientation);
  }, [layoutOrientation]);

  useEffect(() => {
    localStorage.setItem('ide_split_ratio', splitRatio.toString());
  }, [splitRatio]);

  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'bright' : 'dark'));
  };

  const handleToggleOrientation = () => {
    setLayoutOrientation((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
  };

  const handleCodeChange = (newCode: string) => {
    setCodes((prev) => ({ ...prev, [language]: newCode }));
  };

  const handleSelectTemplate = (template: CodeTemplate) => {
    setCodes((prev) => ({ ...prev, [language]: template.code }));
  };

  const handleResetCode = () => {
    setCodes((prev) => ({ ...prev, [language]: DEFAULT_TEMPLATES[language] }));
  };

  // Start Interactive Terminal Execution
  const handleRunCode = useCallback(async () => {
    if (isRunning) return;

    // Clean up any existing stream
    if (streamUnsubscribeRef.current) {
      streamUnsubscribeRef.current();
      streamUnsubscribeRef.current = null;
    }

    setIsRunning(true);
    setTerminalLogs([]);
    setResult({
      status: 'running',
      stdout: '',
      stderr: '',
      timestamp: new Date().toLocaleTimeString(),
    });

    // Auto switch to terminal on mobile
    setMobileActiveTab('terminal');

    try {
      const currentCode = codes[language];
      const startRes = await startTerminalSession(language, currentCode);
      setSessionId(startRes.sessionId);

      if (startRes.status === 'compile_error') {
        setIsRunning(false);
        setResult({
          status: 'compile_error',
          stdout: '',
          stderr: startRes.stderr || 'Compilation Failed',
          exitCode: startRes.exitCode ?? 1,
          compilationTimeMs: startRes.compilationTimeMs,
          timestamp: new Date().toLocaleTimeString(),
        });
        setTerminalLogs([
          {
            id: 'err_1',
            type: 'system',
            text: `[Compilation Failed for ${language.toUpperCase()}]\n`,
            timestamp: new Date().toLocaleTimeString(),
          },
          {
            id: 'err_2',
            type: 'stderr',
            text: startRes.stderr || 'Build failed with errors.\n',
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        return;
      }

      // Connect to SSE stream
      const unsubscribe = subscribeToTerminalStream(startRes.sessionId, {
        onData: (log) => {
          setTerminalLogs((prev) => [...prev, log]);
        },
        onExit: (exitInfo) => {
          setIsRunning(false);
          setResult((prev) => ({
            ...prev,
            status: exitInfo.exitCode === 0 ? 'success' : 'runtime_error',
            exitCode: exitInfo.exitCode,
            executionTimeMs: exitInfo.executionTimeMs,
            timestamp: new Date().toLocaleTimeString(),
          }));
        },
        onError: (err) => {
          console.warn('SSE connection closed:', err);
          setIsRunning(false);
        },
      });

      streamUnsubscribeRef.current = unsubscribe;
    } catch (err: any) {
      setIsRunning(false);
      const errMsg = err.message || 'Failed to start terminal session';
      setResult({
        status: 'system_error',
        stdout: '',
        stderr: errMsg,
        exitCode: 1,
        timestamp: new Date().toLocaleTimeString(),
      });
      setTerminalLogs([
        {
          id: 'sys_err',
          type: 'stderr',
          text: `\n[System Error: ${errMsg}]\n`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
  }, [isRunning, codes, language]);

  // Send input to the running program
  const handleSendInput = useCallback(
    async (input: string) => {
      if (!sessionId || !isRunning) {
        // Echo in terminal if idle
        setTerminalLogs((prev) => [
          ...prev,
          {
            id: `input_${Date.now()}`,
            type: 'stdin',
            text: input + '\n',
            timestamp: new Date().toLocaleTimeString(),
          },
          {
            id: `hint_${Date.now()}`,
            type: 'system',
            text: '[Note: Program is not currently running. Click RUN to execute]\n',
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
        return;
      }

      try {
        await sendTerminalInput(sessionId, input);
      } catch (err: any) {
        console.error('Error sending terminal input:', err);
      }
    },
    [sessionId, isRunning]
  );

  // Stop running program
  const handleStopCode = useCallback(async () => {
    if (sessionId) {
      try {
        await stopTerminalSession(sessionId);
      } catch (err) {
        console.error('Failed to stop session:', err);
      }
    }
    if (streamUnsubscribeRef.current) {
      streamUnsubscribeRef.current();
      streamUnsubscribeRef.current = null;
    }
    setIsRunning(false);
    setResult((prev) => ({
      ...prev,
      status: 'idle',
      exitCode: 130,
    }));
  }, [sessionId]);

  const handleClearOutput = () => {
    setTerminalLogs([]);
    setResult({
      status: 'idle',
      stdout: '',
      stderr: '',
    });
  };

  // Splitter Drag Handler (Horizontal and Vertical)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      if (layoutOrientation === 'horizontal') {
        const relativeX = e.clientX - rect.left;
        const newRatio = Math.max(0.2, Math.min(0.8, relativeX / rect.width));
        setSplitRatio(newRatio);
      } else {
        const relativeY = e.clientY - rect.top;
        const newRatio = Math.max(0.2, Math.min(0.8, relativeY / rect.height));
        setSplitRatio(newRatio);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !containerRef.current || e.touches.length === 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];

      if (layoutOrientation === 'horizontal') {
        const relativeX = touch.clientX - rect.left;
        const newRatio = Math.max(0.2, Math.min(0.8, relativeX / rect.width));
        setSplitRatio(newRatio);
      } else {
        const relativeY = touch.clientY - rect.top;
        const newRatio = Math.max(0.2, Math.min(0.8, relativeY / rect.height));
        setSplitRatio(newRatio);
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = layoutOrientation === 'horizontal' ? 'col-resize' : 'row-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, layoutOrientation]);

  // Global Keyboard Shortcuts (Ctrl+Enter to Run)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleRunCode]);

  const currentCode = codes[language];
  const isDark = themeMode === 'dark';

  return (
    <div
      className={`h-screen max-h-screen w-screen max-w-full flex flex-col font-sans transition-colors duration-200 overflow-hidden ${
        isDark ? 'bg-[#0A0E17] text-[#F8FAFC]' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Top Header Navigation */}
      <Header
        currentLanguage={language}
        onSelectLanguage={setLanguage}
        isRunning={isRunning}
        onRunCode={handleRunCode}
        onStopCode={handleStopCode}
        onResetCode={handleResetCode}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
        onOpenUserManual={() => setIsUserManualOpen(true)}
        onOpenPdfExport={() => setIsPdfExportModalOpen(true)}
        layoutOrientation={layoutOrientation}
        onToggleOrientation={handleToggleOrientation}
        splitRatio={splitRatio}
        onSetSplitRatio={setSplitRatio}
      />

      {/* Mobile Screen Segmented Tab Switcher (< 768px) */}
      <div
        className={`md:hidden px-3 pt-2 pb-1 border-b select-none flex items-center justify-between gap-2 shrink-0 ${
          isDark ? 'bg-[#131B2E] border-[#2A3447]' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex-1 grid grid-cols-2 p-1 rounded-xl bg-slate-900/60 border border-slate-800 gap-1">
          <button
            onClick={() => setMobileActiveTab('editor')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              mobileActiveTab === 'editor'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Code Editor</span>
          </button>

          <button
            onClick={() => setMobileActiveTab('terminal')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all relative ${
              mobileActiveTab === 'terminal'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Live Terminal</span>
            {isRunning && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            )}
          </button>
        </div>

        {/* Quick mobile Run button */}
        {isRunning ? (
          <button
            onClick={handleStopCode}
            className="px-3 py-2 rounded-xl bg-red-600 text-white text-xs font-bold shrink-0 flex items-center gap-1"
          >
            <Square className="w-3 h-3 fill-white" />
            <span>Stop</span>
          </button>
        ) : (
          <button
            onClick={handleRunCode}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shrink-0 flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>RUN</span>
          </button>
        )}
      </div>

      {/* Main Workspace with Resizable Splitter */}
      <main
        ref={containerRef}
        id="main-workspace"
        className="flex-1 min-h-0 min-w-0 p-2 sm:p-3 overflow-hidden max-w-[1920px] mx-auto w-full flex flex-col"
      >
        {/* Desktop / Tablet Resizable View */}
        <div
          className={`hidden md:flex w-full h-full min-h-0 min-w-0 gap-0 overflow-hidden ${
            layoutOrientation === 'horizontal' ? 'flex-row' : 'flex-col'
          }`}
        >
          {/* Editor Pane (Width or Height determined by splitRatio) */}
          <div
            style={{
              width: layoutOrientation === 'horizontal' ? `${splitRatio * 100}%` : '100%',
              height: layoutOrientation === 'horizontal' ? '100%' : `${splitRatio * 100}%`,
            }}
            className="min-h-0 min-w-0 overflow-hidden transition-all duration-75 flex flex-col"
          >
            <CodeEditor
              language={language}
              code={currentCode}
              onChangeCode={handleCodeChange}
              onSelectTemplate={handleSelectTemplate}
              themeMode={themeMode}
              fontSize={editorFontSize}
              onChangeFontSize={setEditorFontSize}
            />
          </div>

          {/* Draggable Divider Handle */}
          <div
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
            className={`group relative flex items-center justify-center select-none transition-colors z-10 shrink-0 ${
              layoutOrientation === 'horizontal'
                ? 'w-3.5 -mx-1.5 cursor-col-resize hover:bg-sky-500/20'
                : 'h-3.5 -my-1.5 cursor-row-resize hover:bg-sky-500/20'
            }`}
            title="Drag to resize Editor and Terminal panes"
          >
            <div
              className={`rounded-full transition-all ${
                isDragging
                  ? 'bg-sky-400 shadow-md shadow-sky-500/40'
                  : 'bg-slate-700/60 group-hover:bg-sky-500/80'
              } ${
                layoutOrientation === 'horizontal'
                  ? 'w-1 h-8 group-hover:h-12'
                  : 'h-1 w-8 group-hover:w-12'
              }`}
            />
          </div>

          {/* Terminal Pane (Remaining Width or Height) */}
          <div
            style={{
              width: layoutOrientation === 'horizontal' ? `${(1 - splitRatio) * 100}%` : '100%',
              height: layoutOrientation === 'horizontal' ? '100%' : `${(1 - splitRatio) * 100}%`,
            }}
            className="min-h-0 min-w-0 overflow-hidden transition-all duration-75 flex flex-col"
          >
            <OutputConsole
              logs={terminalLogs}
              result={result}
              themeMode={themeMode}
              language={language}
              isRunning={isRunning}
              onRunCode={handleRunCode}
              onStopCode={handleStopCode}
              onClearOutput={handleClearOutput}
              onSendInput={handleSendInput}
              onOpenPdfExport={() => setIsPdfExportModalOpen(true)}
              isFullscreen={isOutputFullscreen}
              onToggleFullscreen={() => setIsOutputFullscreen((p) => !p)}
              fontSize={terminalFontSize}
              onChangeFontSize={setTerminalFontSize}
            />
          </div>
        </div>

        {/* Mobile View with Smooth Tab Navigation */}
        <div className="flex-1 min-h-0 flex flex-col md:hidden overflow-hidden h-full">
          <div className={`flex-1 min-h-0 overflow-hidden ${mobileActiveTab === 'editor' ? 'flex flex-col h-full' : 'hidden'}`}>
            <CodeEditor
              language={language}
              code={currentCode}
              onChangeCode={handleCodeChange}
              onSelectTemplate={handleSelectTemplate}
              themeMode={themeMode}
              fontSize={editorFontSize}
              onChangeFontSize={setEditorFontSize}
            />
          </div>

          <div className={`flex-1 min-h-0 overflow-hidden ${mobileActiveTab === 'terminal' ? 'flex flex-col h-full' : 'hidden'}`}>
            <OutputConsole
              logs={terminalLogs}
              result={result}
              themeMode={themeMode}
              language={language}
              isRunning={isRunning}
              onRunCode={handleRunCode}
              onStopCode={handleStopCode}
              onClearOutput={handleClearOutput}
              onSendInput={handleSendInput}
              onOpenPdfExport={() => setIsPdfExportModalOpen(true)}
              isFullscreen={isOutputFullscreen}
              onToggleFullscreen={() => setIsOutputFullscreen((p) => !p)}
              fontSize={terminalFontSize}
              onChangeFontSize={setTerminalFontSize}
            />
          </div>
        </div>
      </main>

      {/* PDF Export Modal */}
      <PdfExportModal
        isOpen={isPdfExportModalOpen}
        onClose={() => setIsPdfExportModalOpen(false)}
        language={language}
        code={currentCode}
        logs={terminalLogs}
        result={result}
        themeMode={themeMode}
      />

      {/* Comprehensive User Manual Modal */}
      <UserManualModal
        isOpen={isUserManualOpen}
        onClose={() => setIsUserManualOpen(false)}
        themeMode={themeMode}
      />
    </div>
  );
};

export default App;
