import { AITutorMode, QuizQuestion, ChallengeMatch, StudyTask } from "../types/student-types";
import { serverState, TutoringSessionState, TutorState, ActiveQuizState } from "./server-store";

export interface IntentResult {
  intent:
    | "GREETING"
    | "EXPLICIT_NEW_TOPIC"
    | "UNDERSTANDING_CONFIRMED"
    | "UNDERSTANDING_REJECTED"
    | "FOLLOW_UP_EXAMPLE"
    | "FOLLOW_UP_DEEPER"
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

  public static isCasualOrGreeting(textLower: string): boolean {
    const clean = textLower.replace(/[^a-z0-9\s]/gi, "").trim().toLowerCase();
    const casualGreetings = [
      "hi", "hello", "hey", "hy", "hyy", "hii", "hlo", "how are you", "good morning",
      "good evening", "good afternoon", "whats up", "what up", "thanks", "thank you",
      "thx", "tysm", "cool", "nice", "awesome", "great"
    ];
    return casualGreetings.includes(clean);
  }

  // Standalone ChatGPT-style Assistant for general chatbot mode (when persona === 'standalone')
  private static handleStandaloneChatGptStyleAssistant(query: string, persona?: string): string | null {
    if (persona !== "standalone") return null;

    const qLower = query.toLowerCase().trim();

    if (qLower === "hi" || qLower === "hello" || qLower === "hey" || qLower === "hy") {
      return "Hey! How can I help you today?";
    }

    if (qLower.includes("how are you")) {
      return "I'm good! What's going on with you?";
    }

    if (qLower.includes("confused") || qLower.includes("im confused") || qLower.includes("i am confused")) {
      return "Why are you confused? Tell me what's going on. I'll help you figure it out.";
    }

    if (qLower.includes("joke") || qLower.includes("tell me a joke")) {
      return "Why do programmers prefer dark mode? Because light attracts bugs!";
    }

    if (qLower.startsWith("hi") || qLower.startsWith("hey") || qLower.includes("thanks")) {
      return "Hey! How can I help you today?";
    }

    return null;
  }

  public static isShortConfirmation(textLower: string): boolean {
    const clean = textLower.replace(/[^a-z0-9\s]/gi, "").trim().toLowerCase();
    const confirmations = [
      "yes", "yeah", "yep", "yup", "sure", "okay", "okk", "ok", "got it", "i got it",
      "makes sense", "i understand", "understood", "clear", "i get it", "continue",
      "go ahead", "yes please", "yess", "yesss", "alright", "all good", "fine",
      "haan", "ha", "haa", "haanji", "samajh aa gaya", "samajh gaya", "samajh gayi",
      "theek hai", "accha", "sahi hai", "aage batao", "comfortable", "yes i am",
      "yes it does", "i am comfortable", "totally", "of course", "definitely"
    ];
    return confirmations.includes(clean) || clean.startsWith("yes ") || clean.startsWith("haan ");
  }

  public static isShortNegation(textLower: string): boolean {
    const clean = textLower.replace(/[^a-z0-9\s]/gi, "").trim().toLowerCase();
    const negations = [
      "no", "nope", "nah", "not really", "i dont understand", "i don't understand",
      "dont understand", "i dont get it", "im confused", "i am confused", "confused",
      "explain again", "what do you mean", "can you explain again", "still confused",
      "not clear", "nahi", "nahi samajh aaya", "samajh nahi aaya", "phir se samjhao",
      "kuch nahi samjha", "nahi samjha", "no i don't", "no i dont", "not comfortable"
    ];
    return negations.includes(clean) || clean.startsWith("no ") || clean.startsWith("nahi ");
  }

  public static isFollowUpExample(textLower: string): boolean {
    const clean = textLower.replace(/[^a-z0-9\s]/gi, "").trim().toLowerCase();
    return (
      clean.includes("give an example") ||
      clean.includes("give example") ||
      clean.includes("give me an example") ||
      clean.includes("example please") ||
      clean.includes("can you give an example") ||
      clean.includes("show an example") ||
      clean.includes("show code") ||
      clean.includes("code example") ||
      clean === "example" ||
      clean === "examples"
    );
  }

