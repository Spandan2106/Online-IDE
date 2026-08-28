import { UserManualTopic } from '../types';

export const USER_MANUAL_TOPICS: UserManualTopic[] = [
  {
    id: 'getting-started',
    title: '1. Getting Started & IDE Layout',
    icon: 'Layout',
    category: 'Overview',
    content: `The Online IDE provides a high-performance environment for coding, compiling, and running programs in C, C++, Java, and Python. The interface features a modern split-pane design optimized for productivity:
- Left Pane (Editor): Code area with line numbers, syntax styling, search/replace, font zooming, and a custom Standard Input (stdin) panel.
- Right Pane (Output & Tools): Terminal output, compiler diagnostics, and Google Docs export.
- Top Bar: Instant language selector, code reset, Run button, theme toggle, and Google authentication.`,
    bulletPoints: [
      'Select any of the 4 languages (C, C++, Java, Python) from the top bar.',
      'Load pre-built starter templates for algorithms, data structures, and interactive I/O.',
      'Switch between Dark Theme and Bright Theme anytime using the theme button.',
    ],
  },
  {
    id: 'language-specifications',
    title: '2. Language Runtimes & Compilers',
    icon: 'Cpu',
    category: 'Compilers',
    content: `Each language is configured with modern toolchains and optimized compilation flags:`,
    bulletPoints: [
      'C (C17): Compiled with GCC 12 (-O2 -Wall -std=c17 -lm) with math library support.',
      'C++ (C++17): Compiled with G++ 12 (-O2 -Wall -std=c++17 -lm) with full STL support.',
      'Java (Java 17 LTS): Requires class with main method (e.g., public class Main { public static void main(String[] args) }).',
      'Python (Python 3.10): Executed in unbuffered mode (-u) with full standard library support.',
    ],
  },
  {
    id: 'stdin-input',
    title: '3. Standard Input (stdin) Guide',
    icon: 'FileInput',
    category: 'Input/Output',
    content: `Many programs (competitive programming, user queries, calculators) require user input during execution. Since code runs on the server, you provide your input in advance inside the "Custom Input (stdin)" tab before clicking Run.`,
    bulletPoints: [
      'C: Read tokens with scanf("%s", str) or scanf("%d", &num).',
      'C++: Read with std::cin >> var or std::getline(std::cin, str).',
      'Java: Use java.util.Scanner scanner = new Scanner(System.in);',
      'Python: Read with input() or sys.stdin.read().splitlines().',
    ],
    codeSample: {
      language: 'cpp',
      code: `// C++ Stdin Example
#include <iostream>
int main() {
    int a, b;
    if (std::cin >> a >> b) {
        std::cout << "Sum: " << (a + b) << std::endl;
    }
    return 0;
}`,
    },
  },
  {
    id: 'google-docs-export',
    title: '4. Google Docs Integration & Export',
    icon: 'FileText',
    category: 'Workspace',
    content: `You can convert and export your entire workspace (source code, runtime parameters, standard input, compiler output, and timestamp) directly into a formatted Google Document:
1. Click the "Export to Google Docs" button in the top bar or output console.
2. Sign in with your Google account using the official Google Sign-In prompt.
3. Review the custom document title and click "Export to Google Docs".
4. The system creates the Google Doc in your Google Drive and gives you a direct link to open and edit it in Google Docs.`,
    bulletPoints: [
      'Formatted with styled headers, monospace code blocks, and execution statistics.',
      'OAuth tokens are kept securely in-memory and are never stored in localStorage.',
      'Keeps a history of recently exported documents for quick reopening.',
    ],
  },
  {
    id: 'keyboard-shortcuts',
    title: '5. Keyboard Shortcuts',
    icon: 'Keyboard',
    category: 'Shortcuts',
    content: `Boost your development speed with essential keyboard shortcuts:`,
    bulletPoints: [
      'Ctrl + Enter (Cmd + Enter): Run & Compile current code',
      'Ctrl + S (Cmd + S): Open Google Docs Export dialog',
      'Ctrl + F (Cmd + F): Open Search & Replace bar inside the editor',
      'Tab: Insert 4-space indentation without losing focus',
      'Shift + Tab: Outdent current line',
      'Ctrl + Shift + R: Reset editor to default language template',
    ],
  },
];
