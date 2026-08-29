import React, { useState, useRef, useEffect } from 'react';
import {
  Copy,
  Check,
  Download,
  Upload,
  Search,
  ZoomIn,
  ZoomOut,
  Code,
  Sparkles,
  FileCode,
  Layers,
  ChevronDown,
  X,
  ArrowDown,
  ArrowUp,
  Replace,
} from 'lucide-react';
import { SupportedLanguage, ThemeMode, CodeTemplate } from '../types';
import { LANGUAGE_CONFIGS, TEMPLATES_BY_LANGUAGE } from '../data/templates';

interface CodeEditorProps {
  language: SupportedLanguage;
  code: string;
  onChangeCode: (newCode: string) => void;
  onSelectTemplate: (template: CodeTemplate) => void;
  themeMode: ThemeMode;
  fontSize: number;
  onChangeFontSize: (size: number) => void;
  highlightedLineIndex?: number;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  code,
  onChangeCode,
  onSelectTemplate,
  themeMode,
  fontSize,
  onChangeFontSize,
  highlightedLineIndex,
}) => {
  const isDark = themeMode === 'dark';
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [copied, setCopied] = useState(false);
  const [showTemplatesDropdown, setShowTemplatesDropdown] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [searchMatches, setSearchMatches] = useState<number[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const safeCode = code || '';
  const config = LANGUAGE_CONFIGS[language] || LANGUAGE_CONFIGS.javascript;
  const templates = TEMPLATES_BY_LANGUAGE[language] || [];
  const lines = safeCode.split('\n');

  // Handle scroll syncing between line numbers and textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Update cursor line & column
  const handleCursorMove = () => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart;
    const textBefore = safeCode.substring(0, pos);
    const lineArr = textBefore.split('\n');
    setCursorPos({
      line: lineArr.length,
      col: lineArr[lineArr.length - 1].length + 1,
    });
  };

  // Keyboard enhancements (Tab key, Auto-close brackets, Auto-indent on Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Search shortcut: Ctrl+F or Cmd+F
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      setShowSearchBar((prev) => !prev);
      return;
    }

    // 1. Tab Key: Insert 4 spaces or outdent
    if (e.key === 'Tab') {
      e.preventDefault();
      const indent = '    '; // 4 spaces

      if (e.shiftKey) {
        // Outdent line
        const before = code.substring(0, start);
        const lineStart = before.lastIndexOf('\n') + 1;
        const lineContent = code.substring(lineStart);
        if (lineContent.startsWith(indent)) {
          const newCode = code.substring(0, lineStart) + code.substring(lineStart + indent.length);
          onChangeCode(newCode);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, start - indent.length);
          }, 0);
        }
      } else {
        // Normal Tab: Insert 4 spaces
        const newCode = code.substring(0, start) + indent + code.substring(end);
        onChangeCode(newCode);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + indent.length;
        }, 0);
      }
      return;
    }

    // 2. Auto-close brackets and quotes
    const pairs: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
    };

    if (pairs[e.key] && start === end) {
      e.preventDefault();
      const closing = pairs[e.key];
      const newCode = code.substring(0, start) + e.key + closing + code.substring(end);
      onChangeCode(newCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
      return;
    }

    // 3. Auto-indentation upon pressing Enter
    if (e.key === 'Enter') {
      const before = safeCode.substring(0, start);
      const lastLine = before.split('\n').pop() || '';
      const match = lastLine.match(/^(\s+)/);
      const currentIndent = match ? match[1] : '';
      const extraIndent = lastLine.trim().endsWith('{') ? '    ' : '';

      if (currentIndent || extraIndent) {
        e.preventDefault();
        const totalIndent = currentIndent + extraIndent;
        const newCode = safeCode.substring(0, start) + '\n' + totalIndent + safeCode.substring(end);
        onChangeCode(newCode);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1 + totalIndent.length;
        }, 0);
        return;
      }
    }
  };

  // Copy code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // Download code as file
  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = config.defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Upload local file
  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result;
      if (typeof content === 'string') {
        onChangeCode(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Format code (basic beautification)
  const handleFormatCode = () => {
    const rawLines = safeCode.split('\n');
    let indentLevel = 0;
    const formatted = rawLines.map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '';

      // Decrease indent if starts with closing brace
      if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      const indent = '    '.repeat(indentLevel);
      const res = indent + trimmed;

      // Increase indent if line ends with opening brace
      if (trimmed.endsWith('{') || (language === 'python' && trimmed.endsWith(':'))) {
        indentLevel++;
      }

      return res;
    });

    onChangeCode(formatted.join('\n'));
  };

  // Search & Replace logic
  useEffect(() => {
    if (!searchQuery) {
      setSearchMatches([]);
      setCurrentMatchIndex(0);
      return;
    }

    const matches: number[] = [];
    let pos = 0;
    const lowerCode = safeCode.toLowerCase();
    const lowerQuery = searchQuery.toLowerCase();

    while (pos < lowerCode.length) {
      const idx = lowerCode.indexOf(lowerQuery, pos);
      if (idx === -1) break;
      matches.push(idx);
      pos = idx + searchQuery.length;
    }

    setSearchMatches(matches);
    setCurrentMatchIndex(0);
  }, [searchQuery, safeCode]);

  const handleNextMatch = () => {
    if (searchMatches.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % searchMatches.length;
    setCurrentMatchIndex(nextIdx);
    selectMatch(searchMatches[nextIdx]);
  };

  const handlePrevMatch = () => {
    if (searchMatches.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    setCurrentMatchIndex(prevIdx);
    selectMatch(searchMatches[prevIdx]);
  };

  const selectMatch = (pos: number) => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(pos, pos + searchQuery.length);
    }
  };

  const handleReplaceCurrent = () => {
    if (searchMatches.length === 0) return;
    const pos = searchMatches[currentMatchIndex];
    const newCode = code.substring(0, pos) + replaceQuery + code.substring(pos + searchQuery.length);
    onChangeCode(newCode);
  };

  const handleReplaceAll = () => {
    if (!searchQuery) return;
    const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const newCode = code.replace(regex, replaceQuery);
    onChangeCode(newCode);
  };

  return (
    <div
      id="code-editor-container"
      className={`flex flex-col h-full w-full min-h-0 rounded-lg border overflow-hidden shadow-xs transition-colors duration-200 ${
        isDark ? 'bg-[#0F172A] border-[#334155]' : 'bg-white border-slate-200'
      }`}
    >
      {/* Editor Top Bar / File Tabs */}
      <div
        id="editor-toolbar"
        className={`flex flex-wrap items-center justify-between px-3 py-2 border-b text-xs select-none gap-2 shrink-0 ${
          isDark ? 'bg-[#1E293B] border-[#334155] text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}
      >
        {/* Left: File Badge & Template Dropdown */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-t-md font-mono text-xs font-semibold border ${
              isDark ? 'bg-[#0F172A] border-[#334155] text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-sky-400" />
            <span>{config.defaultFilename}</span>
            <span className="text-[10px] text-slate-400 font-normal">({config.version})</span>
          </div>

          {/* Templates Dropdown Button */}
          <div className="relative">
            <button
              id="templates-dropdown-btn"
              onClick={() => setShowTemplatesDropdown((p) => !p)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium border transition-colors ${
                isDark
                  ? 'bg-[#0F172A] border-[#334155] hover:bg-[#1E293B] text-slate-300'
                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
              title="Load pre-built template or algorithm"
            >
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>Snippets</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {/* Dropdown Menu */}
            {showTemplatesDropdown && (
              <div
                id="templates-menu"
                className={`absolute left-0 mt-1.5 w-64 rounded-xl border shadow-xl z-30 p-1.5 transition-all ${
                  isDark ? 'bg-[#1E293B] border-[#334155] text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#334155] mb-1">
                  {config.name} Code Presets
                </div>
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      onSelectTemplate(tpl);
                      setShowTemplatesDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex flex-col gap-0.5 ${
                      isDark ? 'hover:bg-[#0F172A]' : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span>{tpl.title}</span>
                      <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400">
                        {tpl.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 truncate">{tpl.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions (Search, Format, Font size, Copy, Download, Upload) */}
        <div className="flex items-center gap-1.5">
          {/* Find & Replace */}
          <button
            id="search-replace-btn"
            onClick={() => setShowSearchBar((p) => !p)}
            className={`p-1.5 rounded-md border transition-colors ${
              showSearchBar
                ? isDark
                  ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                  : 'bg-blue-50 border-blue-300 text-blue-700'
                : isDark
                ? 'bg-[#0F172A] border-[#334155] hover:bg-[#1E293B] text-slate-300'
                : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
            title="Find and Replace (Ctrl+F)"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Format Code */}
          <button
            id="format-code-btn"
            onClick={handleFormatCode}
            className={`p-1.5 rounded-md border transition-colors ${
              isDark
                ? 'bg-[#0F172A] border-[#334155] hover:bg-[#1E293B] text-slate-300'
                : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
            title="Auto-format code indentation"
          >
            <Code className="w-3.5 h-3.5" />
          </button>

          {/* Font Zoom Controls */}
          <div
            className={`flex items-center rounded-md border p-0.5 ${
              isDark ? 'bg-[#0F172A] border-[#334155]' : 'bg-white border-slate-200'
            }`}
          >
            <button
              id="zoom-out-btn"
              onClick={() => onChangeFontSize(Math.max(12, fontSize - 2))}
              className="p-1 hover:bg-[#1E293B] rounded text-slate-400 hover:text-slate-200"
              title="Decrease font size"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono px-1 font-semibold text-slate-300">{fontSize}px</span>
            <button
              id="zoom-in-btn"
              onClick={() => onChangeFontSize(Math.min(24, fontSize + 2))}
              className="p-1 hover:bg-[#1E293B] rounded text-slate-400 hover:text-slate-200"
              title="Increase font size"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          {/* Copy Code */}
          <button
            id="copy-code-btn"
            onClick={handleCopyCode}
            className={`flex items-center gap-1 px-2 py-1 rounded-md border transition-colors ${
              copied
                ? 'bg-emerald-600 text-white border-emerald-500'
                : isDark
                ? 'bg-[#0F172A] border-[#334155] hover:bg-[#1E293B] text-slate-300'
                : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
            title="Copy code to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Download File */}
          <button
            id="download-code-btn"
            onClick={handleDownloadCode}
            className={`p-1.5 rounded-md border transition-colors ${
              isDark
                ? 'bg-[#0F172A] border-[#334155] hover:bg-[#1E293B] text-slate-300'
                : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
            title={`Download as ${config.defaultFilename}`}
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Upload File */}
          <label
            id="upload-code-label"
            className={`p-1.5 rounded-md border cursor-pointer transition-colors ${
              isDark
                ? 'bg-[#0F172A] border-[#334155] hover:bg-[#1E293B] text-slate-300'
                : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
            title="Upload code file"
          >
            <Upload className="w-3.5 h-3.5" />
            <input type="file" accept=".c,.cpp,.java,.py,.js,.ts,.sql,.html,.css,.txt,.h,.hpp" onChange={handleUploadFile} className="hidden" />
          </label>
        </div>
      </div>

      {/* Find & Replace Bar (collapsible) */}
      {showSearchBar && (
        <div
          id="editor-search-bar"
          className={`flex flex-wrap items-center justify-between px-3 py-2 border-b text-xs gap-2 shrink-0 ${
            isDark ? 'bg-[#1E293B] border-[#334155] text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="w-3 h-3 absolute left-2.5 text-slate-400" />
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find..."
                className={`pl-7 pr-16 py-1 rounded-md border text-xs font-mono outline-none focus:ring-1 focus:ring-sky-500 w-44 ${
                  isDark ? 'bg-[#0F172A] border-[#334155] text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              <span className="absolute right-2 text-[10px] text-slate-400 font-mono">
                {searchMatches.length > 0 ? `${currentMatchIndex + 1}/${searchMatches.length}` : '0'}
              </span>
            </div>

            {/* Match navigation */}
            <button
              onClick={handlePrevMatch}
              disabled={searchMatches.length === 0}
              className="p-1 rounded hover:bg-[#0F172A] text-slate-300 disabled:opacity-30"
              title="Previous match"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNextMatch}
              disabled={searchMatches.length === 0}
              className="p-1 rounded hover:bg-[#0F172A] text-slate-300 disabled:opacity-30"
              title="Next match"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>

            {/* Replace Input */}
            <div className="relative flex items-center">
              <Replace className="w-3 h-3 absolute left-2.5 text-slate-400" />
              <input
                id="replace-input"
                type="text"
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                placeholder="Replace with..."
                className={`pl-7 pr-2 py-1 rounded-md border text-xs font-mono outline-none focus:ring-1 focus:ring-sky-500 w-44 ${
                  isDark ? 'bg-[#0F172A] border-[#334155] text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <button
              onClick={handleReplaceCurrent}
              disabled={searchMatches.length === 0}
              className="px-2 py-1 rounded border border-[#334155] text-[11px] font-medium bg-[#0F172A] text-slate-200 hover:bg-sky-600 hover:text-white disabled:opacity-30 transition-colors"
            >
              Replace
            </button>
            <button
              onClick={handleReplaceAll}
              disabled={searchMatches.length === 0}
              className="px-2 py-1 rounded border border-[#334155] text-[11px] font-medium bg-[#0F172A] text-slate-200 hover:bg-sky-600 hover:text-white disabled:opacity-30 transition-colors"
            >
              Replace All
            </button>
          </div>

          <button
            onClick={() => setShowSearchBar(false)}
            className="p-1 rounded hover:bg-[#0F172A] text-slate-400 hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Editor Body: Line Numbers + Textarea */}
      <div
        className={`relative flex-1 min-h-0 min-w-0 w-full flex overflow-hidden font-mono ${
          isDark ? 'bg-[#0F172A]' : 'bg-white'
        }`}
      >
        {/* Line Numbers Column */}
        <div
          ref={lineNumbersRef}
          id="editor-line-numbers"
          aria-hidden="true"
          className={`w-12 h-full py-3 pr-2.5 text-right select-none overflow-hidden font-mono text-xs border-r shrink-0 transition-colors ${
            isDark
              ? 'bg-[#1E293B]/30 border-[#334155] text-slate-600'
              : 'bg-slate-100/70 border-slate-200 text-slate-400'
          }`}
          style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}
        >
          {lines.map((_, idx) => {
            const lineNum = idx + 1;
            const isHighlighted = highlightedLineIndex === idx;
            const isCursorLine = cursorPos.line === lineNum;

            return (
              <div
                key={idx}
                style={{ lineHeight: '1.6' }}
                className={`transition-colors ${
                  isHighlighted
                    ? 'text-sky-400 font-bold bg-sky-500/20'
                    : isCursorLine
                    ? isDark
                      ? 'text-slate-300 font-semibold'
                      : 'text-slate-700 font-semibold'
                    : ''
                }`}
              >
                {lineNum}
              </div>
            );
          })}
        </div>

        {/* Code Textarea Area with absolute fill */}
        <div className="relative flex-1 h-full min-w-0 min-h-0 overflow-hidden">
          <textarea
            ref={textareaRef}
            id="code-editor-textarea"
            value={code}
            onChange={(e) => onChangeCode(e.target.value)}
            onKeyDown={handleKeyDown}
            onKeyUp={handleCursorMove}
            onClick={handleCursorMove}
            onScroll={handleScroll}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className={`absolute inset-0 w-full h-full p-3 resize-none outline-none font-mono transition-colors overflow-auto ${
              isDark
                ? 'bg-[#0F172A] text-[#F8FAFC] selection:bg-sky-600/40 placeholder-slate-600'
                : 'bg-white text-slate-900 selection:bg-blue-200 placeholder-slate-400'
            }`}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: '1.6',
              tabSize: 4,
            }}
            placeholder={`// Write your ${config.name} code here...`}
          />
        </div>
      </div>

      {/* Editor Bottom Status Bar */}
      <div
        id="editor-status-bar"
        className={`flex items-center justify-between px-4 py-1.5 border-t text-[11px] font-mono select-none shrink-0 ${
          isDark ? 'bg-[#1E293B] border-[#334155] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}
      >
        <div className="flex items-center gap-4">
          <span>
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">{lines.length} lines</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">{code.length} chars</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden md:inline">Spaces: 4</span>
          <span>UTF-8</span>
          <span
            className={`font-semibold uppercase px-1.5 py-0.5 rounded text-[10px] ${
              isDark ? 'bg-[#0F172A] border border-[#334155] text-sky-400' : 'bg-slate-200 text-blue-700'
            }`}
          >
            {config.name}
          </span>
        </div>
      </div>
    </div>
  );
};
