import { UserManualTopic } from '../types';

export const USER_MANUAL_TOPICS: UserManualTopic[] = [
  {
    id: 'interactive-terminal',
    title: '1. Live Interactive Terminal & Input',
    icon: 'Terminal',
    category: 'Interactive I/O',
    content: `SyntaxHub features a real-time interactive terminal similar to modern desktop IDEs (VS Code, CLion, PyCharm). Instead of entering batch inputs upfront, you interact directly with your program while it is running:
- When you click RUN (or press Ctrl + Enter), your program starts streaming output immediately.
- If your code uses prompt statements (e.g. scanf, std::cin, Scanner, input()), the interactive prompt line at the bottom of the terminal is ready for you.
- Simply type your answer or input and press Enter to send it in real time to the running process.`,
    bulletPoints: [
      'C: Use scanf("%s", name) or scanf("%d", &n) with fflush(stdout) on prompts.',
      'C++: Use std::cin >> var or std::getline(std::cin, str) with std::flush.',
      'Java: Use java.util.Scanner scanner = new Scanner(System.in).',
      'Python: Use name = input("Enter name: ") or sys.stdin.readline().',
      'Press Enter to submit input to the active program or use history with Up/Down arrows.',
    ],
    codeSample: {
      language: 'cpp',
      code: `// Interactive C++ Example
#include <iostream>
#include <string>

int main() {
    std::string name;
    int age;
    std::cout << "Enter name: " << std::flush;
    std::cin >> name;
    std::cout << "Enter age: " << std::flush;
    std::cin >> age;
    std::cout << "Welcome, " << name << " (" << age << " yrs old)!" << std::endl;
    return 0;
}`,
    },
  },
  {
    id: 'customizable-layout',
    title: '2. Customizable Layout & Sizing',
    icon: 'Layout',
    category: 'Workspace',
    content: `You can customize and resize the workspace to suit your coding style:
- Drag the splitter divider bar left/right (or up/down) to adjust the exact width/height ratio between the Code Editor and Terminal.
- Use the Layout menu in the top bar to switch between Side-by-Side (Horizontal) and Stacked (Vertical) layouts.
- Choose from instant size presets (50/50 balanced, 70/30 code-focused, 30/70 terminal-focused).
- Maximize the Editor or Terminal into full-screen mode anytime.`,
    bulletPoints: [
      'Draggable splitter with smooth live resizing and percentage indicator.',
      'Orientation toggle: Horizontal split vs. Vertical stacked.',
      'Size presets: 50:50, 70:30, and 30:70 ratios.',
      'Fullscreen buttons on both Editor and Terminal panes.',
    ],
  },
  {
    id: 'mobile-compatibility',
    title: '3. Mobile Screening & Touch Compatibility',
    icon: 'Smartphone',
    category: 'Mobile',
    content: `SyntaxHub is tailored for mobile screens and tablets:
- On mobile devices, a segmented tab switcher lets you seamlessly navigate between the Code Editor and the Terminal.
- When you tap RUN inside the mobile editor, the app automatically switches to the Terminal tab so you see real-time output and prompts.
- The interactive input line is sized for touch keyboards with high-contrast buttons and responsive feedback.`,
    bulletPoints: [
      'Touch-friendly 44px+ targets and dedicated mobile tab bar.',
      'Auto-switch to Terminal upon executing code on mobile.',
      'Quick Send button for mobile on-screen keyboard support.',
    ],
  },
  {
    id: 'runtimes-compilers',
    title: '4. Compilers & Zero-Setup Runtimes',
    icon: 'Cpu',
    category: 'Compilers',
    content: `SyntaxHub supports 8 core languages across native zero-setup runtimes and server-side compilers:`,
    bulletPoints: [
      '⚡ JavaScript (ES2022+): Executes natively with Node.js v22 (zero setup required).',
      '⚡ TypeScript (TS 5.x): Instant transpilation via high-speed esbuild runtime (zero setup required).',
      '⚡ SQL (SQLite Relational DB): In-memory relational database engine with formatted ASCII tables (zero setup required).',
      '⚡ HTML / CSS / Web: Playground runtime with DOM parsing and embedded script execution (zero setup required).',
      'Python (Python 3.10+): Executed with unbuffered real-time interactive I/O.',
      'Java (Java 17 LTS): Compiled with javac and executed on OpenJDK 17 with dynamic class detection.',
      'C (C17): Compiled with GCC 12 (-O2 -Wall -std=c17 -lm) with full standard library.',
      'C++ (C++17): Compiled with G++ 12 (-O2 -Wall -std=c++17 -lm) with full STL container support.',
    ],
  },
  {
    id: 'pdf-export',
    title: '5. PDF Document Export',
    icon: 'FileDown',
    category: 'Export',
    content: `You can instantly download a formatted PDF report of your source code and interactive terminal transcript:
- Click the "Export PDF" button in the header or terminal toolbar.
- Customize title, assignment notes, color theme, and orientation.
- Save directly to your local device without any login or account requirement.`,
    bulletPoints: [
      'Complete transcript of interactive inputs, outputs, and compiler status.',
      'Line-numbered syntax highlighting in Light, Dark, or Monochrome styles.',
      '100% offline generation with zero sign-in required.',
    ],
  },
  {
    id: 'keyboard-shortcuts',
    title: '6. Keyboard Shortcuts',
    icon: 'Keyboard',
    category: 'Shortcuts',
    content: `Productivity shortcuts for rapid development:`,
    bulletPoints: [
      'Ctrl + Enter (Cmd + Enter): Run code in interactive terminal',
      'Ctrl + F (Cmd + F): Open Search & Replace inside the editor',
      'Enter (in terminal): Send input line to running program',
      'Up / Down Arrows (in terminal input): Browse previously sent input history',
      'Tab / Shift + Tab: Indent / Outdent code by 4 spaces',
    ],
  },
];
