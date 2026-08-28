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
      id: 'c-hello',
      title: 'Hello World',
      category: 'Basics',
      description: 'Standard C hello world greeting with exit status',
      code: `#include <stdio.h>

int main(void) {
    printf("======================================\\n");
    printf(" Welcome to the Online C IDE!\\n");
    printf("======================================\\n");
    printf("Hello, World! Ready to build amazing code.\\n");
    return 0;
}
`,
    },
    {
      id: 'c-io',
      title: 'Interactive Input / Output',
      category: 'Input/Output',
      description: 'Reading user name and numbers via stdin and calculating statistics',
      stdin: `Alex
25
4
12 45 8 92`,
      code: `#include <stdio.h>

int main(void) {
    char name[64];
    int age;
    int n;
    
    printf("Reading user profile and array from stdin...\\n");
    
    if (scanf("%63s", name) != 1) {
        printf("Error: Could not read name\\n");
        return 1;
    }
    
    if (scanf("%d", &age) != 1) {
        printf("Error: Could not read age\\n");
        return 1;
    }
    
    printf("Profile: Name = %s, Age = %d years old\\n", name, age);
    
    if (scanf("%d", &n) == 1 && n > 0) {
        int sum = 0;
        int maxVal = -2147483648;
        printf("Reading %d integers:\\n", n);
        
        for (int i = 0; i < n; i++) {
            int val;
            if (scanf("%d", &val) == 1) {
                sum += val;
                if (val > maxVal) maxVal = val;
                printf("  [Item %d]: %d\\n", i + 1, val);
            }
        }
        
        printf("Sum: %d | Average: %.2f | Max: %d\\n", sum, (double)sum / n, maxVal);
    }
    
    return 0;
}
`,
    },
    {
      id: 'c-algo',
      title: 'Binary Search & Quick Sort',
      category: 'Algorithms',
      description: 'Sorting an integer array and performing O(log n) binary search',
      stdin: `7
34 7 23 32 5 62 19
32`,
      code: `#include <stdio.h>
#include <stdlib.h>

int compareInts(const void *a, const void *b) {
    return (*(int*)a - *(int*)b);
}

int binarySearch(int arr[], int n, int target) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

int main(void) {
    int n, target;
    if (scanf("%d", &n) != 1 || n <= 0) {
        printf("Provide array size in stdin!\\n");
        return 1;
    }

    int *arr = (int*)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }

    printf("Original array: ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");

    qsort(arr, n, sizeof(int), compareInts);

    printf("Sorted array:   ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");

    if (scanf("%d", &target) == 1) {
        int idx = binarySearch(arr, n, target);
        if (idx != -1) {
            printf("Found target %d at sorted index %d!\\n", target, idx);
        } else {
            printf("Target %d not found in array.\\n", target);
        }
    }

    free(arr);
    return 0;
}
`,
    },
    {
      id: 'c-ds',
      title: 'Linked List Implementation',
      category: 'Data Structures',
      description: 'Singly linked list with insert, traverse, and memory deallocation',
      code: `#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node *next;
} Node;

Node* createNode(int value) {
    Node *newNode = (Node*)malloc(sizeof(Node));
    if (!newNode) return NULL;
    newNode->data = value;
    newNode->next = NULL;
    return newNode;
}

void insertTail(Node **head, int value) {
    Node *newNode = createNode(value);
    if (*head == NULL) {
        *head = newNode;
        return;
    }
    Node *curr = *head;
    while (curr->next != NULL) {
        curr = curr->next;
    }
    curr->next = newNode;
}

void printList(Node *head) {
    printf("Linked List: ");
    Node *curr = head;
    while (curr != NULL) {
        printf("[%d] -> ", curr->data);
        curr = curr->next;
    }
    printf("NULL\\n");
}

void freeList(Node *head) {
    Node *curr = head;
    while (curr != NULL) {
        Node *temp = curr;
        curr = curr->next;
        free(temp);
    }
}

int main(void) {
    Node *head = NULL;
    int values[] = {10, 20, 30, 40, 50};
    int count = sizeof(values) / sizeof(values[0]);

    for (int i = 0; i < count; i++) {
        insertTail(&head, values[i]);
    }

    printList(head);
    freeList(head);
    printf("Memory freed successfully.\\n");
    return 0;
}
`,
    },
  ],

  cpp: [
    {
      id: 'cpp-hello',
      title: 'Hello World (Modern C++17)',
      category: 'Basics',
      description: 'C++17 greeting with STL containers and lambda iterations',
      code: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

int main() {
    std::cout << "========================================" << std::endl;
    std::cout << "   Online C++ IDE (C++17 Standard)     " << std::endl;
    std::cout << "========================================" << std::endl;

    std::vector<std::string> languages = {"C", "C++", "Java", "Python"};

    std::cout << "Supported Languages in this IDE:" << std::endl;
    for (size_t i = 0; i < languages.size(); ++i) {
        std::cout << "  " << (i + 1) << ". " << languages[i] << std::endl;
    }

    return 0;
}
`,
    },
    {
      id: 'cpp-io',
      title: 'Fast I/O & Dynamic Sum',
      category: 'Input/Output',
      description: 'Competitive programming fast I/O with standard stream formatting',
      stdin: `TechTeam
5
15 28 33 42 19`,
      code: `#include <iostream>
#include <vector>
#include <numeric>
#include <string>

int main() {
    // Fast I/O
    std::ios_base::sync_with_stdio(false);
    std::cin.tie(NULL);

    std::string groupName;
    int n;

    if (std::cin >> groupName >> n) {
        std::cout << "Processing data for team: " << groupName << "\\n";
        std::cout << "Number of elements: " << n << "\\n";

        std::vector<long long> numbers(n);
        for (int i = 0; i < n; ++i) {
            std::cin >> numbers[i];
        }

        long long sum = std::accumulate(numbers.begin(), numbers.end(), 0LL);
        double avg = static_cast<double>(sum) / n;

        std::cout << "Array elements: ";
        for (const auto& num : numbers) {
            std::cout << num << " ";
        }
        std::cout << "\\nTotal Sum: " << sum << "\\nAverage: " << avg << "\\n";
    } else {
        std::cout << "Please provide team name and numbers in stdin.\\n";
    }

    return 0;
}
`,
    },
    {
      id: 'cpp-oop',
      title: 'Object-Oriented Programming (Polymorphism)',
      category: 'OOP',
      description: 'Demonstrating abstract classes, virtual methods, and inheritance',
      code: `#include <iostream>
#include <memory>
#include <vector>
#include <cmath>

class Shape {
public:
    virtual ~Shape() = default;
    virtual double getArea() const = 0;
    virtual double getPerimeter() const = 0;
    virtual void printInfo() const = 0;
};

class Rectangle : public Shape {
private:
    double width, height;
public:
    Rectangle(double w, double h) : width(w), height(h) {}
    double getArea() const override { return width * height; }
    double getPerimeter() const override { return 2 * (width + height); }
    void printInfo() const override {
        std::cout << "Rectangle [" << width << " x " << height 
                  << "] Area = " << getArea() << ", Perimeter = " << getPerimeter() << "\\n";
    }
};

class Circle : public Shape {
private:
    double radius;
public:
    Circle(double r) : radius(r) {}
    double getArea() const override { return M_PI * radius * radius; }
    double getPerimeter() const override { return 2 * M_PI * radius; }
    void printInfo() const override {
        std::cout << "Circle [r = " << radius 
                  << "] Area = " << getArea() << ", Perimeter = " << getPerimeter() << "\\n";
    }
};

int main() {
    std::vector<std::unique_ptr<Shape>> shapes;
    shapes.push_back(std::make_unique<Rectangle>(10.0, 5.0));
    shapes.push_back(std::make_unique<Circle>(7.0));
    shapes.push_back(std::make_unique<Rectangle>(4.0, 4.0));

    std::cout << "--- Shape Polymorphism Showcase ---\\n";
    double totalArea = 0;
    for (const auto& shape : shapes) {
        shape->printInfo();
        totalArea += shape->getArea();
    }

    std::cout << "\\nTotal combined area: " << totalArea << "\\n";
    return 0;
}
`,
    },
    {
      id: 'cpp-ds',
      title: 'STL Map & Frequency Analyzer',
      category: 'Data Structures',
      description: 'Word frequency counter using std::map with sorted key-value output',
      stdin: `apple banana apple orange banana apple mango kiwi orange`,
      code: `#include <iostream>
#include <string>
#include <sstream>
#include <map>
#include <iomanip>

int main() {
    std::string line;
    std::map<std::string, int> freqMap;

    std::cout << "--- STL Map Word Frequency Analyzer ---\\n";

    if (std::getline(std::cin, line) && !line.empty()) {
        std::stringstream ss(line);
        std::string word;
        int totalWords = 0;

        while (ss >> word) {
            freqMap[word]++;
            totalWords++;
        }

        std::cout << "Total words parsed: " << totalWords << "\\n\\n";
        std::cout << std::left << std::setw(15) << "WORD" << "COUNT" << "\\n";
        std::cout << "----------------------\\n";

        for (const auto& [key, count] : freqMap) {
            std::cout << std::left << std::setw(15) << key << count << "\\n";
        }
    } else {
        std::cout << "No input line provided in stdin.\\n";
    }

    return 0;
}
`,
    },
  ],

  java: [
    {
      id: 'java-hello',
      title: 'Hello World',
      category: 'Basics',
      description: 'Standard Java main class structure and JVM properties',
      code: `public class Main {
    public static void main(String[] args) {
        System.out.println("========================================");
        System.out.println("     Online Java IDE (Java 17 LTS)      ");
        System.out.println("========================================");
        System.out.println("Hello, World! Java is running smoothly.");
        System.out.println("Java Version: " + System.getProperty("java.version"));
        System.out.println("Java Vendor:  " + System.getProperty("java.vendor"));
    }
}
`,
    },
    {
      id: 'java-io',
      title: 'Scanner Interactive I/O',
      category: 'Input/Output',
      description: 'Using java.util.Scanner to read formatted records and tokens',
      stdin: `Developer
3
95.5
88.0
92.5`,
      code: `import java.util.Scanner;
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.println("--- Student Grade Calculator ---");

        if (scanner.hasNext()) {
            String studentName = scanner.next();
            int scoreCount = scanner.nextInt();

            ArrayList<Double> scores = new ArrayList<>();
            double sum = 0;

            for (int i = 0; i < scoreCount; i++) {
                if (scanner.hasNextDouble()) {
                    double score = scanner.nextDouble();
                    scores.add(score);
                    sum += score;
                }
            }

            double average = scores.isEmpty() ? 0 : sum / scores.size();

            System.out.println("Student Name: " + studentName);
            System.out.println("Total Tests:  " + scores.size());
            System.out.println("Scores:       " + scores);
            System.out.printf("Average:      %.2f%%%n", average);
            System.out.println("Letter Grade: " + (average >= 90 ? "A" : average >= 80 ? "B" : "C"));
        } else {
            System.out.println("Please provide student name and scores in stdin.");
        }

        scanner.close();
    }
}
`,
    },
    {
      id: 'java-oop',
      title: 'Object-Oriented Bank System',
      category: 'OOP',
      description: 'Encapsulation, custom exceptions, and transaction handling',
      code: `import java.util.ArrayList;
