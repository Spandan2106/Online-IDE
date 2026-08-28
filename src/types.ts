export type SupportedLanguage = 'c' | 'cpp' | 'java' | 'python';

export interface LanguageConfig {
  id: SupportedLanguage;
  name: string;
  extension: string;
  defaultFilename: string;
  compiler: string;
  version: string;
  iconName: string;
  syntaxColor: string;
  accentColor: string;
  description: string;
}

export type ThemeMode = 'dark' | 'bright';

export interface CodeTemplate {
  id: string;
  title: string;
  category: 'Basics' | 'Input/Output' | 'Algorithms' | 'Data Structures' | 'OOP';
  description: string;
  code: string;
  stdin?: string;
  sampleStdin?: string;
}

export interface ExecutionResult {
  status: 'idle' | 'running' | 'success' | 'compile_error' | 'runtime_error' | 'system_error';
  stdout: string;
  stderr: string;
  exitCode?: number | null;
  compilationTimeMs?: number;
  executionTimeMs?: number;
  totalTimeMs?: number;
  timestamp?: string;
}

export interface ExportedDocRecord {
  id: string;
  title: string;
  documentId: string;
  documentUrl: string;
  language: SupportedLanguage;
  timestamp: string;
}

export interface UserManualTopic {
  id: string;
  title: string;
  icon: string;
  category: string;
  content: string;
  bulletPoints?: string[];
  codeSample?: {
    language: string;
    code: string;
  };
}

export type ManualSection = UserManualTopic;
