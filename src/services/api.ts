import { SupportedLanguage, ExecutionResult, TerminalLogEntry } from '../types';

export interface StartTerminalResponse {
  sessionId: string;
  status: 'running' | 'compile_error';
  compilationTimeMs?: number;
  stderr?: string;
  exitCode?: number;
}

// Start an interactive terminal execution session
export async function startTerminalSession(
  language: SupportedLanguage,
  code: string
): Promise<StartTerminalResponse> {
  const response = await fetch('/api/terminal/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language, code }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server terminal error (${response.status})`);
  }

  return response.json();
}

// Send interactive user input to the running program stdin
export async function sendTerminalInput(sessionId: string, input: string): Promise<boolean> {
  const response = await fetch('/api/terminal/input', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, input }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to send input');
  }

  const data = await response.json();
  return Boolean(data.success);
}

// Stop / Terminate running terminal session
export async function stopTerminalSession(sessionId: string): Promise<boolean> {
  const response = await fetch('/api/terminal/stop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return Boolean(data.success);
}

// Subscribe to SSE Terminal event stream
export function subscribeToTerminalStream(
  sessionId: string,
  callbacks: {
    onData: (log: TerminalLogEntry) => void;
    onExit: (exitInfo: { exitCode: number; status: string; executionTimeMs: number }) => void;
    onError: (err: any) => void;
  }
): () => void {
  const eventSource = new EventSource(`/api/terminal/stream?sessionId=${encodeURIComponent(sessionId)}`);

  eventSource.addEventListener('data', (event) => {
    try {
      const data = JSON.parse(event.data);
      callbacks.onData({
        id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: data.type || 'stdout',
        text: data.text || '',
        timestamp: new Date(data.timestamp || Date.now()).toLocaleTimeString(),
      });
    } catch (e) {
      console.warn('Failed to parse SSE data event:', e);
    }
  });

  eventSource.addEventListener('exit', (event) => {
    try {
      const data = JSON.parse(event.data);
      callbacks.onExit(data);
      eventSource.close();
    } catch (e) {
      console.warn('Failed to parse SSE exit event:', e);
    }
  });

  eventSource.onerror = (err) => {
    callbacks.onError(err);
    eventSource.close();
  };

  return () => {
    eventSource.close();
  };
}

// Legacy fallback batch execution
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
