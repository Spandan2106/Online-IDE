# 💻 Online IDE

A feature-rich, browser-based integrated development environment (IDE) built for writing, compiling, and executing code across multiple programming languages directly in the web browser.

---

## 🚀 Features

- **Multi-Language Support**: Write and run code in popular languages (JavaScript, TypeScript, Python, C++, Java, etc.).
- **Live Code Execution**: Fast and secure server-side execution environment powered by [Bun](https://bun.sh/).
- **Modern UI/UX**: Clean, responsive, and intuitive interface powered by Vite and React/TypeScript.
- **Environment Management**: Easy configuration management with environment variable support.
- **Firebase Integration**: Built-in backend support for user authentication and workspace persistence.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, TypeScript, [Vite](https://vitejs.dev/)
- **Backend / Runtime**: [Bun](https://bun.sh/), Node.js (`server.ts`)
- **Database / Auth**: Firebase (`firebase-applet-config.json`)

---

## 📂 Project Structure

```text
├── assets/                  # Static assets and media
├── src/                     # Source code (Components, Pages, Hooks)
├── .env.example             # Template for environment variables
├── firebase-applet-config.json # Firebase configuration setup
├── index.html               # Entry point HTML
├── server.ts                # Backend server entry point
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite build tool setup
