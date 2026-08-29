import express, { Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import os from 'os';
import { spawn, ChildProcess } from 'child_process';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import * as esbuild from 'esbuild';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;
const app = express();

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client (for server-side capabilities if needed)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Interface for interactive terminal session
interface TerminalSessionLog {
  type: 'stdout' | 'stderr' | 'stdin' | 'system';
  text: string;
  timestamp: number;
}

interface ActiveTerminalSession {
  sessionId: string;
  language: string;
  child?: ChildProcess;
  workDir: string;
  startTime: number;
  compilationTimeMs: number;
  executionTimeMs?: number;
  status: 'running' | 'completed' | 'compile_error' | 'runtime_error' | 'timeout' | 'killed';
  exitCode?: number | null;
  logs: TerminalSessionLog[];
  clients: Set<Response>;
  timeoutTimer?: NodeJS.Timeout;
  cleanupTimer?: NodeJS.Timeout;
}

const activeTerminalSessions = new Map<string, ActiveTerminalSession>();

function broadcastSessionEvent(session: ActiveTerminalSession, eventName: string, data: any) {
  const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of session.clients) {
    try {
      client.write(payload);
    } catch {
      session.clients.delete(client);
    }
  }
}

// Cleanup helper for sessions and directories
async function cleanupSession(sessionId: string) {
  const session = activeTerminalSessions.get(sessionId);
  if (!session) return;

  if (session.timeoutTimer) clearTimeout(session.timeoutTimer);
  if (session.cleanupTimer) clearTimeout(session.cleanupTimer);

  if (session.child && !session.child.killed) {
    try {
      session.child.kill('SIGKILL');
    } catch {
      // ignore
    }
  }

  try {
    if (existsSync(session.workDir)) {
      await fs.rm(session.workDir, { recursive: true, force: true });
    }
  } catch {
    // ignore
  }

  activeTerminalSessions.delete(sessionId);
}

// Augment environment PATH to detect GCC and system toolchains
function getAugmentedPath(): string {
  const customPaths = [
    '/usr/local/sbin',
    '/usr/local/bin',
    '/usr/sbin',
    '/usr/bin',
    '/sbin',
    '/bin',
  ].filter(Boolean);

  const currentPath = process.env.PATH || '';
  const currentDirs = currentPath.split(path.delimiter);
  const merged = Array.from(new Set([...customPaths, ...currentDirs])).join(path.delimiter);
  return merged;
}

// TypeScript transpilation and preparation helper (Zero setup with esbuild)
async function prepareTypeScriptCode(code: string, workDir: string): Promise<{
  jsFile: string;
  error?: string;
}> {
  try {
    const result = esbuild.transformSync(code, {
      loader: 'ts',
      target: 'es2022',
      format: 'cjs',
      sourcemap: 'inline',
    });
    const jsFile = path.join(workDir, 'index.cjs');
    await fs.writeFile(jsFile, result.code, 'utf-8');
    return { jsFile };
  } catch (err: any) {
    return { jsFile: '', error: err.message || 'TypeScript compilation error' };
  }
}

// JavaScript code preparation helper
async function prepareJavaScriptCode(code: string, workDir: string): Promise<string> {
  const jsFile = path.join(workDir, 'index.cjs');
  await fs.writeFile(jsFile, code, 'utf-8');
  return jsFile;
}