import java.util.List;

class BankAccount {
    private final String accountNumber;
    private final String accountHolder;
    private double balance;
    private final List<String> transactionHistory;

    public BankAccount(String accountNumber, String accountHolder, double initialDeposit) {
        this.accountNumber = accountNumber;
        this.accountHolder = accountHolder;
        this.balance = initialDeposit;
        this.transactionHistory = new ArrayList<>();
        transactionHistory.add("Account opened with initial deposit: $" + initialDeposit);
    }

    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
            transactionHistory.add("Deposited: +$" + amount + " (Balance: $" + balance + ")");
        }
    }

    public boolean withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            transactionHistory.add("Withdrew:  -$" + amount + " (Balance: $" + balance + ")");
            return true;
        }
        transactionHistory.add("Failed withdrawal of $" + amount + " (Insufficient funds)");
        return false;
    }

    public void printStatement() {
        System.out.println("====================================");
        System.out.println("Account Statement: " + accountNumber + " (" + accountHolder + ")");
        System.out.println("Current Balance:   $" + balance);
        System.out.println("Transactions:");
        for (String tx : transactionHistory) {
            System.out.println("  * " + tx);
        }
        System.out.println("====================================");
    }
}

public class Main {
    public static void main(String[] args) {
        BankAccount account = new BankAccount("ACC-9042", "Sarah Connor", 500.00);
        account.deposit(250.50);
        account.withdraw(120.00);
        account.withdraw(800.00); // Should fail
        account.deposit(1000.00);
        account.withdraw(450.00);
        account.printStatement();
    }
}
`,
    },
    {
      id: 'java-algo',
      title: 'Binary Tree Traversal',
      category: 'Data Structures',
      description: 'Binary Search Tree insertion and In-order, Pre-order traversal',
      code: `class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}

