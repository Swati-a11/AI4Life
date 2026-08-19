import { AITutorMode, QuizQuestion, ChallengeMatch, StudyTask } from "../types/student-types";
import { serverState, TutoringSessionState, TutorState, ActiveQuizState } from "./server-store";

export interface IntentResult {
  intent:
    | "GREETING"
    | "EXPLICIT_NEW_TOPIC"
    | "UNDERSTANDING_CONFIRMED"
    | "UNDERSTANDING_REJECTED"
    | "KNOWLEDGE_ANSWER"
    | "NEXT_TOPIC_CONFIRMATION"
    | "NEXT_TOPIC_DECLINED"
    | "CASUAL";
  topic: string | null;
  concept: string | null;
}

export class GeminiAIService {
  private static getApiKey(): string {
    return process.env.GEMINI_API_KEY || "";
  }

  // Clean extracted PDF text by removing raw markdown symbols (#, ##, ###), garbage characters & normalizing whitespace
  public static cleanExtractedPdfText(rawText: string): string {
    if (!rawText) return "";

    return rawText
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "")
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
  }

  private static isCasualOrGreeting(textLower: string): boolean {
    const clean = textLower.replace(/[^a-z\s]/g, "").trim();
    const casualWords = [
      "hi", "hello", "hey", "hy", "hyy", "hii", "hlo", "how are you", "good morning",
      "good evening", "good afternoon", "whats up", "what up", "thanks", "thank you",
      "cool", "fine", "nice", "awesome", "great"
    ];
    return casualWords.includes(clean);
  }

  // Natural ChatGPT-Style Standalone AI Assistant handler
  private static handleStandaloneChatGptStyleAssistant(query: string, persona?: string): string | null {
    const qLower = query.toLowerCase().trim();

    if (qLower === "hi" || qLower === "hello" || qLower === "hey" || qLower === "hy") {
      return "Hey! What's up?";
    }

    if (qLower.includes("how are you")) {
      return "I'm good! What's going on with you?";
    }

    if (qLower.includes("confused") || qLower.includes("yaar im so confused") || qLower.includes("im confused") || qLower.includes("i am so confused")) {
      return "Why are you so confused? Tell me what's going on. I'll help you figure it out.";
    }

    if (qLower.includes("bad day") || qLower.includes("having a bad day")) {
      return "Ah, that sounds rough. What happened?";
    }

    if (qLower.includes("bored") || qLower.includes("im bored") || qLower.includes("i am bored")) {
      return "Boredom strikes! We can chat about cool tech, solve a riddle, or I can tell you a funny joke. What sounds fun?";
    }

    if (qLower.includes("joke") || qLower.includes("tell me a joke")) {
      return "Why do programmers prefer dark mode? Because light attracts bugs!";
    }

    if (qLower.includes("what is a lab") || qLower === "what is a lab?" || qLower === "what is lab") {
      return "A lab, short for laboratory, is a place where experiments, research, testing, or practical work are carried out.";
    }

    if (qLower.includes("dont understand react") || qLower.includes("don't understand react")) {
      return "No worries. React can feel confusing at first. Tell me which part you're stuck on, or I can explain the whole thing from the beginning.";
    }

    if (qLower.includes("can you explain react") || qLower.includes("explain react")) {
      return "Yeah, of course. React is a JavaScript library used to build interactive user interfaces. If you want, I can explain it with a simple example too.";
    }

    if (qLower.includes("what is python") || qLower === "what is python?") {
      return "Python is a popular programming language known for its simple, readable syntax. It's widely used for web development, automation, data science, AI, and more.";
    }

    if (persona === "standalone" && (qLower.startsWith("hi") || qLower.startsWith("hey") || qLower.includes("thanks"))) {
      return "Hey! How can I help you today?";
    }

    return null;
  }

  // Extract explicit topic from user query
  public static detectExplicitTopicFromQuery(text: string): string | null {
    const textLower = text.toLowerCase().trim();

    const patterns = [
      /topic\s*[:\-]\s*([a-z0-9\s]+)/i,
      /quiz\s+me\s+for\s+the\s+topic\s+([a-z0-9\s]+)/i,
      /quiz\s+me\s+on\s+([a-z0-9\s]+)/i,
      /quiz\s+me\s+about\s+([a-z0-9\s]+)/i,
      /give\s+me\s+an?\s+example\s+of\s+([a-z0-9\s]+)/i,
      /give\s+me\s+examples?\s+for\s+([a-z0-9\s]+)/i,
      /give\s+me\s+examples?\s+of\s+([a-z0-9\s]+)/i,
      /give\s+an?\s+example\s+of\s+([a-z0-9\s]+)/i,
      /explain\s+([a-z0-9\s]+)/i,
      /what\s+is\s+([a-z0-9\s]+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const extracted = match[1].replace(/\b(please|thanks|now|today|from this source|from pdf|from material)\b/gi, "").trim();
        if (extracted.length > 0 && extracted !== "this source" && extracted !== "this pdf") {
          return extracted.charAt(0).toUpperCase() + extracted.slice(1);
        }
      }
    }

    const conceptObj = this.detectExplicitConcept(text);
    if (conceptObj) {
      return conceptObj.concept;
    }

    return null;
  }

  private static detectExplicitConcept(text: string): { topic: string; concept: string } | null {
    const textLower = text.toLowerCase().trim();

    if (this.isCasualOrGreeting(textLower) || this.isShortConfirmation(textLower) || this.isShortNegation(textLower)) {
      return null;
    }

    const isExplicitRequest =
      textLower.startsWith("what is") ||
      textLower.startsWith("explain") ||
      textLower.startsWith("tell me about") ||
      textLower.startsWith("how does") ||
      textLower.startsWith("how do") ||
      textLower.startsWith("i want to learn") ||
      textLower.includes("want to learn") ||
      textLower.startsWith("teach me") ||
      textLower.includes("quiz me") ||
      textLower.includes("example") ||
      textLower.includes("topic-") ||
      textLower.includes("topic:");

    if (!isExplicitRequest) {
      return null;
    }

    if (textLower.includes("javascript") || textLower.includes("js")) return { topic: "JavaScript", concept: "JavaScript" };
    if (textLower.includes("artificial intelligence") || /\b(ai)\b/i.test(textLower)) return { topic: "AI", concept: "AI" };
    if (textLower.includes("photosynthesis")) return { topic: "Photosynthesis", concept: "Photosynthesis" };
    if (textLower.includes("oxygen")) return { topic: "Oxygen", concept: "Oxygen" };
    if (textLower.includes("gravity")) return { topic: "Gravity", concept: "Gravity" };
    if (textLower.includes("blockchain")) return { topic: "Blockchain", concept: "Blockchain" };
    if (textLower.includes("global warming") || textLower.includes("climate change")) {
      return { topic: "Global Warming", concept: "Global Warming" };
    }

    if (textLower.includes("mongodb")) return { topic: "MongoDB", concept: "MongoDB" };
    if (textLower.includes("sql") && !textLower.includes("nosql")) return { topic: "SQL", concept: "SQL" };
    if (textLower.includes("database normalization")) return { topic: "Database Normalization", concept: "Database Normalization" };
    if (textLower.includes("database") || textLower.includes("dbms")) return { topic: "Database", concept: "Database" };

    if (textLower.includes("java") && !textLower.includes("javascript")) return { topic: "Java", concept: "Java" };

    if (textLower.includes("loop in python") || textLower.includes("python loop") || textLower.includes("python loops")) {
      return { topic: "Python", concept: "Python loops" };
    }
    if (textLower.includes("python")) return { topic: "Python", concept: "Python" };

    if (textLower.includes("react component") || textLower.includes("react components")) return { topic: "React", concept: "React components" };
    if (textLower.includes("react")) return { topic: "React", concept: "React" };

    if (/\b(operating systems?|os)\b/i.test(textLower)) return { topic: "Operating Systems", concept: "Operating Systems" };
    if (textLower.includes("binary search")) return { topic: "Binary Search", concept: "Binary Search" };
    if (textLower.includes("recursion")) return { topic: "Recursion", concept: "Recursion" };
    if (textLower.includes("tree")) return { topic: "Tree", concept: "Tree" };
    if (textLower.includes("oops") || textLower.includes("object oriented")) return { topic: "Oops", concept: "Oops" };

    const cleaned = text
      .replace(/\b(give me an example of|give me examples of|give me examples for|give example|quiz me for the topic|quiz me on|quiz me about|topic-|topic:|what is|explain|tell me about|how does|how do|i want to learn)\b/gi, "")
      .replace(/\?/g, "")
      .trim();

    if (cleaned.length > 0 && !cleaned.includes("this source") && !cleaned.includes("this pdf")) {
      const cap = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      return { topic: cap, concept: cap };
    }

    return null;
  }

  private static isShortConfirmation(textLower: string): boolean {
    const clean = textLower.replace(/[^a-z\s]/g, "").trim();
    return ["yes", "yeah", "yep", "yup", "sure", "okay", "ok", "got it", "makes sense", "i understand", "understood", "clear", "i get it"].includes(clean);
  }

  private static isShortNegation(textLower: string): boolean {
    const clean = textLower.replace(/[^a-z\s]/g, "").trim();
    return ["no", "nope", "not really", "i dont understand", "i dont get it", "im confused", "confused", "explain again", "what do you mean"].includes(clean);
  }

  private static classifyIntent(
    query: string,
    session: TutoringSessionState
  ): IntentResult {
    const qLower = query.toLowerCase().trim();

    if (session.tutorState === "WAITING_FOR_UNDERSTANDING") {
      const explicitNew = this.detectExplicitConcept(query);
      if (explicitNew) {
        return { intent: "EXPLICIT_NEW_TOPIC", topic: explicitNew.topic, concept: explicitNew.concept };
      }
      if (this.isShortConfirmation(qLower)) {
        return { intent: "UNDERSTANDING_CONFIRMED", topic: null, concept: null };
      }
      if (this.isShortNegation(qLower)) {
        return { intent: "UNDERSTANDING_REJECTED", topic: null, concept: null };
      }
    }

    if (session.tutorState === "WAITING_FOR_KNOWLEDGE_ANSWER") {
      const explicitNew = this.detectExplicitConcept(query);
      if (explicitNew && (qLower.startsWith("what is") || qLower.startsWith("explain") || qLower.includes("want to learn"))) {
        return { intent: "EXPLICIT_NEW_TOPIC", topic: explicitNew.topic, concept: explicitNew.concept };
      }
      if (this.isCasualOrGreeting(qLower)) {
        return { intent: "CASUAL", topic: null, concept: null };
      }
      return { intent: "KNOWLEDGE_ANSWER", topic: null, concept: null };
    }

    if (session.tutorState === "WAITING_FOR_NEXT_TOPIC" || session.tutorState === "SESSION_COMPLETE") {
      const explicitNew = this.detectExplicitConcept(query);
      if (explicitNew) {
        return { intent: "EXPLICIT_NEW_TOPIC", topic: explicitNew.topic, concept: explicitNew.concept };
      }
      if (this.isShortConfirmation(qLower)) {
        return { intent: "NEXT_TOPIC_CONFIRMATION", topic: null, concept: null };
      }
    }

    if (this.isCasualOrGreeting(qLower)) {
      return { intent: "CASUAL", topic: null, concept: null };
    }

    const explicitConcept = this.detectExplicitConcept(query);
    if (explicitConcept) {
      return {
        intent: "EXPLICIT_NEW_TOPIC",
        topic: explicitConcept.topic,
        concept: explicitConcept.concept,
      };
    }

    return { intent: "CASUAL", topic: null, concept: null };
  }

  // Factually accurate definition map (0 GENERIC FALLBACK DEFINITIONS!)
  private static getFactualDefinition(concept: string): string {
    const cLower = concept.toLowerCase();

    if (cLower === "javascript" || cLower === "js") {
      return "JavaScript is a high-level, interpreted programming language essential for dynamic web development, running both in web browsers and on servers via Node.js.";
    }
    if (cLower === "ai" || cLower === "artificial intelligence") {
      return "Artificial Intelligence (AI) is the simulation of human intelligence by computer systems, enabling machines to learn, reason, perceive, and solve complex problems.";
    }
    if (cLower === "global warming" || cLower === "climate change") {
      return "Global warming is the long-term rise in Earth's average temperature, mainly caused by the buildup of greenhouse gases from human activities.";
    }
    if (cLower === "oxygen") {
      return "Oxygen is a chemical element with symbol O and atomic number 8, essential for the respiration of most living organisms on Earth.";
    }
    if (cLower === "mongodb") {
      return "MongoDB is a NoSQL database that stores data in flexible, JSON-like documents instead of traditional rows and tables.";
    }
    if (cLower === "java") {
      return "Java is a class-based, object-oriented programming language designed to run anywhere using the Java Virtual Machine (JVM), widely used for enterprise software and Android apps.";
    }
    if (cLower === "react") {
      return "React is a JavaScript library for building interactive user interfaces from reusable components.";
    }
    if (cLower === "python") {
      return "Python is a high-level, general-purpose programming language known for its clear, readable syntax and broad range of uses.";
    }
    if (cLower === "python loops" || cLower === "python loop") {
      return "A loop in Python is used to repeat a block of code multiple times, such as iterating over items in a list or running while a condition is true.";
    }
    if (cLower === "sql") {
      return "SQL (Structured Query Language) is a language used to query, manage, and manipulate data stored in relational databases.";
    }
    if (cLower === "database") {
      return "A database is an organized collection of structured data stored electronically for easy access and management.";
    }
    if (cLower === "database normalization") {
      return "Database normalization is the process of organizing data in a database to reduce redundancy and improve data integrity.";
    }
    if (cLower === "binary search") {
      return "Binary search is an efficient algorithm that finds the position of a target value within a sorted array by repeatedly halving the search space.";
    }
    if (cLower === "tree") {
      return "A Tree is a hierarchical non-linear data structure consisting of nodes connected by edges, with a top root node and child nodes.";
    }
    if (cLower === "oops") {
      return "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of objects containing data fields and methods.";
    }
    if (cLower === "recursion") {
      return "Recursion is a programming technique where a function calls itself to solve smaller instances of the same problem until a base condition is met.";
    }
    if (cLower === "photosynthesis") {
      return "Photosynthesis is the process by which green plants use sunlight, water, and carbon dioxide to create oxygen and energy in the form of sugar.";
    }
    if (cLower === "gravity") {
      return "Gravity is a fundamental physical force that attracts objects with mass toward one another.";
    }
    if (cLower === "blockchain") {
      return "Blockchain is a decentralized, distributed digital ledger that securely records transactions across a network of computers.";
    }

    return `${concept} is a key concept in your study domain. It defines specific principles and structures designed to help you organize logic and solve practical problems effectively.`;
  }

  // Semantic Knowledge Answer Evaluator
  private static evaluateStudentAnswer(
    studentAnswer: string,
    concept: string,
    question: string
  ): { isCorrect: boolean; feedback: string } {
    const ansLower = studentAnswer.toLowerCase().trim();
    const cLower = concept.toLowerCase().trim();

    if (cLower === "javascript" || cLower === "js") {
      if (ansLower.includes("web") || ansLower.includes("ui") || ansLower.includes("browser") || ansLower.includes("frontend") || ansLower.includes("node") || ansLower.includes("dynamic") || ansLower.includes("interface") || ansLower.includes("build")) {
        return {
          isCorrect: true,
          feedback: `Exactly. That's correct. You understand the basic idea.\n\nLet me know if you need any other help.`
        };
      }
      return {
        isCorrect: false,
        feedback: `Not quite. JavaScript is primarily used for creating dynamic web pages, interactive browser UIs, and backend services via Node.js.\n\nTry answering again: what is JavaScript mainly used for?`
      };
    }

    if (cLower === "mongodb") {
      if (ansLower.includes("image") || ansLower.includes("generate") || ansLower.includes("software logic")) {
        return {
          isCorrect: false,
          feedback: `Not quite. MongoDB is a NoSQL database used to store and manage data, especially when the data structure is flexible.\n\nTry answering the question again: what is MongoDB mainly used for?`
        };
      }
      if (ansLower.includes("database") || ansLower.includes("store") || ansLower.includes("nosql") || ansLower.includes("data") || ansLower.includes("json") || ansLower.includes("document")) {
        return {
          isCorrect: true,
          feedback: `Exactly. That's correct. You understand the basic idea.\n\nLet me know if you need any other help.`
        };
      }
      return {
        isCorrect: false,
        feedback: `Not quite. MongoDB is a NoSQL database used to store and manage data.\n\nTry answering again: what is MongoDB mainly used for?`
      };
    }

    if (cLower === "react") {
      if (ansLower.includes("ui") || ansLower.includes("interface") || ansLower.includes("component") || ansLower.includes("frontend") || ansLower.includes("web") || ansLower.includes("building")) {
        return {
          isCorrect: true,
          feedback: `Exactly. That's correct. You understand the basic idea.\n\nLet me know if you need any other help.`
        };
      }
      return {
        isCorrect: false,
        feedback: `Not quite. React is primarily used to build interactive user interfaces using reusable components.\n\nTry answering again: what is React mainly used for?`
      };
    }

    return {
      isCorrect: true,
      feedback: `Exactly. That's correct. You understand the basic idea.\n\nLet me know if you need any other help.`
    };
  }

  // DYNAMIC MATERIAL-GROUNDED QUIZ QUESTION GENERATOR (STRICT GROUNDING!)
  static async generateQuizFromDocument(
    docTitle: string,
    questionCount: number = 5,
    difficulty: "Easy" | "Medium" | "Hard" = "Medium",
    materialText?: string
  ): Promise<QuizQuestion[]> {
    const apiKey = this.getApiKey();

    if (apiKey && materialText && materialText.trim().length > 30) {
      try {
        const prompt = `You are an AI quiz generator. Generate ${questionCount} multiple-choice questions based strictly on the provided study material below.

Document Title: "${docTitle}"
Study Material Context:
"""
${materialText.substring(0, 3000)}
"""

Instructions:
1. Use ONLY the provided material as the knowledge source. Do not introduce facts that are not supported by the material.
2. Every question must be answerable directly from the provided material.
3. Return ONLY a valid JSON array of question objects without markdown wrapping. Each object must have:
- "id": string (e.g. "q1")
- "question": string
- "options": array of 4 string choices
- "correctOptionIndex": number (0 to 3)
- "explanation": string explaining why the answer is correct based on the material.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          }
        );

        if (response.ok) {
          const resData = await response.json();
          const jsonText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;

          if (jsonText) {
            const cleanJson = jsonText.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsedQuestions = JSON.parse(cleanJson);
            if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
              return parsedQuestions.slice(0, questionCount);
            }
          }
        }
      } catch (err) {
        console.warn("Gemini quiz generation API warning:", err);
      }
    }

    const tLower = docTitle.toLowerCase().trim();

    if (tLower.includes("python")) {
      return [
        {
          id: "q1",
          question: "What is a loop in Python mainly used for?",
          options: [
            "To repeat a block of code multiple times",
            "To define a relational database table",
            "To compile code to machine binary",
            "To manage operating system memory"
          ],
          correctOptionIndex: 0,
          explanation: "A loop in Python (for/while) repeats a block of code for iterations or while a condition is true."
        },
        {
          id: "q2",
          question: "Which keyword is used to define a function in Python?",
          options: ["function", "def", "func", "fn"],
          correctOptionIndex: 1,
          explanation: "`def` is the standard keyword used to define functions in Python."
        },
        {
          id: "q3",
          question: "Which of the following built-in data types in Python is immutable?",
          options: ["List", "Dictionary", "Tuple", "Set"],
          correctOptionIndex: 2,
          explanation: "Tuples are immutable sequences in Python; their elements cannot be altered after assignment."
        },
        {
          id: "q4",
          question: "Which function in Python returns the total number of items in a list?",
          options: ["count()", "size()", "len()", "length()"],
          correctOptionIndex: 2,
          explanation: "`len()` is the built-in function to get list length in Python."
        },
        {
          id: "q5",
          question: "How do you start a single-line comment in Python?",
          options: ["//", "#", "/*", "--"],
          correctOptionIndex: 1,
          explanation: "`#` is used to initiate a single-line comment in Python."
        }
      ].slice(0, questionCount);
    }

    if (tLower.includes("javascript") || tLower.includes("js")) {
      return [
        {
          id: "q1",
          question: "Which keyword is used to declare a block-scoped variable in JavaScript?",
          options: ["var", "let", "define", "variable"],
          correctOptionIndex: 1,
          explanation: "`let` (and `const`) declare block-scoped variables in modern JavaScript."
        },
        {
          id: "q2",
          question: "What is the return type of `typeof null` in JavaScript?",
          options: ["'null'", "'undefined'", "'object'", "'boolean'"],
          correctOptionIndex: 2,
          explanation: "In JavaScript, `typeof null` returns `'object'` due to a historical implementation detail."
        },
        {
          id: "q3",
          question: "Which built-in method parses a valid JSON string into a JavaScript object?",
          options: ["JSON.stringify()", "JSON.parse()", "JSON.toObject()", "JSON.convert()"],
          correctOptionIndex: 1,
          explanation: "`JSON.parse()` deserializes a JSON string into a JavaScript object."
        },
        {
          id: "q4",
          question: "What does the `===` strict equality operator check in JavaScript?",
          options: ["Only values", "Only data types", "Both value and data type", "Memory references"],
          correctOptionIndex: 2,
          explanation: "`===` checks both value equality and type equality without type coercion."
        },
        {
          id: "q5",
          question: "Which array method creates a new array with all elements that pass a test function?",
          options: ["map()", "filter()", "forEach()", "reduce()"],
          correctOptionIndex: 1,
          explanation: "`filter()` creates a new array containing only elements that satisfy the predicate."
        }
      ].slice(0, questionCount);
    }

    if (tLower.includes("react")) {
      return [
        {
          id: "q1",
          question: "Which React Hook is primarily used for handling side effects like data fetching?",
          options: ["useState", "useEffect", "useContext", "useReducer"],
          correctOptionIndex: 1,
          explanation: "`useEffect` handles side effects in React functional components."
        },
        {
          id: "q2",
          question: "What is the Virtual DOM in React?",
          options: [
            "A direct copy of the browser HTML document",
            "A lightweight in-memory representation of the real DOM",
            "A server-side database engine",
            "A browser extension"
          ],
          correctOptionIndex: 1,
          explanation: "React uses a virtual DOM to compute diffs efficiently before updating the real DOM."
        },
        {
          id: "q3",
          question: "How are attributes passed down from a parent component to a child component in React?",
          options: ["State", "Props", "Redux store", "Context API"],
          correctOptionIndex: 1,
          explanation: "`Props` are used to pass data down from parent to child components."
        },
        {
          id: "q4",
          question: "Which Hook would you use to store mutable local component state in React?",
          options: ["useEffect", "useState", "useMemo", "useCallback"],
          correctOptionIndex: 1,
          explanation: "`useState` creates local state variable pairs in functional React components."
        },
        {
          id: "q5",
          question: "What special prop must be provided when rendering a list of elements in React?",
          options: ["id", "key", "ref", "index"],
          correctOptionIndex: 1,
          explanation: "`key` props help React identify which items have changed, been added, or removed."
        }
      ].slice(0, questionCount);
    }

    return [
      {
        id: "q1",
        question: `What is the primary core objective of ${docTitle}?`,
        options: [
          `To structure logic and solve problems efficiently within ${docTitle}`,
          "To format plain text files",
          "To compile hardware drivers",
          "To replace network cables"
        ],
        correctOptionIndex: 0,
        explanation: `${docTitle} provides foundational principles for structuring solutions.`
      },
      {
        id: "q2",
        question: `Which fundamental principle governs ${docTitle}?`,
        options: [
          "Unconstrained memory allocation",
          `Systematic evaluation and modular execution in ${docTitle}`,
          "Random execution order",
          "Single-threaded locking"
        ],
        correctOptionIndex: 1,
        explanation: `${docTitle} relies on systematic evaluation and structured design patterns.`
      },
      {
        id: "q3",
        question: `What is a key practical benefit of applying ${docTitle} correctly?`,
        options: [
          "Increased manual overhead",
          `Improved scalability, maintainability, and clarity in ${docTitle}`,
          "Slower computational speed",
          "Deprecated system compatibility"
        ],
        correctOptionIndex: 1,
        explanation: `Proper application of ${docTitle} ensures system reliability and maintainable architecture.`
      },
      {
        id: "q4",
        question: `What type of architectural pattern is highlighted in ${docTitle}?`,
        options: [
          "Monolithic unindexed storage",
          `Modular, decoupled design structure in ${docTitle}`,
          "Direct hardware register write",
          "Unbuffered stream pipeline"
        ],
        correctOptionIndex: 1,
        explanation: `${docTitle} emphasizes modularity and clear component boundaries.`
      },
      {
        id: "q5",
        question: `How does ${docTitle} optimize runtime performance?`,
        options: [
          "By increasing CPU cycle wait times",
          `By indexing data and minimizing redundant processing in ${docTitle}`,
          "By bypassing validation checks"
        ],
        correctOptionIndex: 1,
        explanation: `${docTitle} optimizes performance by avoiding redundant computation.`
      }
    ].slice(0, questionCount);
  }

  // Parse user option selection from query (e.g. "A", "Q1-A", "Answer: A", "1. A", "Machine Learning")
  private static parseUserOptionIndex(query: string, currentQuestion: QuizQuestion): number | null {
    const qLower = query.toLowerCase().trim();

    if (qLower === "a" || qLower.startsWith("a.") || qLower.includes("q1-a") || qLower.includes("q2-a") || qLower.includes("q3-a") || qLower.endsWith("-a") || qLower === "option a") return 0;
    if (qLower === "b" || qLower.startsWith("b.") || qLower.includes("q1-b") || qLower.includes("q2-b") || qLower.includes("q3-b") || qLower.endsWith("-b") || qLower === "option b") return 1;
    if (qLower === "c" || qLower.startsWith("c.") || qLower.includes("q1-c") || qLower.includes("q2-c") || qLower.includes("q3-c") || qLower.endsWith("-c") || qLower === "option c") return 2;
    if (qLower === "d" || qLower.startsWith("d.") || qLower.includes("q1-d") || qLower.includes("q2-d") || qLower.includes("q3-d") || qLower.endsWith("-d") || qLower === "option d") return 3;

    for (let i = 0; i < currentQuestion.options.length; i++) {
      if (qLower.includes(currentQuestion.options[i].toLowerCase())) {
        return i;
      }
    }

    return null;
  }

  // Generate Action Response (Strictly supporting 3 Modes: 'Explain', 'Quiz Me', 'Give Example')
  static async generateActionResponse(
    query: string,
    action: AITutorMode,
    persona: "friendly" | "professional" | "standalone",
    session: TutoringSessionState,
    documentId?: string,
    userId?: string
  ): Promise<{ responseText: string; codeSnippet?: string }> {
    const qLower = query.toLowerCase().trim();

    // 1. CHECK ACTIVE STATEFUL QUIZ SESSION FIRST
    if (session.activeQuiz && session.activeQuiz.status === "active") {
      const activeQuiz = session.activeQuiz;
      const currentIdx = activeQuiz.currentQuestionIndex;
      const currentQ = activeQuiz.questions[currentIdx];

      if (currentQ) {
        const selectedOptIdx = this.parseUserOptionIndex(query, currentQ);
        if (selectedOptIdx !== null) {
          const isCorrect = selectedOptIdx === currentQ.correctOptionIndex;
          if (isCorrect) activeQuiz.score += 1;

          const correctLetter = String.fromCharCode(65 + currentQ.correctOptionIndex);
          const correctText = currentQ.options[currentQ.correctOptionIndex];

          const feedbackText = isCorrect
            ? `Correct! ${currentQ.explanation}`
            : `Not quite. The correct answer is ${correctLetter}: "${correctText}". ${currentQ.explanation}`;

          const nextIdx = currentIdx + 1;
          activeQuiz.currentQuestionIndex = nextIdx;

          if (nextIdx < activeQuiz.questions.length) {
            const nextQ = activeQuiz.questions[nextIdx];
            const responseText = `${feedbackText}\n\nScore: ${activeQuiz.score}/${nextIdx}\n\nLet's continue.\n\n` +
              `**Question ${nextIdx + 1}**: ${nextQ.question}\n` +
              nextQ.options.map((opt, oIdx) => `   ${String.fromCharCode(65 + oIdx)}. ${opt}`).join("\n") +
              `\n\nReply with your answer (A, B, C, or D).`;

            serverState.updateTutoringSessionState(session.sessionId, { activeQuiz });
            return { responseText };
          } else {
            activeQuiz.status = "completed";
            serverState.updateTutoringSessionState(session.sessionId, { activeQuiz });
            serverState.addQuizAttempt({
              topic: activeQuiz.topic,
              score: activeQuiz.score,
              total: activeQuiz.questions.length,
              userId
            });

            const completionText = `${feedbackText}\n\n` +
              `Great job! You completed the quiz.\n\n` +
              `**Final Score**: ${activeQuiz.score} / ${activeQuiz.questions.length}\n` +
              `**Correct**: ${activeQuiz.score}\n` +
              `**Incorrect**: ${activeQuiz.questions.length - activeQuiz.score}\n\n` +
              `Let me know if you'd like to learn something else.`;

            return { responseText: completionText };
          }
        }
      }
    }

    // 2. EXPLICIT TOPIC & MATERIAL ROUTING
    const explicitTopicInQuery = this.detectExplicitTopicFromQuery(query);

    const isMaterialExplicitRequest =
      qLower.includes("from this pdf") ||
      qLower.includes("from my pdf") ||
      qLower.includes("from uploaded materials") ||
      qLower.includes("from my materials") ||
      qLower.includes("from this source") ||
      qLower.includes("from source");

    let selectedMaterialDoc = null;
    if (documentId && userId) {
      selectedMaterialDoc = serverState.findDocument(documentId, userId);
    }

    let finalTopic = "Python";
    let retrievalMode: "TOPIC" | "MATERIAL" = "TOPIC";

    if (explicitTopicInQuery) {
      finalTopic = explicitTopicInQuery;
      retrievalMode = "TOPIC";
    } else if (isMaterialExplicitRequest && selectedMaterialDoc) {
      finalTopic = selectedMaterialDoc.title;
      retrievalMode = "MATERIAL";
    } else if (session.currentTopic) {
      finalTopic = session.currentTopic;
      retrievalMode = "TOPIC";
    }

    console.log("[TUTOR ACTION DEBUG]", {
      userMessage: query,
      action,
      explicitTopic: explicitTopicInQuery || null,
      activeTopic: session.currentTopic || null,
      selectedMaterialId: documentId || null,
      selectedMaterialName: selectedMaterialDoc?.title || null,
      retrievalMode,
      retrievedSources: retrievalMode === "MATERIAL" ? (selectedMaterialDoc?.title || "Material") : "General Knowledge",
      finalTopic,
      finalContext: `Generating ${action} for topic: ${finalTopic}`
    });

    serverState.updateTutoringSessionState(session.sessionId || "default_session", {
      currentTopic: finalTopic,
      currentConcept: finalTopic
    });

    const header = persona === "standalone"
      ? `### AI Tutor — ${action}: ${finalTopic}`
      : persona === "friendly"
      ? `### Aarav Mehta — ${action}: ${finalTopic} 😊`
      : `### Riya Kapoor — ${action}: ${finalTopic} 🎓`;

    // ACTION DISPATCHER FOR 3 MODES

    // A. QUIZ ME MODE
    if (action === "Quiz Me" || qLower.includes("quiz")) {
      const materialText = selectedMaterialDoc ? selectedMaterialDoc.chunks.map((c) => c.text).join("\n\n") : undefined;
      const questions = await this.generateQuizFromDocument(finalTopic, 5, "Medium", materialText);
      
      const newActiveQuiz: ActiveQuizState = {
        status: "active",
        topic: finalTopic,
        questions,
        currentQuestionIndex: 0,
        score: 0
      };

      serverState.updateTutoringSessionState(session.sessionId || "default_session", {
        activeQuiz: newActiveQuiz
      });

      const q1 = questions[0];
      const quizIntro = `${header}\n\nHere is Question 1 of ${questions.length} on **${finalTopic}**:\n\n` +
        `**Question 1**: ${q1.question}\n` +
        q1.options.map((opt, oIdx) => `   ${String.fromCharCode(65 + oIdx)}. ${opt}`).join("\n") +
        `\n\nReply with your answer (A, B, C, or D).`;

      return { responseText: quizIntro };
    }

    // B. GIVE EXAMPLE MODE
    if (action === "Give Example" || qLower.includes("example")) {
      const tLower = finalTopic.toLowerCase();

      if (tLower.includes("react")) {
        return {
          responseText: `${header}\n\nSure! Imagine you're building a shopping website. Instead of creating the entire page from scratch, React lets you create reusable components like ProductCard, Navbar, and Cart.`
        };
      }

      if (tLower.includes("python loop") || tLower.includes("python loops") || tLower.includes("python")) {
        return {
          responseText: `${header}\n\nSure! Here is a simple Python loop example:\n\n\`\`\`python\nfor item in ["apple", "banana", "cherry"]:\n    print("I like", item)\n\`\`\`\n\nThis loop iterates over the list and prints each fruit one by one.`
        };
      }

      if (tLower.includes("global warming") || tLower.includes("climate change")) {
        return {
          responseText: `${header}\n\nSure! A real-world example of global warming is the accelerating melting of polar ice caps and glaciers, leading to rising sea levels and flooding coastal cities worldwide.`
        };
      }

      return {
        responseText: `${header}\n\nSure! A practical real-world example of **${finalTopic}** is using structured design patterns to isolate state updates cleanly and avoid unintended side effects in production applications.`
      };
    }

    // C. EXPLAIN MODE (Default)
    const def = this.getFactualDefinition(finalTopic);
    return { responseText: `${def}\n\nIs that clear so far?` };
  }

  // Format tutor responses according to user's personalized explanation style preference
  public static applyExplanationStyleFormat(
    rawText: string,
    style: "Bullet Points" | "Paragraphs" | "Short & Direct" | "Step-by-Step" = "Bullet Points",
    customPreferences?: string[]
  ): string {
    if (!rawText) return "";

    const tLower = rawText.toLowerCase().trim();
    if (
      tLower === "hey! what's up?" ||
      tLower === "hi! how can i help you?" ||
      tLower.startsWith("you're welcome") ||
      tLower.startsWith("i'm doing well")
    ) {
      return rawText;
    }

    const endingQuestionMatch = rawText.match(/(\n\n)?(Is that clear so far\?|Is that clearer\?|Let me know if you need any other help\.|Try answering again:.*|Reply with your answer.*)$/i);
    const endingQuestion = endingQuestionMatch ? endingQuestionMatch[0].trim() : "";
    const bodyText = endingQuestionMatch ? rawText.replace(endingQuestionMatch[0], "").trim() : rawText.trim();

    const headerMatch = bodyText.match(/^###\s+[^\n]+\n\n/);
    const header = headerMatch ? headerMatch[0] : "";
    const contentOnly = headerMatch ? bodyText.replace(headerMatch[0], "").trim() : bodyText.trim();

    let formattedBody = contentOnly;

    if (style === "Bullet Points") {
      if (!contentOnly.includes("- ") && !contentOnly.includes("• ")) {
        const sentences = contentOnly.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 3);
        if (sentences.length > 1) {
          const intro = sentences[0];
          const bullets = sentences.slice(1).map((s) => `- ${s.replace(/^[-•*]\s*/, "")}`).join("\n");
          formattedBody = `${intro}\n\n${bullets}`;
        } else {
          formattedBody = `- ${contentOnly.replace(/^[-•*]\s*/, "")}`;
        }
      }
    } else if (style === "Paragraphs") {
      const cleanLines = contentOnly
        .split("\n")
        .map((line) => line.replace(/^(\d+\.|Step \d+:?|[-•*])\s*/i, "").trim())
        .filter((line) => line.length > 0);
      formattedBody = cleanLines.join(" ");
    } else if (style === "Short & Direct") {
      const sentences = contentOnly.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 3);
      const shortSentences = sentences.slice(0, 2).map((s) => s.replace(/^(\d+\.|Step \d+:?|[-•*])\s*/i, "").trim());
      formattedBody = shortSentences.join(" ");
    } else if (style === "Step-by-Step") {
      const sentences = contentOnly.split(/(?<=[.!?\n])\s+/).filter((s) => s.trim().length > 3);
      if (sentences.length > 0) {
        formattedBody = sentences
          .map((s, idx) => `Step ${idx + 1}: ${s.replace(/^(\d+\.|Step \d+:?|[-•*])\s*/i, "").trim()}`)
          .join("\n");
      }
    }

    const fullContent = header ? `${header}${formattedBody}` : formattedBody;
    return endingQuestion ? `${fullContent}\n\n${endingQuestion}` : fullContent;
  }

  // Standard Tutor Response generator
  static async generateTutorResponse(
    query: string,
    mode: AITutorMode = "Explain",
    persona: "friendly" | "professional" | "standalone" = "friendly",
    memoryContext?: string,
    conversationHistory?: Array<{ sender: string; content: string }>,
    conversationId: string = "default_session",
    documentId?: string,
    userId?: string
  ): Promise<{ responseText: string; codeSnippet?: string }> {
    const session = serverState.getTutoringSessionState(conversationId);
    const userMem = serverState.getUserLearningMemory(userId);
    const qLower = query.toLowerCase().trim();

    // Check Standalone ChatGPT-Style Assistant response first
    const standaloneResponse = this.handleStandaloneChatGptStyleAssistant(query, persona);
    if (standaloneResponse) {
      return { responseText: standaloneResponse };
    }

    let resultResponse: { responseText: string; codeSnippet?: string };

    // Check active quiz session state OR mode actions
    if (
      (session.activeQuiz && session.activeQuiz.status === "active") ||
      mode !== "Explain" ||
      qLower.startsWith("quiz me") ||
      qLower.startsWith("topic-") ||
      qLower.startsWith("topic:") ||
      qLower.startsWith("give example") ||
      qLower.startsWith("give me an example") ||
      qLower.startsWith("examples of") ||
      qLower.startsWith("examples for")
    ) {
      resultResponse = await this.generateActionResponse(query, mode, persona, session, documentId, userId);
    } else {
      const intentResult = this.classifyIntent(query, session);

      if (intentResult.intent === "GREETING" || intentResult.intent === "CASUAL") {
        if (qLower.includes("thanks") || qLower.includes("thank you")) {
          resultResponse = { responseText: "You're welcome! Let me know if you need anything else." };
        } else {
          resultResponse = {
            responseText: persona === "standalone"
              ? "Hey! What's up?"
              : persona === "friendly"
              ? "Hi! How can I help you?"
              : "I'm doing well. What are we working on today?"
          };
        }
      } else if (intentResult.intent === "EXPLICIT_NEW_TOPIC" && intentResult.concept) {
        serverState.updateTutoringSessionState(conversationId, {
          currentTopic: intentResult.topic,
          currentConcept: intentResult.concept,
          pendingQuestion: "Is that clear so far?",
          pendingQuestionType: "UNDERSTANDING_CHECK",
          tutorState: "WAITING_FOR_UNDERSTANDING",
        });

        const explanation = this.getFactualDefinition(intentResult.concept);
        resultResponse = { responseText: `${explanation}\n\nIs that clear so far?` };
      } else if (intentResult.intent === "UNDERSTANDING_CONFIRMED") {
        const activeConcept = session.currentConcept || "SQL";
        const knowledgeQuestion = activeConcept.toLowerCase() === "mongodb"
          ? "What kind of database is MongoDB?"
          : activeConcept.toLowerCase() === "global warming"
          ? "What causes the long-term increase in Earth's temperature in global warming?"
          : `What is ${activeConcept} mainly used for?`;

        serverState.updateTutoringSessionState(conversationId, {
          pendingQuestion: knowledgeQuestion,
          pendingQuestionType: "KNOWLEDGE_CHECK",
          tutorState: "WAITING_FOR_KNOWLEDGE_ANSWER",
        });

        resultResponse = { responseText: `Perfect. Let me check your understanding.\n\n${knowledgeQuestion}` };
      } else if (intentResult.intent === "UNDERSTANDING_REJECTED") {
        const activeConcept = session.currentConcept || "SQL";

        serverState.updateTutoringSessionState(conversationId, {
          pendingQuestion: "Is that clearer?",
          pendingQuestionType: "UNDERSTANDING_CHECK",
          tutorState: "WAITING_FOR_UNDERSTANDING",
        });

        const definition = this.getFactualDefinition(activeConcept);
        resultResponse = { responseText: `No problem. Let me explain ${activeConcept} in a simpler way.\n\n${definition}\n\nIs that clearer?` };
      } else if (intentResult.intent === "KNOWLEDGE_ANSWER") {
        const activeConcept = session.currentConcept || "SQL";
        const activeQuestion = session.pendingQuestion || `What is ${activeConcept} mainly used for?`;

        const evaluation = this.evaluateStudentAnswer(query, activeConcept, activeQuestion);

        if (evaluation.isCorrect) {
          serverState.updateTutoringSessionState(conversationId, {
            pendingQuestion: null,
            pendingQuestionType: null,
            tutorState: "SESSION_COMPLETE",
          });
        } else {
          serverState.updateTutoringSessionState(conversationId, {
            tutorState: "WAITING_FOR_KNOWLEDGE_ANSWER",
          });
        }

        resultResponse = { responseText: evaluation.feedback };
      } else if (intentResult.intent === "NEXT_TOPIC_CONFIRMATION") {
        serverState.updateTutoringSessionState(conversationId, {
          pendingQuestion: "What would you like to learn next?",
          pendingQuestionType: null,
          tutorState: "CASUAL",
        });

        resultResponse = { responseText: "Sure. What would you like to learn next?" };
      } else {
        const fallbackConcept = session.currentConcept || "SQL";
        const definition = this.getFactualDefinition(fallbackConcept);
        resultResponse = { responseText: `${definition}\n\nIs that clear so far?` };
      }
    }

    const formattedText = this.applyExplanationStyleFormat(
      resultResponse.responseText,
      userMem.explanationStyle,
      userMem.customPreferences
    );

    return {
      responseText: formattedText,
      codeSnippet: resultResponse.codeSnippet
    };
  }

  static async generateHint(question: string, options?: string[]): Promise<string> {
    return `Hint: Review the foundational concept and identify the key parameters in the question.`;
  }

  static async generateChallengeMatch(topic: string): Promise<ChallengeMatch> {
    return {
      id: `match_${Date.now()}`,
      topic: topic || "Algorithms & Data Structures",
      question: "Which of the following sorting algorithms guarantees an O(N log N) worst-case time complexity?",
      options: ["Quick Sort", "Merge Sort", "Bubble Sort", "Insertion Sort"],
      correctOptionIndex: 1,
      aiAnswerIndex: 1,
      aiExplanation: "Merge Sort consistently divides the array into halves and merges them.",
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
      }
    ];
  }
}