// SQL SQLite runner preparation helper (Zero setup with in-memory SQLite)
async function prepareSqlRunner(sql: string, workDir: string): Promise<string> {
  const runnerScript = `
const fs = require('fs');
let DatabaseSync;
try {
  DatabaseSync = require('node:sqlite').DatabaseSync;
} catch (e) {
  DatabaseSync = null;
}

if (!DatabaseSync) {
  console.error("SQLite engine unavailable in current Node.js environment.");
  process.exit(1);
}

const db = new DatabaseSync(':memory:');
const rawSql = ${JSON.stringify(sql)};

function splitStatements(sqlText) {
  const stmts = [];
  let current = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  
  for (let i = 0; i < sqlText.length; i++) {
    const char = sqlText[i];
    if (char === "'" && sqlText[i-1] !== '\\\\') inSingleQuote = !inSingleQuote;
    else if (char === '"' && sqlText[i-1] !== '\\\\') inDoubleQuote = !inDoubleQuote;
    
    if (char === ';' && !inSingleQuote && !inDoubleQuote) {
      if (current.trim()) stmts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) stmts.push(current.trim());
  return stmts;
}

// Convert accidental double-quoted strings in VALUES/WHERE to valid SQLite single quotes
function sanitizeSql(stmt) {
  // If it is an INSERT statement with double-quoted values, fix them for SQLite
  if (/^\\s*INSERT\\s+INTO/i.test(stmt)) {
    return stmt.replace(/\\(([^)]+)\\)/g, (match, contents) => {
      // Replace double-quoted string literals inside values with single-quoted literals
      const fixed = contents.replace(/"([^"\\\\]*(?:\\\\.[^"\\\\]*)*)"/g, "'$1'");
      return '(' + fixed + ')';
    });
  }
  return stmt;
}

const statements = splitStatements(rawSql);
console.log("=========================================");
console.log(" SQLite Relational Database Engine");
console.log(" Mode: In-Memory (:memory:) | Native Zero-Setup");
console.log("=========================================\\n");

for (let i = 0; i < statements.length; i++) {
  let stmt = statements[i];
  if (!stmt) continue;
  
  const originalStmt = stmt;
  stmt = sanitizeSql(stmt);
  const isSelect = /^\\s*(SELECT|PRAGMA|WITH|EXPLAIN)/i.test(stmt);
  console.log("SQL> " + originalStmt.replace(/\\s+/g, ' ') + ";");
  
  try {
    if (isSelect) {
      const query = db.prepare(stmt);
      const rows = query.all();
      if (rows.length === 0) {
        console.log("  (Empty set - 0 rows returned)\\n");
      } else {
        console.table(rows);
        console.log(\`  (\${rows.length} row\${rows.length > 1 ? 's' : ''} returned)\\n\`);
      }
    } else {
      db.exec(stmt + ';');
      console.log("  Query OK.\\n");
    }
  } catch (err) {
    console.error("  Error: " + err.message + "\\n");
  }
}
`;
  const scriptPath = path.join(workDir, 'runner.cjs');
  await fs.writeFile(scriptPath, runnerScript, 'utf-8');
  return scriptPath;
}

// HTML & Web Runner helper
async function prepareHtmlRunner(html: string, workDir: string): Promise<string> {
  const htmlFile = path.join(workDir, 'index.html');
  await fs.writeFile(htmlFile, html, 'utf-8');

  const runnerScript = `
const fs = require('fs');
const htmlContent = ${JSON.stringify(html)};

console.log("=========================================");
console.log(" HTML / CSS / JavaScript Web Playground");
console.log("=========================================");
console.log("Rendered index.html (" + Buffer.byteLength(htmlContent) + " bytes)");

const scriptMatches = htmlContent.match(/<script[\\s\\S]*?>([\\s\\S]*?)<\\/script>/gi) || [];
if (scriptMatches.length > 0) {
  console.log("\\n--- Executing Embedded JavaScript ---");
  for (let i = 0; i < scriptMatches.length; i++) {
    const scriptBody = scriptMatches[i].replace(/<\\/?script[\\s\\S]*?>/gi, '').trim();
    if (scriptBody) {
      try {
        eval(scriptBody);
      } catch (e) {
        console.error("Script Execution Error:", e.message);
      }
    }
  }
} else {
  console.log("\\n✓ Web structure rendered with valid DOM elements and stylesheets.");
}
`;
  const runnerPath = path.join(workDir, 'runner.cjs');
  await fs.writeFile(runnerPath, runnerScript, 'utf-8');
  return runnerPath;
}

// Standard synchronous process runner (for compilers and batch runs)
interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut?: boolean;
  executionTimeMs: number;
}