  public static isFollowUpReasonOrDeeper(textLower: string): boolean {
    const clean = textLower.replace(/[^a-z0-9\s]/gi, "").trim().toLowerCase();
    return (
      clean === "why" ||
      clean === "why?" ||
      clean === "how" ||
      clean === "how?" ||
      clean.startsWith("why ") ||
      clean.startsWith("how ") ||
      clean.includes("explain more") ||
      clean.includes("tell me more") ||
      clean.includes("dive deeper") ||
      clean.includes("what does that mean")
    );
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
      /teach\s+me\s+([a-z0-9\s]+)/i,
      /what\s+is\s+([a-z0-9\s]+)/i,
      /what\s+are\s+([a-z0-9\s]+)/i,
      /tell\s+me\s+about\s+([a-z0-9\s]+)/i,
      /how\s+does\s+([a-z0-9\s]+)\s+work/i,
      /how\s+do\s+([a-z0-9\s]+)\s+work/i,
      /i\s+want\s+to\s+learn\s+([a-z0-9\s]+)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const extracted = match[1]
          .replace(/\b(please|thanks|now|today|from this source|from pdf|from material|clearly|simply|with example|in detail)\b/gi, "")
          .trim();
        if (extracted.length > 0 && extracted !== "this source" && extracted !== "this pdf" && extracted !== "it" && extracted !== "that" && extracted !== "more") {
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
      textLower.startsWith("what are") ||
      textLower.startsWith("explain") ||
      textLower.startsWith("tell me about") ||
      textLower.startsWith("how does") ||
      textLower.startsWith("how do") ||
      textLower.startsWith("i want to learn") ||
      textLower.includes("want to learn") ||
      textLower.startsWith("teach me") ||
      textLower.includes("quiz me") ||
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
      .replace(/\b(give me an example of|give me examples of|give me examples for|give example|quiz me for the topic|quiz me on|quiz me about|topic-|topic:|what is|what are|explain|teach me|tell me about|how does|how do|i want to learn)\b/gi, "")
      .replace(/\?/g, "")
      .trim();

    if (cleaned.length > 0 && !cleaned.includes("this source") && !cleaned.includes("this pdf") && cleaned !== "it" && cleaned !== "that") {
      const cap = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      return { topic: cap, concept: cap };
    }

    return null;
  }

  // Pedagogical Intent Classifier
  private static classifyIntent(
    query: string,
    session: TutoringSessionState,
    history?: Array<{ sender: string; content: string }>
  ): IntentResult {
    const qLower = query.toLowerCase().trim();

    // 1. If user confirms understanding (e.g. "yes", "okk", "haan", "understood", "continue")
    if (this.isShortConfirmation(qLower)) {
      if (
        session.tutorState === "WAITING_FOR_UNDERSTANDING" ||
        session.tutorState === "INITIAL_EXPLANATION" ||
        session.currentTopic
      ) {
        return { intent: "UNDERSTANDING_CONFIRMED", topic: session.currentTopic, concept: session.currentConcept };
      }
    }

    // 2. If user rejects understanding or is confused (e.g. "no", "not really", "im confused", "nahi samjha")
    if (this.isShortNegation(qLower)) {
      if (
        session.tutorState === "WAITING_FOR_UNDERSTANDING" ||
        session.tutorState === "INITIAL_EXPLANATION" ||
        session.currentTopic
      ) {
        return { intent: "UNDERSTANDING_REJECTED", topic: session.currentTopic, concept: session.currentConcept };
      }
    }

    // 3. If user is in the middle of answering a concept-check question
    if (session.tutorState === "WAITING_FOR_KNOWLEDGE_ANSWER" && session.pendingQuestion) {
      const explicitNew = this.detectExplicitConcept(query);
      // Only switch topic if user explicitly starts a new "Explain [Other Topic]" command
      if (explicitNew && (qLower.startsWith("what is") || qLower.startsWith("explain") || qLower.startsWith("teach me"))) {
        return { intent: "EXPLICIT_NEW_TOPIC", topic: explicitNew.topic, concept: explicitNew.concept };
      }
      return { intent: "KNOWLEDGE_ANSWER", topic: session.currentTopic, concept: session.currentConcept };
    }

    // 4. If user asks for an example for current topic
    if (this.isFollowUpExample(qLower)) {
      return { intent: "FOLLOW_UP_EXAMPLE", topic: session.currentTopic, concept: session.currentConcept };
    }

    // 5. If user asks "why?" or "how?" or "explain more" for current topic
    if (this.isFollowUpReasonOrDeeper(qLower)) {
      return { intent: "FOLLOW_UP_DEEPER", topic: session.currentTopic, concept: session.currentConcept };
    }

    // 6. Explicit New Topic Detection
    const explicitConcept = this.detectExplicitConcept(query);
    if (explicitConcept) {
      return {
        intent: "EXPLICIT_NEW_TOPIC",
        topic: explicitConcept.topic,
        concept: explicitConcept.concept,
      };
    }

    // 7. If session was already complete and user responds with confirmation / next topic
    if (session.tutorState === "SESSION_COMPLETE" || session.tutorState === "WAITING_FOR_NEXT_TOPIC") {
      if (this.isShortConfirmation(qLower)) {
        return { intent: "NEXT_TOPIC_CONFIRMATION", topic: null, concept: null };
      }
    }

    // 8. If nothing active and it's a greeting
    if (this.isCasualOrGreeting(qLower) && !session.currentTopic) {
      return { intent: "GREETING", topic: null, concept: null };
    }

    // 9. If active topic exists and user sends descriptive text, evaluate as knowledge answer or topic response
    if (session.currentTopic) {
      if (session.tutorState === "WAITING_FOR_UNDERSTANDING") {
        // If they send explanation text instead of simple yes, treat as understanding confirmed + answer
        return { intent: "KNOWLEDGE_ANSWER", topic: session.currentTopic, concept: session.currentConcept };
      }
      return { intent: "KNOWLEDGE_ANSWER", topic: session.currentTopic, concept: session.currentConcept };
    }

    return { intent: "CASUAL", topic: null, concept: null };
  }

  // Factual definition repository for rich, pedagogical explanations
  private static getFactualDefinition(concept: string, persona: "friendly" | "professional" = "friendly"): string {
    const cLower = concept.toLowerCase().trim();

    if (cLower === "react" || cLower === "react.js" || cLower === "reactjs") {
      return "React is an open-source JavaScript library developed by Meta for building dynamic, interactive user interfaces. Instead of manipulating the browser's DOM directly, React uses a Virtual DOM and a component-based architecture where you build independent, reusable UI pieces.";
    }

    if (cLower === "python") {
      return "Python is a high-level, interpreted programming language renowned for its clean, readable syntax and versatility. It is widely used across web development, data science, machine learning, automation, and backend engineering.";
    }

    if (cLower === "python loops" || cLower === "python loop") {
      return "In Python, loops allow you to execute a block of code repeatedly. Python provides `for` loops (used for iterating over sequences like lists, strings, or ranges) and `while` loops (which continue running as long as a specified condition remains True).";
    }

    if (cLower === "javascript" || cLower === "js") {
      return "JavaScript is a high-level, dynamic programming language that powers interactive web pages in the browser and scalable server-side applications via runtime environments like Node.js.";
    }

    if (cLower === "mongodb") {
      return "MongoDB is a modern NoSQL document database. Instead of storing data in rigid rows and columns like traditional relational tables, MongoDB stores data in flexible, JSON-like BSON documents.";
    }

    if (cLower === "sql") {
      return "SQL (Structured Query Language) is the standard language designed to store, manipulate, and retrieve structured data in relational database management systems like PostgreSQL, MySQL, and SQLite.";
    }

    if (cLower === "binary search") {
      return "Binary Search is an efficient logarithmic divide-and-conquer search algorithm. Given a sorted array, it repeatedly divides the search interval in half by comparing the target value to the middle element, achieving O(log N) time complexity.";
    }

    if (cLower === "photosynthesis") {
      return "Photosynthesis is the biological process by which green plants, algae, and certain bacteria convert sunlight, water, and carbon dioxide into chemical energy (glucose) and release oxygen into the atmosphere.";
    }

    if (cLower === "global warming" || cLower === "climate change") {
      return "Global warming refers to the long-term increase in Earth's average surface temperature, primarily driven by human activities that release greenhouse gases (like CO2 and methane) that trap heat in the atmosphere.";
    }

    if (cLower === "ai" || cLower === "artificial intelligence") {
      return "Artificial Intelligence (AI) is the branch of computer science dedicated to building systems capable of performing tasks that typically require human intelligence, including pattern recognition, natural language processing, reasoning, and problem-solving.";
    }

    return `${concept} is a fundamental concept in your field of study. It provides structured principles, methodologies, and tools to help you solve complex domain problems efficiently and systematically.`;
  }

  // Generate Concept Check Question
  private static generateConceptCheckQuestion(topic: string, persona: "friendly" | "professional" = "friendly"): string {
    const tLower = topic.toLowerCase().trim();

    if (tLower.includes("react")) {
      return "What is React, and why do we use it?";
    }
    if (tLower.includes("python loop")) {
      return "What is the main purpose of a loop in Python, and what are the two main types of loops?";
    }
    if (tLower.includes("python")) {
      return "What is Python, and what are some of its primary use cases?";
    }
    if (tLower.includes("javascript") || tLower === "js") {
      return "What is JavaScript, and where can it run?";
    }
    if (tLower.includes("mongodb")) {
      return "What kind of database is MongoDB, and how does it organize data?";
    }
    if (tLower.includes("sql")) {
      return "What is SQL primarily used for in database systems?";
    }
    if (tLower.includes("binary search")) {
      return "What prerequisite condition is required for Binary Search to work, and what makes it efficient?";
    }
    if (tLower.includes("photosynthesis")) {
      return "What are the main inputs and outputs of the photosynthesis process?";
    }

    return `In your own words, what is ${topic}, and what is its primary purpose?`;
  }

  // Multi-Dimension Pedagogical Answer Evaluator
  private static evaluateStudentAnswer(
    studentAnswer: string,
    topic: string,
    question: string,
    persona: "friendly" | "professional" = "friendly"
  ): {
    isCorrect: boolean;
    isPartial: boolean;
    feedback: string;
    missingPoints?: string;
  } {
    const ans = studentAnswer.toLowerCase().trim();
    const tLower = topic.toLowerCase().trim();
    const wordCount = ans.split(/\s+/).filter(Boolean).length;

    // A. REACT EVALUATION
    if (tLower.includes("react")) {
      const mentionsLibrary = ans.includes("library") || ans.includes("framework") || ans.includes("tool") || ans.includes("js") || ans.includes("javascript");
      const mentionsUI = ans.includes("ui") || ans.includes("user interface") || ans.includes("frontend") || ans.includes("interface") || ans.includes("web") || ans.includes("website");
      const mentionsComponents = ans.includes("component") || ans.includes("components") || ans.includes("reusable") || ans.includes("virtual dom") || ans.includes("state");

      // Check completely wrong answer
      if (ans.includes("database") || ans.includes("hardware") || ans.includes("operating system") || (wordCount < 3 && !mentionsUI && !mentionsLibrary)) {
        return {
          isCorrect: false,
          isPartial: false,
          feedback: "You're close, but there are a few mistakes in your answer. Go through the explanation once more, especially the part about components and UI, and try answering again."
        };
      }

      // Check fully correct
      if ((mentionsUI && mentionsComponents) || (mentionsLibrary && mentionsUI && wordCount >= 5)) {
        const nextPrompt = persona === "friendly"
          ? "Would you like to explore how React Components and Props work next, or is there another topic on your mind?"
          : "Would you like to dive deeper into React Components & State management, or explore a different topic?";
        return {
          isCorrect: true,
          isPartial: false,
          feedback: `Yes, that's correct! You've understood the concept well.\n\n${nextPrompt}`
        };
      }

      // Partially correct
      return {
        isCorrect: false,
        isPartial: true,
        feedback: "You're on the right track! Your explanation is correct, but you're missing one important point: components help us build reusable UI pieces.\n\nWould you like to try answering again with that in mind?"
      };
    }

    // B. PYTHON LOOPS EVALUATION
    if (tLower.includes("python loop")) {
      const mentionsRepeat = ans.includes("repeat") || ans.includes("iterate") || ans.includes("multiple times") || ans.includes("loop") || ans.includes("running");
      const mentionsTypes = (ans.includes("for") && ans.includes("while")) || ans.includes("for loop") || ans.includes("while loop");

      if (ans.includes("database") || ans.includes("compiler") || wordCount < 3) {
        return {
          isCorrect: false,
          isPartial: false,
          feedback: "You're close, but there are a few mistakes in your answer. Go through the explanation once more, especially the part about repeating code with for and while loops, and try answering again."
        };
      }

      if (mentionsRepeat && mentionsTypes) {
        return {
          isCorrect: true,
          isPartial: false,
          feedback: "Yes, that's correct! You've understood the concept well.\n\nWould you like to see a practical example of nested loops in Python, or explore another topic?"
        };
      }

      return {
        isCorrect: false,
        isPartial: true,
        feedback: "You're on the right track! Loops repeat code, but remember that Python primarily uses two types: `for` loops (for sequences) and `while` loops (based on conditions).\n\nWould you like to try answering again?"
      };
    }

    // C. PYTHON EVALUATION
    if (tLower.includes("python")) {
      const mentionsLanguage = ans.includes("language") || ans.includes("programming") || ans.includes("code");
      const mentionsUses = ans.includes("web") || ans.includes("ai") || ans.includes("data") || ans.includes("machine learning") || ans.includes("automation") || ans.includes("simple") || ans.includes("easy");

      if (ans.includes("hardware") || ans.includes("database engine") || wordCount < 3) {
        return {
          isCorrect: false,
          isPartial: false,
          feedback: "You're close, but there are a few mistakes in your answer. Go through the explanation once more, especially the part about programming and its common applications, and try answering again."
        };
      }

      if (mentionsLanguage && mentionsUses) {
        return {
          isCorrect: true,
          isPartial: false,
          feedback: "Yes, that's correct! You've understood the concept well.\n\nWould you like to learn about Python data structures like Lists and Dictionaries next?"
        };
      }

      return {
        isCorrect: false,
        isPartial: true,
        feedback: "You're on the right track! Python is a high-level programming language, and it's especially known for readable syntax used in AI, web dev, and automation.\n\nWould you like to try summarizing it again?"
      };
    }

    // D. JAVASCRIPT EVALUATION
    if (tLower.includes("javascript") || tLower === "js") {
      const mentionsWeb = ans.includes("web") || ans.includes("browser") || ans.includes("frontend") || ans.includes("interactive") || ans.includes("dynamic") || ans.includes("node");

      if (wordCount < 3 || ans.includes("hardware")) {
        return {
          isCorrect: false,
          isPartial: false,
          feedback: "You're close, but there are a few mistakes in your answer. Go through the explanation once more, especially the part about dynamic web development, and try answering again."
        };
      }

      if (mentionsWeb && (ans.includes("browser") || ans.includes("node") || ans.includes("server") || ans.includes("pages"))) {
        return {
          isCorrect: true,
          isPartial: false,
          feedback: "Yes, that's correct! You've understood the concept well.\n\nWould you like to explore JavaScript Async/Await & Promises next?"
        };
      }

      return {
        isCorrect: false,
        isPartial: true,
        feedback: "You're on the right track! JavaScript is used for interactive web pages, but remember it also runs outside the browser on servers via Node.js.\n\nWould you like to try answering again?"
      };
    }

    // E. GENERAL TOPIC EVALUATION
    if (wordCount >= 6) {
      return {
        isCorrect: true,
        isPartial: false,
        feedback: `Yes, that's correct! You've understood the concept well.\n\nWould you like to explore a deeper aspect of ${topic}, or learn another topic?`
      };
    }

    if (wordCount >= 3) {
      return {
        isCorrect: false,
        isPartial: true,
        feedback: `You're on the right track! Your answer touches on the key idea, but could you elaborate a bit more on how ${topic} is used practically?`
      };
    }

    return {
      isCorrect: false,
      isPartial: false,
      feedback: `You're close, but there are a few mistakes in your answer. Go through the explanation once more and try answering again.`
    };
  }

  // Simplified Analogy Explanation for when user says "no" or is confused
  private static getSimplerAnalogyExplanation(topic: string, persona: "friendly" | "professional" = "friendly"): string {
    const tLower = topic.toLowerCase().trim();

    if (tLower.includes("react")) {
      return "No problem at all! Let's simplify it with an analogy:\n\nImagine building a webpage like assembling a Lego set. Instead of creating the whole page in one massive block, React lets you create small, reusable Lego bricks (called **components**) like a Button, a SearchBar, or a Header, and put them together.\n\nDoes that make sense? Are you comfortable with this concept?";
    }

    if (tLower.includes("python loop")) {
      return "No problem at all! Let's simplify it:\n\nImagine you have a stack of 10 test papers to sign. Instead of writing 10 separate instructions to sign each paper, a loop simply says: *'For every paper in the stack, sign it.'* It repeats the same action until all papers are signed.\n\nDoes that make sense? Are you comfortable with this concept?";
    }

    if (tLower.includes("python")) {
      return "No worries! Think of Python like plain English for computers. While some programming languages require complex syntax, Python is designed to be as readable and intuitive as everyday sentences.\n\nDoes that make sense? Are you comfortable with this concept?";
    }

    if (tLower.includes("binary search")) {
      return "No problem! Imagine searching for a word in a dictionary. You don't read page 1 to 500 one by one. You open the dictionary right in the middle: if your word comes after, you discard the left half and repeat in the right half. That's exactly how Binary Search works!\n\nDoes that make sense? Are you comfortable with this concept?";
    }

    return `No problem at all! Let's look at ${topic} in simpler terms:\n\nThink of it as a blueprint that breaks down complex tasks into manageable steps so you can solve problems faster and without mistakes.\n\nDoes that make sense? Are you comfortable with this concept?`;
  }

  // Concrete Example Provider for when user asks "give an example"
  private static getTopicExample(topic: string, persona: "friendly" | "professional" = "friendly"): string {
    const tLower = topic.toLowerCase().trim();

    if (tLower.includes("react")) {
      return "Here's a concrete example in React:\n\n```jsx\nfunction WelcomeButton({ username }) {\n  return (\n    <button className=\"btn-primary\">\n      Hello, {username}!\n    </button>\n  );\n}\n```\n\nInstead of writing raw HTML over and over, you can reuse `<WelcomeButton username=\"Swati\" />` anywhere across your app.\n\nDoes that make sense? Are you comfortable with this concept?";
    }

    if (tLower.includes("python loop") || tLower.includes("python")) {
      return "Here is a simple Python loop example:\n\n```python\nfruits = [\"Apple\", \"Banana\", \"Mango\"]\n\nfor fruit in fruits:\n    print(f\"I like {fruit}\")\n```\n\nThis loop runs 3 times, printing each item from the list automatically.\n\nDoes that make sense? Are you comfortable with this concept?";
    }

    if (tLower.includes("binary search")) {
      return "Here is a quick Binary Search example:\n\nArray: `[10, 20, 30, 40, 50, 60, 70]`\nTarget: `50`\n\n1. Middle element is `40`.\n2. `50 > 40`, so we ignore the left half (`[10, 20, 30]`).\n3. In the right half (`[50, 60, 70]`), middle is `50` (Target found in just 2 steps!).\n\nDoes that make sense? Are you comfortable with this concept?";
    }

    return `Here is a practical example for **${topic}**:\n\nWhen developing a modern application, applying ${topic} allows you to isolate logic, eliminate redundant computation, and make your codebase predictable.\n\nDoes that make sense? Are you comfortable with this concept?`;
  }

  // Format tutor responses according to user's personalized explanation style preference (Mem0)
  public static applyExplanationStyleFormat(
    rawText: string,
    style: "Bullet Points" | "Paragraphs" | "Short & Direct" | "Step-by-Step" = "Bullet Points",
    customPreferences?: string[]
  ): string {
    if (!rawText) return "";

    const tLower = rawText.toLowerCase().trim();
    if (
      tLower === "hey! how can i help you today?" ||
      tLower === "hey! what's up?" ||
      tLower.startsWith("you're welcome")
    ) {
      return rawText;
    }

    const endingQuestionMatch = rawText.match(/(\n\n)?(Does that make sense\? Are you comfortable with this concept\?|Does that make sense\?|What is .*|In your own words.*|Would you like to.*|Does this example help clarify.*)$/i);
    const endingQuestion = endingQuestionMatch ? endingQuestionMatch[0].trim() : "";
    const bodyText = endingQuestionMatch ? rawText.replace(endingQuestionMatch[0], "").trim() : rawText.trim();

    const headerMatch = bodyText.match(/^###\s+[^\n]+\n\n/);
    const header = headerMatch ? headerMatch[0] : "";
    const contentOnly = headerMatch ? bodyText.replace(headerMatch[0], "").trim() : bodyText.trim();

    let formattedBody = contentOnly;

    // Do not bullet point short conversational feedback or question intros
    const isShortConversational =
      contentOnly.startsWith("Great!") ||
      contentOnly.startsWith("Awesome!") ||
      contentOnly.startsWith("Yes, that's correct") ||
      contentOnly.startsWith("You're on the right track") ||
      contentOnly.startsWith("You're close") ||
      contentOnly.startsWith("No problem") ||
      contentOnly.startsWith("No worries") ||
      contentOnly.length < 80;

    if (style === "Bullet Points" && !isShortConversational) {
      if (!contentOnly.includes("- ") && !contentOnly.includes("• ") && !contentOnly.includes("```")) {
        const sentences = contentOnly.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 3);
        if (sentences.length > 2) {
          const intro = sentences[0];
          const bullets = sentences.slice(1).map((s) => `- ${s.replace(/^[-•*]\s*/, "")}`).join("\n");
          formattedBody = `${intro}\n\n${bullets}`;
        }
      }
    } else if (style === "Paragraphs") {
      const cleanLines = contentOnly
        .split("\n")
        .map((line) => line.replace(/^(\d+\.|Step \d+:?|[-•*])\s*/i, "").trim())
        .filter((line) => line.length > 0);
      formattedBody = cleanLines.join(" ");
    } else if (style === "Short & Direct" && !isShortConversational) {
      const sentences = contentOnly.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 3);
      if (sentences.length > 2) {
        formattedBody = sentences.slice(0, 2).join(" ");
      }
    }

    const fullContent = header ? `${header}${formattedBody}` : formattedBody;
    return endingQuestion ? `${fullContent}\n\n${endingQuestion}` : fullContent;
  }