class BinarySearchTree {
    TreeNode root;

    public void insert(int val) {
        root = insertRec(root, val);
    }

    private TreeNode insertRec(TreeNode root, int val) {
        if (root == null) return new TreeNode(val);
        if (val < root.val) root.left = insertRec(root.left, val);
        else if (val > root.val) root.right = insertRec(root.right, val);
        return root;
    }

    public void inOrder(TreeNode node) {
        if (node != null) {
            inOrder(node.left);
            System.out.print(node.val + " ");
            inOrder(node.right);
        }
    }
}

public class Main {
    public static void main(String[] args) {
        BinarySearchTree bst = new BinarySearchTree();
        int[] elements = {50, 30, 20, 40, 70, 60, 80};

        System.out.println("Inserting elements into BST: 50, 30, 20, 40, 70, 60, 80");
        for (int el : elements) {
            bst.insert(el);
        }

        System.out.print("In-order Traversal (Sorted Output): ");
        bst.inOrder(bst.root);
        System.out.println();
    }
}
`,
    },
  ],

  python: [
    {
      id: 'py-hello',
      title: 'Hello World & Statistics',
      category: 'Basics',
      description: 'Python 3 basics with formatted f-strings and math operations',
      code: `import sys
import math

def main():
    print("========================================")
    print("     Online Python IDE (Python 3.10)    ")
    print("========================================")
    print(f"Python interpreter: {sys.version}")
    
    # Calculate geometric values
    radius = 5.0
    area = math.pi * (radius ** 2)
    circumference = 2 * math.pi * radius
    
    print(f"Circle radius: {radius}")
    print(f"Calculated Area: {area:.4f}")
    print(f"Calculated Circumference: {circumference:.4f}")

