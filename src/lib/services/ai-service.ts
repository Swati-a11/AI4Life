import { AITutorMode, QuizQuestion, ChallengeMatch, StudyTask } from "../types/student-types";

export class GeminiAIService {
  static async generateTutorResponse(
    query: string,
    mode: AITutorMode,
    memoryContext?: string
  ): Promise<{ responseText: string; codeSnippet?: string }> {
    const memoryAddon = memoryContext ? ` [Student Context: ${memoryContext}]` : "";
    
    switch (mode) {
      case "Explain":
        return {
          responseText: `### Core Intuition: ${query}\n\n${query} can be understood intuitively by breaking it down into fundamental components. ${memoryAddon}\n\n1. **Concept Overview**: It processes inputs systematically to arrive at an optimized output.\n2. **Why it Matters**: Eliminates unnecessary computation and provides predictable performance.\n3. **Practical Analogy**: Think of looking up a word in a dictionary by opening right to the middle.`,
          codeSnippet: `function binarySearch(arr: number[], target: number): number {\n  let left = 0;\n  let right = arr.length - 1;\n\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}`,
        };
      case "Summarize":
        return {
          responseText: `### Summary of Key Points\n\n- **Primary Takeaway**: Direct application of structured algorithms reduces complexity from $O(N)$ to $O(\\log N)$.\n- **Key Constraint**: Requires input data to be pre-sorted.\n- **Best Use Case**: Large datasets with frequent lookup operations.`,
        };
      case "Solve":
        return {
          responseText: `### Step-by-Step Problem Solution\n\n**Given Query**: ${query}\n\n1. **Step 1**: Identify initial parameters and constraints.\n2. **Step 2**: Apply iterative divide-and-conquer logic.\n3. **Step 3**: Verify base boundary conditions.\n\n$$\\text{Time Complexity}: O(\\log N) \\quad | \\quad \\text{Space Complexity}: O(1)$$`,
        };
      case "Quiz Me":
        return {
          responseText: `### Practice Question\n\n**Question**: If a sorted array contains 1,024 elements, what is the maximum number of comparisons required by Binary Search?\n\n- A) 10 comparisons\n- B) 512 comparisons\n- C) 1,024 comparisons\n- D) 32 comparisons\n\n*Hint: $2^{10} = 1024$*`,
        };
      case "Give Examples":
        return {
          responseText: `### Practical Real-World Examples\n\n1. **Database Indexing**: B-Trees use logarithmic search to find user records in millions of rows.\n2. **Version Control (\`git bisect\`)**: Pinpoints the exact commit that introduced a bug in code history.\n3. **AutoComplete Systems**: Narrows down word suggestions instantly.`,
        };
      case "Simplify":
        return {
          responseText: `### Plain English Explanation\n\nImagine guessing a number between 1 and 100. If someone tells you "too high" or "too low" after every guess, you guess 50 first. That cuts the remaining choices in half every single time!`,
        };
      case "Deep Dive":
        return {
          responseText: `### Deep Architectural Breakdown\n\nBinary search relies on **monotonicity**. As long as the search space has a strict order condition, we can apply binary decision boundaries.\n\n- **Memory Layout**: Sequential memory access benefits CPU cache lines.\n- **Edge Cases**: Integer overflow in \`mid = (left + right) / 2\` can be mitigated using \`left + Math.floor((right - left) / 2)\`.`,
        };
      default:
        return {
          responseText: `AI4Life Tutor response for query: "${query}" in mode "${mode}".`,
        };
    }
  }

  static async generateQuizFromDocument(
    docTitle: string,
    questionCount: number = 4,
    difficulty: "Easy" | "Medium" | "Hard" = "Medium"
  ): Promise<QuizQuestion[]> {
    return [
      {
        id: "q1",
        question: `Based on "${docTitle}", what is the primary prerequisite for logarithmic binary search?`,
        options: [
          "Data must be stored in a linked list",
          "Data must be strictly sorted",
          "Data must contain only positive integers",
          "Data must fit in CPU registers"
        ],
        correctOptionIndex: 1,
        explanation: "Binary search relies on monotonicity; the array or collection must be sorted to determine which half to eliminate."
      },
      {
        id: "q2",
        question: "What is the worst-case space complexity of iterative binary search?",
        options: ["O(N)", "O(log N)", "O(1)", "O(N^2)"],
        correctOptionIndex: 2,
        explanation: "Iterative binary search uses constant additional memory space O(1) for pointers."
      },
      {
        id: "q3",
        question: "Which operation is used in Git to locate a bug commit using binary search logic?",
        options: ["git commit", "git bisect", "git rebase", "git checkout"],
        correctOptionIndex: 1,
        explanation: "Git bisect performs a binary search through commit history to identify the commit that introduced a bug."
      },
      {
        id: "q4",
        question: "How does binary search prevent integer overflow when calculating the midpoint?",
        options: [
          "Using mid = (left + right) / 2",
          "Using mid = left + Math.floor((right - left) / 2)",
          "Using mid = right - left",
          "Using bitwise AND"
        ],
        correctOptionIndex: 1,
        explanation: "Calculating mid as left + (right - left) / 2 avoids potential overflow when left + right exceeds integer limits."
      }
    ].slice(0, questionCount);
  }

  static async generateChallengeMatch(topic: string): Promise<ChallengeMatch> {
    return {
      id: `match_${Date.now()}`,
      topic: topic || "Algorithms & Data Structures",
      question: "Which of the following sorting algorithms guarantees an O(N log N) worst-case time complexity?",
      options: ["Quick Sort", "Merge Sort", "Bubble Sort", "Insertion Sort"],
      correctOptionIndex: 1,
      aiAnswerIndex: 1,
      aiExplanation: "Merge Sort consistently divides the array into halves and merges them, guaranteeing O(N log N) time even in worst-case inputs.",
      studentScore: 0,
      aiScore: 0,
      xpEarned: 150
    };
  }

  static async generateStudyPlan(exam: string, daysAvailable: number): Promise<StudyTask[]> {
    return [
      {
        id: "task_1",
        dayLabel: "Day 1",
        topic: "Array Fundamentals & Two Pointers",
        subject: exam,
        estimatedMinutes: 60,
        completed: true
      },
      {
        id: "task_2",
        dayLabel: "Day 2",
        topic: "Binary Search & Divide and Conquer",
        subject: exam,
        estimatedMinutes: 75,
        completed: false
      },
      {
        id: "task_3",
        dayLabel: "Day 3",
        topic: "Trees & Graph Traversal (DFS/BFS)",
        subject: exam,
        estimatedMinutes: 90,
        completed: false
      },
      {
        id: "task_4",
        dayLabel: "Day 4",
        topic: "Dynamic Programming Foundations",
        subject: exam,
        estimatedMinutes: 90,
        completed: false
      }
    ];
  }
}
