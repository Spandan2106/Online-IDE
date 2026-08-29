import { SupportedLanguage, CodeTemplate, LanguageConfig } from '../types';

export const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  c: {
    id: 'c',
    name: 'C',
    extension: '.c',
    defaultFilename: 'main.c',
    compiler: 'GCC 12 (C17 standard)',
    version: 'C17',
    iconName: 'Code2',
    syntaxColor: '#00599C',
    accentColor: 'from-blue-600 to-indigo-600',
    description: 'High-performance, procedural systems programming language with GCC 12.',
    isZeroSetup: false,
    category: 'compiled',
  },
  cpp: {
    id: 'cpp',
    name: 'C++',
    extension: '.cpp',
    defaultFilename: 'main.cpp',
    compiler: 'G++ 12 (C++17 standard)',
    version: 'C++17',
    iconName: 'Cpu',
    syntaxColor: '#004482',
    accentColor: 'from-sky-500 to-blue-700',
    description: 'Powerful object-oriented and generic systems programming language with G++ 12.',
    isZeroSetup: false,
    category: 'compiled',
  },
  java: {
    id: 'java',
    name: 'Java',
    extension: '.java',
    defaultFilename: 'Main.java',
    compiler: 'OpenJDK 17 (javac & java)',
    version: 'Java 17 LTS',
    iconName: 'Coffee',
    syntaxColor: '#EA2D2E',
    accentColor: 'from-amber-600 to-red-600',
    description: 'Robust, platform-independent, object-oriented language with OpenJDK 17.',
    isZeroSetup: false,
    category: 'compiled',
  },
  python: {
    id: 'python',
    name: 'Python',
    extension: '.py',
    defaultFilename: 'main.py',
    compiler: 'Python 3',
    version: 'Python 3.10+',
    iconName: 'FileCode2',
    syntaxColor: '#3776AB',
    accentColor: 'from-emerald-500 to-teal-700',
    description: 'High-level, expressive, dynamically-typed multi-paradigm language.',
    isZeroSetup: true,
    category: 'native',
  },
  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    extension: '.js',
    defaultFilename: 'index.js',
    compiler: 'Node.js V8 Engine',
    version: 'Node.js 22 LTS',
    iconName: 'FileCode',
    syntaxColor: '#F7DF1E',
    accentColor: 'from-amber-400 to-yellow-600',
    description: 'Universal, asynchronous scripting language with instant native execution.',
    isZeroSetup: true,
    category: 'native',
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    extension: '.ts',
    defaultFilename: 'index.ts',
    compiler: 'TypeScript 5.8 / Node.js',
    version: 'TS 5.8 (ES2024)',
    iconName: 'Code',
    syntaxColor: '#3178C6',
    accentColor: 'from-blue-500 to-sky-600',
    description: 'Type-safe JavaScript superset with instant compilation and zero setup.',
    isZeroSetup: true,
    category: 'native',
  },
  sql: {
    id: 'sql',
    name: 'SQL',
    extension: '.sql',
    defaultFilename: 'query.sql',
    compiler: 'SQLite Relational Engine',
    version: 'SQLite 3.45',
    iconName: 'Database',
    syntaxColor: '#00BC7D',
    accentColor: 'from-teal-500 to-emerald-700',
    description: 'Relational database query language with formatted ASCII result tables.',
    isZeroSetup: true,
    category: 'native',
  },
  html: {
    id: 'html',
    name: 'HTML/CSS/JS',
    extension: '.html',
    defaultFilename: 'index.html',
    compiler: 'Web Playground Runtime',
    version: 'HTML5 / CSS3 / ES2024',
    iconName: 'Globe',
    syntaxColor: '#E34F26',
    accentColor: 'from-orange-500 to-amber-600',
    description: 'Full-stack client web playground with live DOM and script evaluation.',
    isZeroSetup: true,
    category: 'native',
  },
};

