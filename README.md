# 💻 Online Code IDE

A feature-rich, browser-based integrated development environment (IDE) built for writing, compiling, and executing code across multiple programming languages (C, C++, Java, Python) directly in the web browser with real-time terminal output, interactive stdin streaming, and PDF export.

---

## 🚀 Features

- **Multi-Language Support**: Write and run code in C (GCC 12), C++ (G++ 12), Java (OpenJDK 17), and Python 3.
- **Live Terminal & Interactive Execution**: Real-time server-sent event (SSE) terminal streaming with dynamic user stdin input.
- **Responsive Workspace**: Split-pane code editor and console with customizable font size, full-screen mode, and layout orientation toggle.
- **PDF Report Generation**: Instant export of code, execution results, and compilation logs to downloadable PDF reports.
- **Preloaded Code Templates**: Ready-to-run starter templates and algorithms for each language.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, jsPDF
- **Backend**: Express, Node.js (`server.ts`), Child Processes
- **Compilers / Runtimes**: OpenJDK 17 (`javac`/`java`), GCC/G++ (`gcc`/`g++`), Python 3

---

## 📂 Project Structure

```text
├── Dockerfile               # Multi-language container for Render / Docker
├── render.yaml              # Render Blueprint deployment configuration
├── server.ts                # Express backend & compiler execution runner
├── src/                     # React frontend source code
│   ├── components/          # UI Components (CodeEditor, OutputConsole, Header, etc.)
│   ├── data/                # Starter templates and language configurations
│   ├── utils/               # PDF export & code helpers
│   └── App.tsx              # Main IDE container
├── index.html               # Entry point HTML
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite build tool setup
```

---

## 🌐 Deploying to Render

This IDE requires system compilers (`openjdk-17-jdk`, `gcc`, `g++`, `python3`) to compile and execute user code in the cloud.

### Recommended: Deploy with Docker on Render
1. In your **Render Dashboard**, click **New +** > **Web Service**.
2. Connect your Git repository.
3. Choose **Docker** as the Runtime (Render will automatically detect the included `Dockerfile` and `render.yaml`).
4. Set the Health Check Path to `/api/health`.
5. Click **Create Web Service**.

> **Why Docker on Render?**
> Standard Node.js environments on Render do not have the Java JDK or GCC installed. The provided `Dockerfile` packages `openjdk-17-jdk-headless`, `gcc`, `g++`, and `python3`, ensuring Java, C, C++, and Python all execute without missing compiler errors.
