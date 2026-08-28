import { SupportedLanguage, ExecutionResult } from '../types';

export async function executeCode(
  language: SupportedLanguage,
  code: string,
  stdin: string = ''
): Promise<ExecutionResult> {
  const response = await fetch('/api/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language, code, stdin }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server execution error (${response.status})`);
  }

  const data = await response.json();
  return {
    status: data.status || (data.exitCode === 0 ? 'success' : 'runtime_error'),
    stdout: data.stdout || '',
    stderr: data.stderr || '',
    exitCode: data.exitCode ?? (data.status === 'success' ? 0 : 1),
    compilationTimeMs: data.compilationTimeMs,
    executionTimeMs: data.executionTimeMs,
    totalTimeMs: data.totalTimeMs,
    timestamp: new Date().toLocaleTimeString(),
  };
}

export async function exportToGoogleDocs(params: {
  accessToken: string;
  title: string;
  language: SupportedLanguage;
  code: string;
  stdin?: string;
  output?: string;
  stderr?: string;
  executionTimeMs?: number;
}): Promise<{ documentId: string; documentUrl: string; title: string }> {
  const response = await fetch('/api/docs/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Google Docs export failed (${response.status})`);
  }

  return response.json();
}