if __name__ == "__main__":
    main()
`,
    },
    {
      id: 'py-io',
      title: 'Interactive User Input & Parsing',
      category: 'Input/Output',
      description: 'Reading multiline stdin, parsing numbers, and generating summary dict',
      stdin: `CodeExplorer
4
12 45 78 23`,
      code: `import sys

def process_input():
    print("--- Reading from standard input ---")
    lines = [line.strip() for line in sys.stdin if line.strip()]
    
    if not lines:
        print("No input provided in stdin!")
        return

    username = lines[0]
    count = int(lines[1]) if len(lines) > 1 else 0
    numbers = []
    
    if len(lines) > 2:
        numbers = [int(x) for x in lines[2].split()]
        
    print(f"User: {username}")
    print(f"Parsed {len(numbers)} numbers: {numbers}")
    
    if numbers:
        summary = {
            "sum": sum(numbers),
            "min": min(numbers),
            "max": max(numbers),
            "average": sum(numbers) / len(numbers),
            "sorted": sorted(numbers)
        }
        print("\\nSummary Report:")
        for key, val in summary.items():
            print(f"  {key.capitalize():<10}: {val}")

if __name__ == "__main__":
    process_input()
`,
    },
    {
      id: 'py-algo',
      title: 'Recursive QuickSort & Fibonacci',
      category: 'Algorithms',
      description: 'Recursive divide-and-conquer QuickSort with performance timing',
      code: `import time

def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

def fibonacci(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 0:
        return 0
    if n == 1:
        return 1
    memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo)
    return memo[n]

def main():
    sample_data = [64, 34, 25, 12, 22, 11, 90, 88, 45, 5, 73]
    print(f"Original dataset: {sample_data}")
    
    start_time = time.perf_counter()
    sorted_data = quicksort(sample_data)
    duration = (time.perf_counter() - start_time) * 1000
    
    print(f"QuickSorted:      {sorted_data}")
    print(f"Sort duration:    {duration:.4f} ms")
    
    print("\\nFibonacci Sequence (first 12 terms):")
    fib_seq = [fibonacci(i) for i in range(1, 13)]
    print(f"  {fib_seq}")

if __name__ == "__main__":
    main()
`,
    },
    {
      id: 'py-oop',
      title: 'Classes, Dataclasses & Generators',
      category: 'OOP',
      description: 'Modern Python dataclasses with custom generators and property decorators',
      code: `from dataclasses import dataclass, field
from typing import List

@dataclass
class Task:
    id: int
    title: str
    priority: str = "Medium"
    completed: bool = False

class TaskManager:
    def __init__(self):
        self.tasks: List[Task] = []

    def add_task(self, title: str, priority: str = "Medium"):
        task_id = len(self.tasks) + 1
        task = Task(id=task_id, title=title, priority=priority)
        self.tasks.append(task)
        return task

    def mark_complete(self, task_id: int):
        for task in self.tasks:
            if task.id == task_id:
                task.completed = True
                return True
        return False

    def active_tasks(self):
        for task in self.tasks:
            if not task.completed:
                yield task

def main():
    manager = TaskManager()
    manager.add_task("Review C++ compiler benchmarks", "High")
    manager.add_task("Prepare Java 17 test cases", "Medium")
    manager.add_task("Sync Google Docs export pipeline", "High")
    manager.add_task("Configure Text-to-Speech audio", "Low")

    manager.mark_complete(2)

    print("--- Active (Pending) Tasks ---")
    for task in manager.active_tasks():
        status = "[DONE]" if task.completed else "[TODO]"
        print(f"{status} #{task.id}: {task.title} (Priority: {task.priority})")

if __name__ == "__main__":
    main()
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
