import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CodeEditor } from './components/CodeEditor';
import { InputPane } from './components/InputPane';
import { OutputConsole } from './components/OutputConsole';
import { GoogleDocsModal } from './components/GoogleDocsModal';
import { UserManualModal } from './components/UserManualModal';
import {
  SupportedLanguage,
  ThemeMode,
  ExecutionResult,
  CodeTemplate,
  ExportedDocRecord,
} from './types';
import {
  DEFAULT_TEMPLATES,
  LANGUAGE_CONFIGS,
} from './data/templates';
import { executeCode, exportToGoogleDocs } from './services/api';
import {
  auth,
  signInWithGoogle,
  signOutUser,
  getGoogleAccessToken,
  listenToAuthChanges,
} from './services/firebase';
import { User } from 'firebase/auth';

export const App: React.FC = () => {
  // 1. Language & Code States
  const [language, setLanguage] = useState<SupportedLanguage>('python');
  const [codes, setCodes] = useState<Record<SupportedLanguage, string>>({
    c: DEFAULT_TEMPLATES.c,
    cpp: DEFAULT_TEMPLATES.cpp,
    java: DEFAULT_TEMPLATES.java,
    python: DEFAULT_TEMPLATES.python,
  });
  const [stdin, setStdin] = useState<string>('');

  // 2. Execution Result State
  const [result, setResult] = useState<ExecutionResult>({
    status: 'idle',
    stdout: '',
    stderr: '',
  });
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // 3. Theme & Font Size
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('ide_theme_mode');
    return (saved === 'bright' || saved === 'dark') ? (saved as ThemeMode) : 'dark';
  });
  const [fontSize, setFontSize] = useState<number>(14);

  // 4. Modals & Panels State
  const [isUserManualOpen, setIsUserManualOpen] = useState<boolean>(false);
  const [isGoogleDocsModalOpen, setIsGoogleDocsModalOpen] = useState<boolean>(false);
  const [isOutputFullscreen, setIsOutputFullscreen] = useState<boolean>(false);
  const [isStdinCollapsed, setIsStdinCollapsed] = useState<boolean>(false);

  // 5. Auth & Export History
  const [user, setUser] = useState<User | null>(null);
  const [exportHistory, setExportHistory] = useState<ExportedDocRecord[]>([]);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = listenToAuthChanges((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Sync theme class to root body
  useEffect(() => {
    localStorage.setItem('ide_theme_mode', themeMode);
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'bright' : 'dark'));
  };

  const handleCodeChange = (newCode: string) => {
    setCodes((prev) => ({ ...prev, [language]: newCode }));
  };

  const handleSelectTemplate = (template: CodeTemplate) => {
    setCodes((prev) => ({ ...prev, [language]: template.code }));
    if (template.stdin !== undefined) {
      setStdin(template.stdin);
    } else if (template.sampleStdin !== undefined) {
      setStdin(template.sampleStdin);
    }
  };

  const handleResetCode = () => {
    setCodes((prev) => ({ ...prev, [language]: DEFAULT_TEMPLATES[language] }));
  };

  // Run Code logic
  const handleRunCode = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    setResult({
      status: 'running',
      stdout: '',
      stderr: '',
    });

    try {
      const currentCode = codes[language];
      const execRes = await executeCode(language, currentCode, stdin);
      setResult(execRes);
    } catch (err: any) {
      setResult({
        status: 'system_error',
        stdout: '',
        stderr: err.message || 'Failed to execute code on server.',
        exitCode: 1,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, codes, language, stdin]);

  const handleStopCode = () => {
    setIsRunning(false);
  };

  // Global Keyboard Shortcuts (Ctrl+Enter or Cmd+Enter to Run)
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

  // Handle Google Sign In
  const handleSignIn = async () => {
    try {
      const res = await signInWithGoogle();
      setUser(res.user);
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setUser(null);
    } catch (err: any) {
      console.error('Sign out failed:', err);
    }
  };

  // Google Docs Export Handler
  const handleExportToGoogleDocs = async (title: string) => {
    const accessToken = getGoogleAccessToken();
    if (!accessToken) {
      // Prompt user to sign in
      const res = await signInWithGoogle();
      setUser(res.user);
      const newToken = getGoogleAccessToken() || res.accessToken;
      if (!newToken) {
        throw new Error('Google OAuth token not available. Please sign in again.');
      }
      return executeExport(title, newToken);
    }
    return executeExport(title, accessToken);
  };

  const executeExport = async (title: string, token: string) => {
    const currentCode = codes[language];
    const exportResult = await exportToGoogleDocs({
      accessToken: token,
      title,
      language,
      code: currentCode,
      stdin,
      output: result.stdout,
      stderr: result.stderr,
      executionTimeMs: result.executionTimeMs,
    });

    const newRecord: ExportedDocRecord = {
      id: `doc-${Date.now()}`,
      documentId: exportResult.documentId,
      documentUrl: exportResult.documentUrl,
      title: exportResult.title,
      timestamp: new Date().toLocaleTimeString(),
      language,
    };
    setExportHistory((prev) => [newRecord, ...prev]);

    return exportResult;
  };

  const currentCode = codes[language];

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        themeMode === 'dark' ? 'bg-[#0F172A] text-[#F8FAFC]' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Top Main Navigation Header */}
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
        onOpenGoogleDocs={() => setIsGoogleDocsModalOpen(true)}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      {/* Main Split-Pane Workspace */}
      <main className="flex-1 p-3 md:p-4 grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 overflow-hidden max-w-[1920px] mx-auto w-full">
        {/* Left Column: Code Editor + Stdin Pane */}
        <div className="flex flex-col gap-3 min-h-[500px] h-[calc(100vh-140px)]">
          {/* Main Code Editor */}
          <div className="flex-1 min-h-0">
            <CodeEditor
              language={language}
              code={currentCode}
              onChangeCode={handleCodeChange}
              onSelectTemplate={handleSelectTemplate}
              themeMode={themeMode}
              fontSize={fontSize}
              onChangeFontSize={setFontSize}
            />
          </div>

          {/* Standard Input (stdin) Pane */}
          <div className="shrink-0">
            <InputPane
              stdin={stdin}
              onChangeStdin={setStdin}
              themeMode={themeMode}
              language={language}
              isCollapsed={isStdinCollapsed}
              onToggleCollapse={() => setIsStdinCollapsed((p) => !p)}
            />
          </div>
        </div>

        {/* Right Column: Output Console / Terminal */}
        <div className="flex flex-col min-h-[500px] h-[calc(100vh-140px)]">
          <OutputConsole
            result={result}
            themeMode={themeMode}
            language={language}
            isRunning={isRunning}
            onClearOutput={() => setResult({ status: 'idle', stdout: '', stderr: '' })}
            onExportToDocs={() => setIsGoogleDocsModalOpen(true)}
            isFullscreen={isOutputFullscreen}
            onToggleFullscreen={() => setIsOutputFullscreen((p) => !p)}
          />
        </div>
      </main>

      {/* Google Docs Export Modal */}
      <GoogleDocsModal
        isOpen={isGoogleDocsModalOpen}
        onClose={() => setIsGoogleDocsModalOpen(false)}
        language={language}
        code={currentCode}
        stdin={stdin}
        result={result}
        themeMode={themeMode}
        user={user}
        onSignIn={handleSignIn}
        onExportDoc={handleExportToGoogleDocs}
        exportHistory={exportHistory}
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
