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
    description: 'High-performance, procedural systems programming language.',
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
    description: 'Powerful object-oriented and generic systems programming language.',
  },
  java: {
    id: 'java',
    name: 'Java',
    extension: '.java',
    defaultFilename: 'Main.java',
    compiler: 'OpenJDK 17',
    version: 'Java 17 LTS',
    iconName: 'Coffee',
    syntaxColor: '#EA2D2E',
    accentColor: 'from-amber-600 to-red-600',
    description: 'Robust, platform-independent, object-oriented enterprise language.',
  },
  python: {
    id: 'python',
    name: 'Python',
    extension: '.py',
    defaultFilename: 'main.py',
    compiler: 'Python 3.10',
    version: 'Python 3.10',
    iconName: 'FileCode2',
    syntaxColor: '#3776AB',
    accentColor: 'from-emerald-500 to-teal-700',
    description: 'High-level, expressive, dynamically-typed multi-paradigm language.',
  },
};

export const TEMPLATES_BY_LANGUAGE: Record<SupportedLanguage, CodeTemplate[]> = {
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
    {
      id: 'c-algo',
      title: 'Array Sorting & Search',
      category: 'Algorithms',
      description: 'Sorts integers and searches target via terminal prompt',
      code: `#include <stdio.h>
#include <stdlib.h>

int compare(const void *a, const void *b) {
    return (*(int*)a - *(int*)b);
}

int main(void) {
    int n;
    printf("Enter number of elements: ");
    fflush(stdout);
    if (scanf("%d", &n) != 1 || n <= 0) return 0;
    
    int *arr = (int*)malloc(n * sizeof(int));
    printf("Enter %d integers (press Enter after each):\\n", n);
    for (int i = 0; i < n; i++) {
        printf("  Element [%d]: ", i + 1);
        fflush(stdout);
        scanf("%d", &arr[i]);
    }
    
    qsort(arr, n, sizeof(int), compare);
    
    printf("\\nSorted Array: ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
    
    free(arr);
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
    {
      id: 'cpp-vector-algo',
      title: 'Vector Manipulation & STL',
      category: 'Data Structures',
      description: 'Interactive dynamic array with STL algorithms',
      code: `#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>

int main() {
    int count;
    std::cout << "How many numbers would you like to analyze? " << std::flush;
    if (!(std::cin >> count) || count <= 0) return 0;
    
    std::vector<int> numbers;
    for (int i = 0; i < count; ++i) {
        int val;
        std::cout << "Number " << (i + 1) << ": " << std::flush;
        std::cin >> val;
        numbers.push_back(val);
    }
    
    std::sort(numbers.begin(), numbers.end());
    double sum = std::accumulate(numbers.begin(), numbers.end(), 0);
    
    std::cout << "\\n--- Results ---" << std::endl;
    std::cout << "Sorted: ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << std::endl;
    std::cout << "Average: " << (sum / count) << std::endl;
    std::cout << "Min: " << numbers.front() << " | Max: " << numbers.back() << std::endl;
    
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
print(f"Hello, {name}! Ready to write some Python.\n")

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
    {
      id: 'python-quiz',
      title: 'Interactive Math Quiz',
      category: 'Interactive I/O',
      description: 'A 2-question interactive math game in the terminal',
      code: `import random

print("=== Python Quick Math Challenge ===")
a = random.randint(1, 10)
b = random.randint(1, 10)

answer = int(input(f"What is {a} * {b}? "))
if answer == a * b:
    print("✓ Correct! Fantastic job.")
else:
    print(f"✗ Oops! The correct answer was {a * b}.")
`,
    },
  ],
};

export const DEFAULT_TEMPLATES: Record<SupportedLanguage, string> = {
  c: TEMPLATES_BY_LANGUAGE.c[0].code,
  cpp: TEMPLATES_BY_LANGUAGE.cpp[0].code,
  java: TEMPLATES_BY_LANGUAGE.java[0].code,
  python: TEMPLATES_BY_LANGUAGE.python[0].code,
};
