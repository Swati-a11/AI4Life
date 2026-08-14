export type StudentTab =
  | "dashboard"
  | "tutor"
  | "ask-notes"
  | "materials"
  | "quiz-lab"
  | "challenge"
  | "progress"
  | "planner"
  | "saved"
  | "memory"
  | "research"
  | "settings";

export type AITutorMode =
  | "Explain"
  | "Summarize"
  | "Solve"
  | "Quiz Me"
  | "Give Examples"
  | "Simplify"
  | "Deep Dive";

export interface StudentProfile {
  clerkUserId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: "Free" | "Plus" | "Pro";
  credits: number;
  studyTimeHours: number;
  questionsSolved: number;
  averageQuizScore: number;
  streakDays: number;
  xp: number;
  level: number;
}

export interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  fileType: "pdf" | "docx" | "note";
  sizeMb: number;
  uploadedAt: string;
  status: "Uploading" | "Processing" | "Ready" | "Failed";
  chunksCount: number;
  qdrantCollectionRef: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  mode?: AITutorMode;
  codeSnippet?: string;
  citations?: { title: string; chunkText: string; page?: number }[];
  timestamp: string;
  saved?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  userSelectedIndex?: number;
}

export interface QuizItem {
  id: string;
  title: string;
  subject: string;
  sourceMaterial?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  questions: QuizQuestion[];
  score?: number;
  completedAt?: string;
}

export interface ChallengeMatch {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  userAnswerIndex?: number;
  aiAnswerIndex: number;
  aiExplanation: string;
  userResult?: "win" | "loss" | "draw";
  studentScore: number;
  aiScore: number;
  xpEarned: number;
}

export interface StudyTask {
  id: string;
  dayLabel: string;
  topic: string;
  subject: string;
  estimatedMinutes: number;
  completed: boolean;
}

export interface StudyPlan {
  id: string;
  examName: string;
  targetDate: string;
  subjects: string[];
  tasks: StudyTask[];
  progressPercent: number;
}

export interface SavedItem {
  id: string;
  title: string;
  type: "Explanation" | "Quiz Question" | "Research Note" | "Summary";
  snippet: string;
  source: string;
  date: string;
}

export interface Mem0Preference {
  id: string;
  category: string;
  preference: string;
  confidence: number;
  updatedAt: string;
}

export interface TavilySearchResult {
  title: string;
  url: string;
  snippet: string;
}
