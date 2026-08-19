import { getDb } from "./mongodb";

export interface UserDoc {
  _id?: string;
  clerkUserId: string; // Unique primary identity from Clerk
  name: string;
  email: string;
  imageUrl?: string;
  credits: number;
  plan: "free" | "premium";
  subscriptionStatus: "inactive" | "active" | "cancelled" | "expired";
  razorpayCustomerId?: string;
  razorpaySubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentDoc {
  _id?: string;
  userId: string; // Bound to clerkUserId
  id: string;
  name: string;
  size: string;
  type: string;
  date: string;
  status: "Uploading" | "Processing" | "Completed" | "Failed";
  chunksCount: number;
  subject?: string;
  tags?: string[];
  extractedText?: string;
}

export interface ConversationDoc {
  _id?: string;
  userId: string; // Bound to clerkUserId
  id: string;
  title: string;
  persona: "friendly" | "professional";
  createdAt: string;
  updatedAt: string;
}

export interface MessageDoc {
  _id?: string;
  userId: string; // Bound to clerkUserId
  conversationId: string;
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface QuizDoc {
  _id?: string;
  userId: string; // Bound to clerkUserId
  id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  questions: Array<{
    id: string;
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    type?: "mcq" | "true_false" | "short_answer";
  }>;
  documentId?: string;
  createdAt: string;
}

export interface QuizAttemptDoc {
  _id?: string;
  userId: string; // Bound to clerkUserId
  id: string;
  quizId: string;
  title: string;
  subject: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeTakenSeconds: number;
  answers: Record<string, string>;
  date: string;
}

export interface ChallengeAttemptDoc {
  _id?: string;
  userId: string; // Bound to clerkUserId
  id: string;
  topic: string;
  studentScore: number;
  aiScore: number;
  xpEarned: number;
  streak: number;
  won: boolean;
  date: string;
}

export interface StudyPlanDoc {
  _id?: string;
  userId: string; // Bound to clerkUserId
  id: string;
  examDate: string;
  targetScore: string;
  availableHours: number;
  tasks: Array<{
    id: string;
    title: string;
    day: string;
    subject: string;
    duration: string;
    completed: boolean;
  }>;
  createdAt: string;
}

export interface SavedNoteDoc {
  _id?: string;
  userId: string; // Bound to clerkUserId
  id: string;
  title: string;
  type: string;
  snippet: string;
  source: string;
  date: string;
}

export interface MemoryDoc {
  _id?: string;
  userId: string; // Bound to clerkUserId
  id: string;
  key: string;
  value: string;
  category?: string;
  createdAt: string;
}

export interface PaymentDoc {
  _id?: string;
  userId: string; // Bound to clerkUserId
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: "created" | "paid" | "failed";
  plan: "premium";
  createdAt: string;
}

export interface CreditTransactionDoc {
  _id?: string;
  userId: string; // Bound to clerkUserId
  id: string;
  amount: number;
  type: "deduction" | "addition";
  description: string;
  date: string;
}

export async function getCollection(collectionName: string) {
  const db = await getDb();
  if (!db) return null;
  return db.collection(collectionName);
}