export const TEMPLATES_BY_LANGUAGE: Record<SupportedLanguage, CodeTemplate[]> = {
  javascript: [
    {
      id: 'js-interactive',
      title: 'Interactive Readline Input',
      category: 'Interactive I/O',
      description: 'Real-time interactive user prompt in Node.js terminal',
      code: `const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("=========================================");
console.log(" Welcome to the Live JavaScript (Node.js) Terminal!");
console.log("=========================================");

rl.question('What is your name? ', (name) => {
  console.log(\`Hello, \${name}! Welcome to zero-setup JavaScript.\`);
  
  rl.question('Enter a number to calculate factorial: ', (numStr) => {
    const num = parseInt(numStr, 10);
    if (!isNaN(num) && num >= 0) {
      let fact = 1;
      for (let i = 2; i <= num; i++) fact *= i;
      console.log(\`>> Factorial of \${num} is \${fact}\`);
    } else {
      console.log('Invalid positive integer.');
    }
    rl.close();
  });
});
`,
    },
    {
      id: 'js-hello',
      title: 'Modern ES2024 & Async/Await',
      category: 'Basics',
      description: 'Demonstrates modern JavaScript features, Promises, and array pipelines',
      code: `// Modern JavaScript ES2024 & Async/Await Demo
console.log("=========================================");
console.log(" Hello, World from JavaScript (Node.js 22 LTS)!");
console.log("=========================================");

const users = [
  { id: 1, name: 'Alice', role: 'Engineer', score: 95 },
  { id: 2, name: 'Bob', role: 'Designer', score: 88 },
  { id: 3, name: 'Charlie', role: 'Product Lead', score: 92 },
];

console.log("Team Members above 90 score:");
const topPerformers = users
  .filter(u => u.score >= 90)
  .map(u => \`  ⭐ \${u.name} (\${u.role}) - Score: \${u.score}\`);

console.log(topPerformers.join('\\n'));

const avgScore = (users.reduce((acc, u) => acc + u.score, 0) / users.length).toFixed(1);
console.log(\`\\nTeam Average Score: \${avgScore}\`);
`,
    },
    {
      id: 'js-algo',
      title: 'Algorithm: Two Sum & Hash Map',
      category: 'Algorithms',
      description: 'Finds two indices that add up to target in O(n) time',
      code: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return null;
}

const numbers = [2, 7, 11, 15, 3, 6];
const target = 9;

console.log(\`Searching for two numbers in [\${numbers.join(', ')}] that sum to \${target}...\`);
const result = twoSum(numbers, target);

if (result) {
  const [i, j] = result;
  console.log(\`✓ Found pair at indices [\${i}, \${j}]: \${numbers[i]} + \${numbers[j]} = \${target}\`);
} else {
  console.log("No two sum solution found.");
}
`,
    },
  ],

  typescript: [
    {
      id: 'ts-interactive',
      title: 'Interactive Readline with Types',
      category: 'Interactive I/O',
      description: 'Type-safe interactive prompt with interfaces and generics',
      code: `import * as readline from 'readline';

interface Person {
  name: string;
  age: number;
  role: 'Developer' | 'Student' | 'Creator';
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("=========================================");
console.log(" Welcome to TypeScript 5.8 (Zero Setup)!");
console.log("=========================================");

rl.question('Enter developer name: ', (name: string) => {
  rl.question('Enter age: ', (ageStr: string) => {
    const age = parseInt(ageStr, 10) || 24;
    
    const user: Person = {
      name: name || 'TypeScript Dev',
      age,
      role: 'Developer',
    };

    console.log(\`\\n✓ Registered \${user.role}: \${user.name}, \${user.age} years old.\`);
    console.log(\`>> Status: Type-safe runtime compilation successful!\`);
    rl.close();
  });
});
`,
    },
    {
      id: 'ts-generics',
      title: 'Generics & Data Structures',
      category: 'Data Structures',
      description: 'Generic Stack and Queue data structure implementation',
      code: `// Generic Stack Implementation in TypeScript
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

console.log("--- Generic Stack Test ---");
const numberStack = new Stack<number>();
numberStack.push(10);
numberStack.push(20);
numberStack.push(30);

console.log(\`Stack top element: \${numberStack.peek()}\`);
console.log(\`Popped element: \${numberStack.pop()}\`);
console.log(\`Remaining size: \${numberStack.size()}\`);

const stringStack = new Stack<string>();
stringStack.push('TypeScript');
stringStack.push('Node.js');
stringStack.push('React');
console.log(\`String Stack size: \${stringStack.size()} (Top: \${stringStack.peek()})\`);
`,
    },
    {
      id: 'ts-quicksort',
      title: 'Generic QuickSort Algorithm',
      category: 'Algorithms',
      description: 'Recursive QuickSort with custom comparator functions',
      code: `function quickSort<T>(arr: T[], compare: (a: T, b: T) => number): T[] {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[arr.length - 1];
  const left: T[] = [];
  const right: T[] = [];

  for (let i = 0; i < arr.length - 1; i++) {
    if (compare(arr[i], pivot) < 0) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }

  return [...quickSort(left, compare), pivot, ...quickSort(right, compare)];
}

const scores: number[] = [45, 12, 89, 34, 77, 95, 23, 61];
console.log("Original array:", scores);

const sortedScores = quickSort(scores, (a, b) => a - b);
console.log("Sorted array (Ascending):", sortedScores);

const reversedScores = quickSort(scores, (a, b) => b - a);
console.log("Sorted array (Descending):", reversedScores);
`,
    },
  ],

  sql: [
    {
      id: 'sql-ecommerce',
      title: 'E-Commerce Database & Joins',
      category: 'Basics',
      description: 'Creates tables, inserts orders, customers, and runs aggregations',
      code: `-- Relational SQLite Engine Demo (Zero Setup)
CREATE TABLE customers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    country TEXT
);

CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY,
    customer_id INTEGER,
    product TEXT,
    amount REAL,
    order_date TEXT,
    FOREIGN KEY(customer_id) REFERENCES customers(id)
);

INSERT INTO customers VALUES 
    (1, 'Alice Smith', 'alice@example.com', 'USA'),
    (2, 'Bob Johnson', 'bob@example.com', 'UK'),
    (3, 'Charlie Lee', 'charlie@example.com', 'Canada'),
    (4, 'Diana Patel', 'diana@example.com', 'India');

INSERT INTO orders VALUES 
    (101, 1, 'Mechanical Keyboard', 129.99, '2026-01-15'),
    (102, 1, 'UltraWide Monitor', 499.50, '2026-01-18'),
    (103, 2, 'Noise Cancelling Headphones', 199.00, '2026-02-01'),
    (104, 3, 'Ergonomic Chair', 280.00, '2026-02-10'),
    (105, 4, 'USB-C Docking Station', 89.99, '2026-02-14'),
    (106, 2, 'Wireless Mouse', 45.00, '2026-02-20');

-- 1. Query: Customer Order Summary with JOIN & GROUP BY
SELECT 
    c.name AS customer_name,
    c.country,
    COUNT(o.order_id) AS total_orders,
    SUM(o.amount) AS total_spent
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id
ORDER BY total_spent DESC;
`,
    },
    {
      id: 'sql-employees',
      title: 'Department Analytics & Salary',
      category: 'Algorithms',
      description: 'Window functions, averages, and highest earners per department',
      code: `CREATE TABLE departments (
    dept_id INTEGER PRIMARY KEY,
    dept_name TEXT NOT NULL
);

CREATE TABLE employees (
    emp_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    dept_id INTEGER,
    salary INTEGER,
    hire_year INTEGER
);

INSERT INTO departments VALUES (1, 'Engineering'), (2, 'Design'), (3, 'Marketing');

INSERT INTO employees VALUES
    (1, 'Alex', 1, 95000, 2021),
    (2, 'Brian', 1, 110000, 2019),
    (3, 'Chloe', 2, 85000, 2022),
    (4, 'David', 3, 72000, 2020),
    (5, 'Elena', 1, 125000, 2018),
    (6, 'Fiona', 3, 78000, 2023);

-- Department Salary Statistics
SELECT 
    d.dept_name,
    COUNT(e.emp_id) AS employee_count,
    AVG(e.salary) AS average_salary,
    MAX(e.salary) AS top_salary
FROM departments d
LEFT JOIN employees e ON d.dept_id = e.dept_id
GROUP BY d.dept_id;
`,
    },
  ],

  html: [
    {
      id: 'html-app',
      title: 'Interactive Web Card & Counter',
      category: 'Basics',
      description: 'HTML5 layout with CSS animations and JavaScript state counter',
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SyntaxHub Web App</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 90vh;
      margin: 0;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);
      max-width: 380px;
      width: 100%;
    }
    .counter-value {
      font-size: 3.5rem;
      font-weight: 800;
      color: #38bdf8;
      margin: 1rem 0;
      font-family: monospace;
    }
    .btn-group {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
    }
    button {
      background: #0284c7;
      color: white;
      border: none;
      padding: 0.6rem 1.2rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.1s, background 0.2s;
    }
    button:hover { background: #0369a1; }
    button:active { transform: scale(0.96); }
  </style>
</head>
<body>
  <div class="card">
    <h2>⚡ SyntaxHub Web App</h2>
    <p style="color: #94a3b8; font-size: 0.9rem;">Client-side zero-setup playground</p>
    <div id="counter" class="counter-value">0</div>
    <div class="btn-group">
      <button onclick="decrement()">- Decrease</button>
      <button onclick="reset()">Reset</button>
      <button onclick="increment()">+ Increase</button>
    </div>
  </div>

  <script>
    let count = 0;
    const counterEl = document.getElementById('counter');

    function update() {
      counterEl.textContent = count;
    }
    function increment() { count++; update(); }
    function decrement() { count--; update(); }
    function reset() { count = 0; update(); }
    console.log("Web Application initialized successfully!");
  </script>
</body>
</html>
`,
    },
  ],

  c: [
    {
      id: 'c-interactive',
      title: 'Interactive Terminal Input',
      category: 'Interactive I/O',
      description: 'Prompts for user name and numbers directly in the live terminal',
      code: `#include <stdio.h>

int main(void) {
    char name[64];
    int num;
    
    printf("=========================================\\n");
    printf(" Welcome to the Live C Terminal!\\n");
    printf("=========================================\\n");
    
    printf("Enter your name: ");
    fflush(stdout);
    if (scanf("%63s", name) == 1) {
        printf("Hello, %s! Nice to meet you.\\n\\n", name);
    }
    
    printf("Enter an integer to calculate its square: ");
    fflush(stdout);
    if (scanf("%d", &num) == 1) {
        printf(">> The square of %d is %d\\n", num, num * num);
    }
    
    return 0;
}
`,
    },
    {
      id: 'c-hello',
      title: 'Hello World',
      category: 'Basics',
      description: 'Standard C hello world greeting with exit status',
      code: `#include <stdio.h>

int main(void) {
    printf("======================================\\n");
    printf(" Welcome to SyntaxHub Online C IDE!\\n");
    printf("======================================\\n");
    printf("Hello, World! Ready to build amazing code.\\n");
    return 0;
}
`,
    },
    {
      id: 'c-calculator',
      title: 'Interactive Calculator',
      category: 'Interactive I/O',
      description: 'Performs arithmetic operations based on live terminal input',
      code: `#include <stdio.h>

int main(void) {
    double a, b;
    char op;
    
    printf("--- Interactive C Calculator ---\\n");
    printf("Enter first number: ");
    fflush(stdout);
    scanf("%lf", &a);
    
    printf("Enter operator (+, -, *, /): ");
    fflush(stdout);
    scanf(" %c", &op);
    
    printf("Enter second number: ");
    fflush(stdout);
    scanf("%lf", &b);
    
    printf("\\nCalculation Result:\\n");
    switch(op) {
        case '+': printf("%.2lf + %.2lf = %.2lf\\n", a, b, a + b); break;
        case '-': printf("%.2lf - %.2lf = %.2lf\\n", a, b, a - b); break;
        case '*': printf("%.2lf * %.2lf = %.2lf\\n", a, b, a * b); break;
        case '/': 
            if (b != 0) printf("%.2lf / %.2lf = %.2lf\\n", a, b, a / b);
            else printf("Error: Division by zero!\\n");
            break;
        default: printf("Unknown operator '%c'\\n", op);
    }
    return 0;
}
`,
    },
  ],

  cpp: [
    {
      id: 'cpp-interactive',
      title: 'Interactive Terminal Input',
      category: 'Interactive I/O',
      description: 'Modern C++17 std::cin & std::cout terminal interaction',
      code: `#include <iostream>
#include <string>

int main() {
    std::string name;
    int a, b;
    
    std::cout << "=========================================" << std::endl;
    std::cout << " Welcome to the Live C++ Terminal!" << std::endl;
    std::cout << "=========================================" << std::endl;
    
    std::cout << "Enter your developer name: " << std::flush;
    if (std::cin >> name) {
        std::cout << "Hello, " << name << "! Let's run some C++ code." << std::endl << std::endl;
    }
    
    std::cout << "Enter two numbers (separated by space or Enter): " << std::flush;
    if (std::cin >> a >> b) {
        std::cout << ">> Sum: " << (a + b) << std::endl;
        std::cout << ">> Product: " << (a * b) << std::endl;
        std::cout << ">> Max: " << std::max(a, b) << std::endl;
    }
    
    return 0;
}
`,
    },
    {
      id: 'cpp-hello',
      title: 'Hello World',
      category: 'Basics',
      description: 'Standard C++ Hello World output',
      code: `#include <iostream>

int main() {
    std::cout << "=========================================" << std::endl;
    std::cout << " Hello, World from C++17!" << std::endl;
    std::cout << "=========================================" << std::endl;
    return 0;
}
`,
    },
  ],

  java: [
    {
      id: 'java-interactive',
      title: 'Interactive Scanner Input',
      category: 'Interactive I/O',
      description: 'Java 17 live user input using java.util.Scanner',
      code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        System.out.println("=========================================");
        System.out.println(" Welcome to the Live Java Terminal!");
        System.out.println("=========================================");
        
        System.out.print("Enter your name: ");
        if (scanner.hasNext()) {
            String name = scanner.next();
            System.out.println("Hello, " + name + "! Welcome to Java 17 LTS.\\n");
        }
        
        System.out.print("Enter a number to check if it is Prime: ");
        if (scanner.hasNextInt()) {
            int num = scanner.nextInt();
            boolean isPrime = num > 1;
            for (int i = 2; i * i <= num; i++) {
                if (num % i == 0) {
                    isPrime = false;
                    break;
                }
            }
            System.out.println(">> " + num + (isPrime ? " is a PRIME number!" : " is NOT a prime number."));
        }
        
        scanner.close();
    }
}
`,
    },
    {
      id: 'java-hello',
      title: 'Hello World',
      category: 'Basics',
      description: 'Standard Java 17 class and main entry point',
      code: `public class Main {
    public static void main(String[] args) {
        System.out.println("=========================================");
        System.out.println(" Hello, World from Java 17 LTS!");
        System.out.println("=========================================");
        System.out.println("SyntaxHub IDE executes Java natively with OpenJDK 17.");
    }
}
`,
    },
    {
      id: 'java-oop',
      title: 'Object-Oriented Programming (OOP)',
      category: 'OOP',
      description: 'Classes, inheritance, and encapsulation in Java',
      code: `class Animal {
    protected String name;
    
    public Animal(String name) {
        this.name = name;
    }
    
    public void speak() {
        System.out.println(name + " makes a sound.");
    }
}

class Dog extends Animal {
    private String breed;
    
    public Dog(String name, String breed) {
        super(name);
        this.breed = breed;
    }
    
    @Override
    public void speak() {
        System.out.println(name + " (" + breed + ") barks: Woof! Woof!");
    }
}

public class Main {
    public static void main(String[] args) {
        Animal myDog = new Dog("Buddy", "Golden Retriever");
        myDog.speak();
    }
}
`,
    },
  ],

  python: [
    {
      id: 'python-interactive',
      title: 'Interactive input() Prompt',
      category: 'Interactive I/O',
      description: 'Real-time terminal input with Python 3',
      code: `print("=========================================")
print(" Welcome to the Live Python Terminal!")
print("=========================================")

name = input("Enter your name: ")
print(f"Hello, {name}! Ready to write some Python.\\n")

try:
    num = float(input("Enter a number to calculate square and cube: "))
    print(f">> Square of {num} is {num ** 2}")
    print(f">> Cube of {num} is {num ** 3}")
except ValueError:
    print("Invalid number format!")
`,
    },
    {
      id: 'python-hello',
      title: 'Hello World',
      category: 'Basics',
      description: 'Standard Python greeting',
      code: `print("=========================================")
print(" Hello, World from Python 3.10!")
print("=========================================")
print("SyntaxHub IDE is fast, flexible, and interactive.")
`,
    },
  ],
};

export const DEFAULT_TEMPLATES: Record<SupportedLanguage, string> = {
  c: TEMPLATES_BY_LANGUAGE.c[0].code,
  cpp: TEMPLATES_BY_LANGUAGE.cpp[0].code,
  java: TEMPLATES_BY_LANGUAGE.java[0].code,
  python: TEMPLATES_BY_LANGUAGE.python[0].code,
  javascript: TEMPLATES_BY_LANGUAGE.javascript[0].code,
  typescript: TEMPLATES_BY_LANGUAGE.typescript[0].code,
  sql: TEMPLATES_BY_LANGUAGE.sql[0].code,
  html: TEMPLATES_BY_LANGUAGE.html[0].code,
};