  // DYNAMIC MATERIAL-GROUNDED QUIZ QUESTION GENERATOR
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
      }
    ].slice(0, questionCount);
  }

  // Parse user option selection from query
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

  // Main Pedagogical Tutor Response Generator (TEACH → CONFIRM → ASK QUESTION → EVALUATE → CONTINUE)
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

    // 1. Standalone Assistant Handler (when persona is standalone)
    if (persona === "standalone") {
      const standaloneResponse = this.handleStandaloneChatGptStyleAssistant(query, persona);
      if (standaloneResponse) {
        return { responseText: standaloneResponse };
      }
    }

    // 2. State Recovery from Conversation History (if session lost or cold start)
    if (!session.currentTopic && conversationHistory && conversationHistory.length > 0) {
      for (let i = conversationHistory.length - 1; i >= 0; i--) {
        const msg = conversationHistory[i];
        if (msg.sender === "user") {
          const detectedTopic = this.detectExplicitTopicFromQuery(msg.content);
          if (detectedTopic) {
            session.currentTopic = detectedTopic;
            session.currentConcept = detectedTopic;
            break;
          }
        }
      }
    }

    // 3. Quiz Me Mode Routing
    if (mode === "Quiz Me" || qLower.startsWith("quiz me")) {
      const topic = session.currentTopic || this.detectExplicitTopicFromQuery(query) || "Python";
      const questions = await this.generateQuizFromDocument(topic, 5, "Medium");
      
      const newActiveQuiz: ActiveQuizState = {
        status: "active",
        topic,
        questions,
        currentQuestionIndex: 0,
        score: 0
      };

      serverState.updateTutoringSessionState(conversationId, {
        activeQuiz: newActiveQuiz,
        currentTopic: topic,
        currentConcept: topic
      });

      const q1 = questions[0];
      const quizIntro = `Here is Question 1 of ${questions.length} on **${topic}**:\n\n` +
        `**Question 1**: ${q1.question}\n` +
        q1.options.map((opt, oIdx) => `   ${String.fromCharCode(65 + oIdx)}. ${opt}`).join("\n") +
        `\n\nReply with your answer (A, B, C, or D).`;

      return { responseText: quizIntro };
    }

    // 4. Give Example Mode Routing
    if (mode === "Give Example" || this.isFollowUpExample(qLower)) {
      const topic = session.currentTopic || this.detectExplicitTopicFromQuery(query) || "React";
      serverState.updateTutoringSessionState(conversationId, {
        currentTopic: topic,
        currentConcept: topic,
        tutorState: "WAITING_FOR_UNDERSTANDING"
      });

      const exampleText = this.getTopicExample(topic, persona === "professional" ? "professional" : "friendly");
      const formatted = this.applyExplanationStyleFormat(exampleText, userMem.explanationStyle, userMem.customPreferences);
      return { responseText: formatted };
    }

    // 5. Intent Classification against Session State
    const intentResult = this.classifyIntent(query, session, conversationHistory);

    let rawResponse = "";

    // CASE A: USER CONFIRMS UNDERSTANDING ("yes", "yeah", "okk", "understood", "I got it", "haan", "continue", etc.)
    if (intentResult.intent === "UNDERSTANDING_CONFIRMED") {
      const activeTopic = session.currentTopic || "React";
      const conceptQuestion = this.generateConceptCheckQuestion(activeTopic, persona === "professional" ? "professional" : "friendly");

      serverState.updateTutoringSessionState(conversationId, {
        pendingQuestion: conceptQuestion,
        pendingQuestionType: "KNOWLEDGE_CHECK",
        tutorState: "WAITING_FOR_KNOWLEDGE_ANSWER",
        retryCount: 0
      });

      const ackIntro = persona === "professional"
        ? "Great! Let's quickly check your understanding."
        : "Great! Let's quickly check your understanding.";

      rawResponse = `${ackIntro}\n\n${conceptQuestion}`;
    }

    // CASE B: USER REJECTS UNDERSTANDING OR IS CONFUSED ("no", "not really", "im confused", "nahi samjha", "explain again")
    else if (intentResult.intent === "UNDERSTANDING_REJECTED") {
      const activeTopic = session.currentTopic || "React";
      const simplerExplanation = this.getSimplerAnalogyExplanation(activeTopic, persona === "professional" ? "professional" : "friendly");

      serverState.updateTutoringSessionState(conversationId, {
        tutorState: "WAITING_FOR_UNDERSTANDING",
        lastExplanation: simplerExplanation
      });

      rawResponse = simplerExplanation;
    }

    // CASE C: USER ASKS FOR EXAMPLE DURING SESSION
    else if (intentResult.intent === "FOLLOW_UP_EXAMPLE") {
      const activeTopic = session.currentTopic || "React";
      const exampleText = this.getTopicExample(activeTopic, persona === "professional" ? "professional" : "friendly");

      serverState.updateTutoringSessionState(conversationId, {
        tutorState: "WAITING_FOR_UNDERSTANDING"
      });

      rawResponse = exampleText;
    }

    // CASE D: USER ASKS "WHY?" / "HOW?" / "EXPLAIN MORE"
    else if (intentResult.intent === "FOLLOW_UP_DEEPER") {
      const activeTopic = session.currentTopic || "React";
      const explanation = this.getFactualDefinition(activeTopic, persona === "professional" ? "professional" : "friendly");

      serverState.updateTutoringSessionState(conversationId, {
        tutorState: "WAITING_FOR_UNDERSTANDING"
      });

      rawResponse = `${explanation}\n\nDoes that make sense? Are you comfortable with this concept?`;
    }

    // CASE E: USER SUBMITS KNOWLEDGE ANSWER (Evaluating understanding)
    else if (intentResult.intent === "KNOWLEDGE_ANSWER") {
      const activeTopic = session.currentTopic || "React";
      const activeQuestion = session.pendingQuestion || this.generateConceptCheckQuestion(activeTopic, persona === "professional" ? "professional" : "friendly");

      const evaluation = this.evaluateStudentAnswer(query, activeTopic, activeQuestion, persona === "professional" ? "professional" : "friendly");

      if (evaluation.isCorrect) {
        serverState.updateTutoringSessionState(conversationId, {
          pendingQuestion: null,
          pendingQuestionType: null,
          tutorState: "SESSION_COMPLETE",
          lastEvaluationResult: "CORRECT"
        });
      } else {
        serverState.updateTutoringSessionState(conversationId, {
          tutorState: "WAITING_FOR_KNOWLEDGE_ANSWER",
          retryCount: (session.retryCount || 0) + 1,
          lastEvaluationResult: evaluation.isPartial ? "PARTIAL" : "INCORRECT"
        });
      }

      rawResponse = evaluation.feedback;
    }

    // CASE F: EXPLICIT NEW TOPIC REQUEST (e.g. "Explain React", "What is Python", "Teach me DSA")
    else if (intentResult.intent === "EXPLICIT_NEW_TOPIC" && intentResult.topic) {
      const topic = intentResult.topic;
      const explanation = this.getFactualDefinition(topic, persona === "professional" ? "professional" : "friendly");

      serverState.updateTutoringSessionState(conversationId, {
        currentTopic: topic,
        currentConcept: topic,
        lastExplanation: explanation,
        pendingQuestion: "Does that make sense? Are you comfortable with this concept?",
        pendingQuestionType: "UNDERSTANDING_CHECK",
        tutorState: "WAITING_FOR_UNDERSTANDING",
        retryCount: 0
      });

      rawResponse = `${explanation}\n\nDoes that make sense? Are you comfortable with this concept?`;
    }

    // CASE G: GREETING WITH NO ACTIVE TOPIC
    else if (intentResult.intent === "GREETING") {
      if (qLower.includes("thanks") || qLower.includes("thank you")) {
        rawResponse = "You're very welcome! Let me know what topic you'd like to learn next.";
      } else {
        rawResponse = persona === "professional"
          ? "Hello! I'm Aarav Mehta, your AI Tutor. What topic or concept would you like to master today?"
          : "Hey there! I'm Riya Kapoor, your AI Tutor. What topic would you like to explore today?";
      }
    }

    // CASE H: CASUAL / FALLBACK
    else {
      if (session.currentTopic) {
        // If an active topic is open, continue with the check
        rawResponse = `Let's focus on **${session.currentTopic}**.\n\nDoes the explanation make sense, or would you like to check your understanding with a quick question?`;
      } else {
        rawResponse = persona === "professional"
          ? "I'm ready when you are. Tell me what topic you're studying (e.g., 'Explain React' or 'What is Python?')."
          : "I'm ready! What would you like to learn today? Tell me a topic like 'Explain React' or 'Teach me Python Loops'.";
      }
    }

    const formattedText = this.applyExplanationStyleFormat(
      rawResponse,
      userMem.explanationStyle,
      userMem.customPreferences
    );

    return { responseText: formattedText };
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