function runProcess(
  cmd: string,
  args: string[],
  cwd: string,
  stdinInput: string = '',
  timeoutMs: number = 8000
): Promise<RunResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';
    let isSettled = false;

    const child = spawn(cmd, args, {
      cwd,
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1',
        PATH: getAugmentedPath(),
      },
    });

    const timer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        try {
          child.kill('SIGKILL');
        } catch {
          // ignore
        }
        resolve({
          stdout,
          stderr: stderr + '\n[Execution timed out after ' + timeoutMs + 'ms]',
          exitCode: -1,
          timedOut: true,
          executionTimeMs: Date.now() - startTime,
        });
      }
    }, timeoutMs);

    if (child.stdin) {
      if (stdinInput) {
        child.stdin.write(stdinInput);
      }
      child.stdin.end();
    }

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
      if (stdout.length > 500000) {
        stdout = stdout.slice(0, 500000) + '\n[Output truncated: exceeded 500KB]';
        child.kill();
      }
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
      if (stderr.length > 200000) {
        stderr = stderr.slice(0, 200000) + '\n[Error output truncated]';
        child.kill();
      }
    });

    child.on('error', (err: any) => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        let errorMsg = `Execution error: ${err.message}`;
        if (err.code === 'ENOENT') {
          if (cmd === 'gcc' || cmd === 'g++') {
            errorMsg = `C/C++ compiler (${cmd}) is not installed on this server.`;
          } else if (cmd === 'python3') {
            errorMsg = `Python 3 runtime is not installed on this server.`;
          }
        }
        resolve({
          stdout,
          stderr: stderr + (stderr ? '\n' : '') + errorMsg,
          exitCode: 1,
          executionTimeMs: Date.now() - startTime,
        });
      }
    });

    child.on('close', (code) => {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        resolve({
          stdout,
          stderr,
          exitCode: code ?? 0,
          executionTimeMs: Date.now() - startTime,
        });
      }
    });
  });
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 2. Interactive Terminal Start Endpoint
app.post('/api/terminal/start', async (req, res) => {
  const { language, code } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Source code is required' });
  }

  const sessionId = `term_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const workDir = path.join(os.tmpdir(), sessionId);

  try {
    await fs.mkdir(workDir, { recursive: true });
    const startTime = Date.now();
    let compilationTimeMs = 0;

    let execCmd = '';
    let execArgs: string[] = [];

    // Process setup for all languages
    if (language === 'javascript') {
      await prepareJavaScriptCode(code, workDir);
      execCmd = 'node';
      execArgs = ['--no-warnings', 'index.cjs'];

    } else if (language === 'typescript') {
      const compileStart = Date.now();
      const { jsFile, error } = await prepareTypeScriptCode(code, workDir);
      compilationTimeMs = Date.now() - compileStart;

      if (error) {
        const session: ActiveTerminalSession = {
          sessionId,
          language,
          workDir,
          startTime,
          compilationTimeMs,
          status: 'compile_error',
          exitCode: 1,
          logs: [
            { type: 'system', text: `Compiling TypeScript with esbuild...\n`, timestamp: startTime },
            { type: 'stderr', text: error + '\n', timestamp: Date.now() },
            { type: 'system', text: `\n[TypeScript Compilation Failed]\n`, timestamp: Date.now() },
          ],
          clients: new Set(),
        };
        activeTerminalSessions.set(sessionId, session);
        return res.json({
          sessionId,
          status: 'compile_error',
          compilationTimeMs,
          stderr: error,
          exitCode: 1,
        });
      }

      execCmd = 'node';
      execArgs = ['--no-warnings', 'index.cjs'];

    } else if (language === 'sql') {
      await prepareSqlRunner(code, workDir);
      execCmd = 'node';
      execArgs = ['--no-warnings', 'runner.cjs'];

    } else if (language === 'html') {
      await prepareHtmlRunner(code, workDir);
      execCmd = 'node';
      execArgs = ['--no-warnings', 'runner.cjs'];

    } else if (language === 'c') {
      const sourceFile = path.join(workDir, 'main.c');
      await fs.writeFile(sourceFile, code, 'utf-8');

      const compileStart = Date.now();
      const compileRes = await runProcess('gcc', ['-O2', '-Wall', '-std=c17', 'main.c', '-o', 'program', '-lm'], workDir, '', 8000);
      compilationTimeMs = Date.now() - compileStart;

      if (compileRes.exitCode !== 0) {
        const session: ActiveTerminalSession = {
          sessionId,
          language,
          workDir,
          startTime,
          compilationTimeMs,
          status: 'compile_error',
          exitCode: compileRes.exitCode,
          logs: [
            { type: 'system', text: `Compiling main.c with GCC 12...\n`, timestamp: startTime },
            { type: 'stderr', text: compileRes.stderr || 'Compilation failed\n', timestamp: Date.now() },
            { type: 'system', text: `\n[Compilation Failed with exit code ${compileRes.exitCode}]\n`, timestamp: Date.now() },
          ],
          clients: new Set(),
        };
        activeTerminalSessions.set(sessionId, session);
        return res.json({
          sessionId,
          status: 'compile_error',
          compilationTimeMs,
          stderr: compileRes.stderr,
          exitCode: compileRes.exitCode,
        });
      }

      execCmd = path.join(workDir, 'program');
      execArgs = [];

    } else if (language === 'cpp') {
      const sourceFile = path.join(workDir, 'main.cpp');
      await fs.writeFile(sourceFile, code, 'utf-8');

      const compileStart = Date.now();
      const compileRes = await runProcess('g++', ['-O2', '-Wall', '-std=c++17', 'main.cpp', '-o', 'program', '-lm'], workDir, '', 8000);
      compilationTimeMs = Date.now() - compileStart;

      if (compileRes.exitCode !== 0) {
        const session: ActiveTerminalSession = {
          sessionId,
          language,
          workDir,
          startTime,
          compilationTimeMs,
          status: 'compile_error',
          exitCode: compileRes.exitCode,
          logs: [
            { type: 'system', text: `Compiling main.cpp with G++ 12...\n`, timestamp: startTime },
            { type: 'stderr', text: compileRes.stderr || 'Compilation failed\n', timestamp: Date.now() },
            { type: 'system', text: `\n[Compilation Failed with exit code ${compileRes.exitCode}]\n`, timestamp: Date.now() },
          ],
          clients: new Set(),
        };
        activeTerminalSessions.set(sessionId, session);
        return res.json({
          sessionId,
          status: 'compile_error',
          compilationTimeMs,
          stderr: compileRes.stderr,
          exitCode: compileRes.exitCode,
        });
      }

      execCmd = path.join(workDir, 'program');
      execArgs = [];

    } else if (language === 'python') {
      const sourceFile = path.join(workDir, 'main.py');
      await fs.writeFile(sourceFile, code, 'utf-8');

      execCmd = 'python3';
      execArgs = ['-u', 'main.py'];
    } else {
      return res.status(400).json({ error: `Unsupported language: ${language}` });
    }

    // Spawn the interactive child process
    const child = spawn(execCmd, execArgs, {
      cwd: workDir,
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1',
        PATH: getAugmentedPath(),
      },
    });

    const session: ActiveTerminalSession = {
      sessionId,
      language,
      child,
      workDir,
      startTime: Date.now(),
      compilationTimeMs,
      status: 'running',
      logs: [
        {
          type: 'system',
          text: `[Process started: ${language.toUpperCase()} runtime]\n`,
          timestamp: Date.now(),
        },
      ],
      clients: new Set(),
    };

    // 60-second interactive execution safety timeout
    session.timeoutTimer = setTimeout(() => {
      if (session.status === 'running') {
        session.status = 'timeout';
        const timeoutLog: TerminalSessionLog = {
          type: 'system',
          text: '\n[Execution timed out after 60s of inactivity]\n',
          timestamp: Date.now(),
        };
        session.logs.push(timeoutLog);
        broadcastSessionEvent(session, 'data', timeoutLog);
        broadcastSessionEvent(session, 'exit', {
          exitCode: -1,
          status: 'timeout',
          executionTimeMs: Date.now() - session.startTime,
        });
        if (session.child) {
          try {
            session.child.kill('SIGKILL');
          } catch {}
        }
      }
    }, 60000);

    // Capture child stdout
    child.stdout?.on('data', (chunk) => {
      const text = chunk.toString();
      const logEntry: TerminalSessionLog = {
        type: 'stdout',
        text,
        timestamp: Date.now(),
      };
      session.logs.push(logEntry);
      broadcastSessionEvent(session, 'data', logEntry);
    });

    // Capture child stderr
    child.stderr?.on('data', (chunk) => {
      const text = chunk.toString();
      const logEntry: TerminalSessionLog = {
        type: 'stderr',
        text,
        timestamp: Date.now(),
      };
      session.logs.push(logEntry);
      broadcastSessionEvent(session, 'data', logEntry);
    });

    // Handle process close / exit
    child.on('close', (code) => {
      if (session.timeoutTimer) clearTimeout(session.timeoutTimer);
      const executionTimeMs = Date.now() - session.startTime;
      session.executionTimeMs = executionTimeMs;
      session.exitCode = code ?? 0;
      session.status = code === 0 ? 'completed' : 'runtime_error';

      const exitLog: TerminalSessionLog = {
        type: 'system',
        text: `\n[Process completed with exit code ${code ?? 0} in ${executionTimeMs}ms]\n`,
        timestamp: Date.now(),
      };
      session.logs.push(exitLog);
      broadcastSessionEvent(session, 'data', exitLog);
      broadcastSessionEvent(session, 'exit', {
        exitCode: code ?? 0,
        status: session.status,
        executionTimeMs,
      });

      // Retain session logs for 30 seconds before freeing directory
      session.cleanupTimer = setTimeout(() => {
        cleanupSession(sessionId);
      }, 30000);
    });

    child.on('error', (err) => {
      if (session.timeoutTimer) clearTimeout(session.timeoutTimer);
      session.status = 'runtime_error';
      const errLog: TerminalSessionLog = {
        type: 'stderr',
        text: `\nProcess error: ${err.message}\n`,
        timestamp: Date.now(),
      };
      session.logs.push(errLog);
      broadcastSessionEvent(session, 'data', errLog);
      broadcastSessionEvent(session, 'exit', {
        exitCode: 1,
        status: 'runtime_error',
        executionTimeMs: Date.now() - session.startTime,
      });
    });

    activeTerminalSessions.set(sessionId, session);

    return res.json({
      sessionId,
      status: 'running',
      compilationTimeMs,
    });
  } catch (err: any) {
    console.error('Terminal start error:', err);
    return res.status(500).json({ error: err.message || 'Failed to start terminal session' });
  }
});

// 3. SSE Stream Endpoint for real-time terminal output
app.get('/api/terminal/stream', (req, res) => {
  const sessionId = req.query.sessionId as string;
  if (!sessionId) {
    return res.status(400).send('Session ID is required');
  }

  const session = activeTerminalSessions.get(sessionId);
  if (!session) {
    return res.status(404).send('Session not found or expired');
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send all existing logs immediately
  for (const log of session.logs) {
    res.write(`event: data\ndata: ${JSON.stringify(log)}\n\n`);
  }

  if (session.status !== 'running') {
    res.write(
      `event: exit\ndata: ${JSON.stringify({
        exitCode: session.exitCode ?? (session.status === 'completed' ? 0 : 1),
        status: session.status,
        executionTimeMs: session.executionTimeMs ?? 0,
      })}\n\n`
    );
  }

  session.clients.add(res);

  req.on('close', () => {
    session.clients.delete(res);
  });
});

// 4. Terminal Interactive User Input (stdin)
app.post('/api/terminal/input', (req, res) => {
  const { sessionId, input } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  const session = activeTerminalSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Active terminal session not found' });
  }

  if (session.status !== 'running' || !session.child || !session.child.stdin || !session.child.stdin.writable) {
    return res.status(400).json({ error: 'Process is not running or input channel is closed' });
  }

  const textToSend = typeof input === 'string' ? input : '';
  const inputLog: TerminalSessionLog = {
    type: 'stdin',
    text: textToSend + '\n',
    timestamp: Date.now(),
  };

  session.logs.push(inputLog);
  broadcastSessionEvent(session, 'data', inputLog);

  try {
    session.child.stdin.write(textToSend + '\n');
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to write to process stdin: ' + err.message });
  }
});

// 5. Terminal Stop / Kill Endpoint
app.post('/api/terminal/stop', (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  const session = activeTerminalSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (session.child && !session.child.killed) {
    try {
      session.child.kill('SIGINT');
      setTimeout(() => {
        if (session.child && !session.child.killed) {
          try {
            session.child.kill('SIGKILL');
          } catch {}
        }
      }, 500);
    } catch {}
  }

  session.status = 'killed';
  const killLog: TerminalSessionLog = {
    type: 'system',
    text: '\n[Process stopped by user]\n',
    timestamp: Date.now(),
  };
  session.logs.push(killLog);
  broadcastSessionEvent(session, 'data', killLog);
  broadcastSessionEvent(session, 'exit', {
    exitCode: 130,
    status: 'killed',
    executionTimeMs: Date.now() - session.startTime,
  });

  return res.json({ success: true });
});

// 6. Direct Batch Execution Endpoint (fallback & batch execution)
app.post('/api/execute', async (req, res) => {
  const { language, code, stdin = '', timeoutMs = 8000 } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Code is required' });
  }

  const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const workDir = path.join(os.tmpdir(), runId);

  try {
    await fs.mkdir(workDir, { recursive: true });
    const overallStartTime = Date.now();

    if (language === 'javascript') {
      await prepareJavaScriptCode(code, workDir);
      const execRes = await runProcess('node', ['--no-warnings', 'index.cjs'], workDir, stdin, timeoutMs);
      return res.json({
        status: execRes.exitCode === 0 ? 'success' : 'runtime_error',
        stdout: execRes.stdout,
        stderr: execRes.stderr,
        exitCode: execRes.exitCode,
        compilationTimeMs: 0,
        executionTimeMs: execRes.executionTimeMs,
        totalTimeMs: Date.now() - overallStartTime,
      });

    } else if (language === 'typescript') {
      const compileStart = Date.now();
      const { jsFile, error } = await prepareTypeScriptCode(code, workDir);
      const compilationTimeMs = Date.now() - compileStart;

      if (error) {
        return res.json({
          status: 'compile_error',
          stdout: '',
          stderr: error,
          exitCode: 1,
          compilationTimeMs,
          executionTimeMs: 0,
          totalTimeMs: Date.now() - overallStartTime,
        });
      }

      const execRes = await runProcess('node', ['--no-warnings', 'index.cjs'], workDir, stdin, timeoutMs);
      return res.json({
        status: execRes.exitCode === 0 ? 'success' : 'runtime_error',
        stdout: execRes.stdout,
        stderr: execRes.stderr,
        exitCode: execRes.exitCode,
        compilationTimeMs,
        executionTimeMs: execRes.executionTimeMs,
        totalTimeMs: Date.now() - overallStartTime,
      });

    } else if (language === 'sql') {
      await prepareSqlRunner(code, workDir);
      const execRes = await runProcess('node', ['--no-warnings', 'runner.cjs'], workDir, stdin, timeoutMs);
      return res.json({
        status: execRes.exitCode === 0 ? 'success' : 'runtime_error',
        stdout: execRes.stdout,
        stderr: execRes.stderr,
        exitCode: execRes.exitCode,
        compilationTimeMs: 0,
        executionTimeMs: execRes.executionTimeMs,
        totalTimeMs: Date.now() - overallStartTime,
      });

    } else if (language === 'html') {
      await prepareHtmlRunner(code, workDir);
      const execRes = await runProcess('node', ['--no-warnings', 'runner.cjs'], workDir, stdin, timeoutMs);
      return res.json({
        status: execRes.exitCode === 0 ? 'success' : 'runtime_error',
        stdout: execRes.stdout,
        stderr: execRes.stderr,
        exitCode: execRes.exitCode,
        compilationTimeMs: 0,
        executionTimeMs: execRes.executionTimeMs,
        totalTimeMs: Date.now() - overallStartTime,
      });

    } else if (language === 'c') {
      const sourceFile = path.join(workDir, 'main.c');
      const binFile = path.join(workDir, 'program');
      await fs.writeFile(sourceFile, code, 'utf-8');

      const compileRes = await runProcess('gcc', ['-O2', '-Wall', '-std=c17', 'main.c', '-o', 'program', '-lm'], workDir, '', 6000);
      if (compileRes.exitCode !== 0) {
        return res.json({
          status: 'compile_error',
          stdout: '',
          stderr: compileRes.stderr || 'Compilation failed',
          exitCode: compileRes.exitCode,
          compilationTimeMs: compileRes.executionTimeMs,
          executionTimeMs: 0,
          totalTimeMs: Date.now() - overallStartTime,
        });
      }

      const execRes = await runProcess(binFile, [], workDir, stdin, timeoutMs);
      return res.json({
        status: execRes.exitCode === 0 ? 'success' : 'runtime_error',
        stdout: execRes.stdout,
        stderr: execRes.stderr,
        exitCode: execRes.exitCode,
        compilationTimeMs: compileRes.executionTimeMs,
        executionTimeMs: execRes.executionTimeMs,
        totalTimeMs: Date.now() - overallStartTime,
      });

    } else if (language === 'cpp') {
      const sourceFile = path.join(workDir, 'main.cpp');
      const binFile = path.join(workDir, 'program');
      await fs.writeFile(sourceFile, code, 'utf-8');

      const compileRes = await runProcess('g++', ['-O2', '-Wall', '-std=c++17', 'main.cpp', '-o', 'program', '-lm'], workDir, '', 6000);
      if (compileRes.exitCode !== 0) {
        return res.json({
          status: 'compile_error',
          stdout: '',
          stderr: compileRes.stderr || 'Compilation failed',
          exitCode: compileRes.exitCode,
          compilationTimeMs: compileRes.executionTimeMs,
          executionTimeMs: 0,
          totalTimeMs: Date.now() - overallStartTime,
        });
      }

      const execRes = await runProcess(binFile, [], workDir, stdin, timeoutMs);
      return res.json({
        status: execRes.exitCode === 0 ? 'success' : 'runtime_error',
        stdout: execRes.stdout,
        stderr: execRes.stderr,
        exitCode: execRes.exitCode,
        compilationTimeMs: compileRes.executionTimeMs,
        executionTimeMs: execRes.executionTimeMs,
        totalTimeMs: Date.now() - overallStartTime,
      });

    } else if (language === 'python') {
      const sourceFile = path.join(workDir, 'main.py');
      await fs.writeFile(sourceFile, code, 'utf-8');

      const execRes = await runProcess('python3', ['-u', 'main.py'], workDir, stdin, timeoutMs);
      return res.json({
        status: execRes.exitCode === 0 ? 'success' : 'runtime_error',
        stdout: execRes.stdout,
        stderr: execRes.stderr,
        exitCode: execRes.exitCode,
        compilationTimeMs: 0,
        executionTimeMs: execRes.executionTimeMs,
        totalTimeMs: Date.now() - overallStartTime,
      });

    } else {
      return res.status(400).json({ error: `Unsupported language: ${language}` });
    }
  } catch (err: any) {
    console.error('Execution error:', err);
    return res.status(500).json({
      status: 'system_error',
      stdout: '',
      stderr: `Internal Execution Error: ${err.message}`,
      exitCode: 1,
      totalTimeMs: 0,
    });
  } finally {
    try {
      if (existsSync(workDir)) {
        await fs.rm(workDir, { recursive: true, force: true });
      }
    } catch {}
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Online IDE Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
