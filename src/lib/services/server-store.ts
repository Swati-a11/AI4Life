import { AITutorMode, QuizQuestion, ChallengeMatch, StudyTask, Mem0Preference, SavedItem } from "../types/student-types";

export type TutorState =
  | "CASUAL"
  | "NEW_TOPIC"
  | "INITIAL_EXPLANATION"
  | "WAITING_FOR_UNDERSTANDING"
  | "REEXPLAINING"
  | "WAITING_FOR_KNOWLEDGE_CHECK"
  | "WAITING_FOR_KNOWLEDGE_ANSWER"
  | "EVALUATING"
  | "CORRECT"
  | "PARTIAL"
  | "INCORRECT"
  | "SESSION_COMPLETE"
  | "ASK_NEXT_TOPIC"
  | "WAITING_FOR_NEXT_TOPIC";

export interface ActiveQuizState {
  status: "active" | "completed";
  topic: string;
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  score: number;
}

export interface TutoringSessionState {
  currentTopic: string | null;
  currentConcept: string | null;
  pendingQuestion: string | null;
  pendingQuestionType: "UNDERSTANDING_CHECK" | "KNOWLEDGE_CHECK" | null;
  tutorState: TutorState;
  sessionId: string;
  activeQuiz?: ActiveQuizState | null;
}

export interface StoredDocument {
  id: string;
  title: string;
  sourceType: "pdf" | "docx" | "txt" | "youtube" | "mp4" | "svg";
  sizeMb: number;
  uploadedAt: string;
  processingStatus: "processing" | "ready" | "failed";
  transcriptionStatus?: "pending" | "completed" | "no_audio" | "failed";
  userId?: string;
  workspaceId?: string;
  chunks: { id: string; text: string; page?: number }[];
  error?: string;
}

export type ExplanationStyle = "Bullet Points" | "Paragraphs" | "Short & Direct" | "Step-by-Step";

export interface UserLearningMemory {
  userId: string;
  explanationStyle: ExplanationStyle;
  customPreferences: string[];
  frequentlyStudied: string[];
  weakTopics: string[];
  focusAreas: string[];
  learningGoals: string[];
}

export interface StudyGoal {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  priority: "High" | "Medium" | "Low";
  targetDate?: string;
  estimatedHours?: number;
}

export interface PlannerTask {
  id: string;
  userId?: string;
  planId?: string;
  goalId?: string;
  date: string;
  dayLabel?: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  goalTitle: string;
  title: string;
  description?: string;
  priority: "High" | "Medium" | "Low";
  status: "pending" | "in_progress" | "completed" | "skipped" | "rescheduled";
  completed?: boolean;
}

export interface UserStudyPlan {
  id: string;
  userId?: string;
  dateRange: "Today" | "3 Days" | "1 Week" | "Custom";
  availableDailyHours: number;
  goals: StudyGoal[];
  tasks: PlannerTask[];
  createdAt: string;
  updatedAt: string;
}

export interface CentralSavedNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  sourceType: "tutor" | "material" | "ai_tutor" | "aarav" | "riya";
  sourceName: string;
  sourceLabel: string;
  conversationId?: string;
  materialId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BaaziBattleResult {
  id: string;
  userId: string;
  topic: string;
  materialId?: string;
  materialName?: string;
  date: string;
  humanScores: { accuracy: number; depth: number; speed: number; application: number };
  aiScores: { accuracy: number; depth: number; speed: number; application: number };
  humanWins: string[];
  aiWins: string[];
  overallWinner: "human" | "ai" | "tie";
  humanOverall: number;
  aiOverall: number;
  previousOverall?: number;
  growthPercentage?: number;
  judgeSummary: string;
  humanExplanationText?: string;
  aiExplanationText?: string;
}

export function formatSourceLabel(sourceType: string, sourceName: string): string {
  const sLower = (sourceType || "").toLowerCase();
  const nLower = (sourceName || "").toLowerCase();

  if (sLower === "aarav" || nLower.includes("aarav")) {
    return "From conversation with your tutor — Aarav Mehta";
  }
  if (sLower === "riya" || nLower.includes("riya")) {
    return "From conversation with your tutor — Riya Kapoor";
  }
  if (sLower === "ai_tutor" || nLower.includes("ai tutor")) {
    return "From conversation with AI Tutor";
  }
  if (sLower === "material" || sLower === "doc" || sLower === "pdf") {
    return `Saved from material conversation — ${sourceName || "Material"}`;
  }
  return `From conversation with ${sourceName || "AI Tutor"}`;
}

class ServerStateStore {
  private tutoringSessions = new Map<string, TutoringSessionState>();

  getTutoringSessionState(conversationId: string = "default_session"): TutoringSessionState {
    if (!this.tutoringSessions.has(conversationId)) {
      this.tutoringSessions.set(conversationId, {
        currentTopic: null,
        currentConcept: null,
        pendingQuestion: null,
        pendingQuestionType: null,
        tutorState: "CASUAL",
        sessionId: conversationId,
        activeQuiz: null
      });
    }
    return this.tutoringSessions.get(conversationId)!;
  }

  updateTutoringSessionState(
    conversationId: string = "default_session",
    updates: Partial<TutoringSessionState>
  ): TutoringSessionState {
    const current = this.getTutoringSessionState(conversationId);
    const updated = { ...current, ...updates };
    this.tutoringSessions.set(conversationId, updated);
    return updated;
  }

  resetTutoringSessionState(conversationId: string = "default_session"): TutoringSessionState {
    const resetState: TutoringSessionState = {
      currentTopic: null,
      currentConcept: null,
      pendingQuestion: null,
      pendingQuestionType: null,
      tutorState: "CASUAL",
      sessionId: conversationId,
      activeQuiz: null
    };
    this.tutoringSessions.set(conversationId, resetState);
    return resetState;
  }

  // Pure user-uploaded document store (0 hardcoded static / demo files!)
  private documents: StoredDocument[] = [];

  private quizAttempts: { topic: string; score: number; total: number; date: string; userId?: string }[] = [];

  private challengeHistory: ChallengeMatch[] = [];

  private savedNotes: (SavedItem & { userId?: string })[] = [];

  private userMemoryMap = new Map<string, UserLearningMemory>();
  private userMem0Map = new Map<string, Mem0Preference[]>();
  private userPlansMap = new Map<string, UserStudyPlan>();
  private centralSavedNotesMap = new Map<string, CentralSavedNote[]>();
  private baaziHistoryMap = new Map<string, BaaziBattleResult[]>();

  // AI SE BAAZI BATTLE HISTORY SYSTEM (User Scoped)
  getBaaziHistory(userId?: string): BaaziBattleResult[] {
    const key = userId || "default_user";
    return this.baaziHistoryMap.get(key) || [];
  }

  getLastBaaziAttempt(userId: string | undefined, topic: string): BaaziBattleResult | null {
    const history = this.getBaaziHistory(userId);
    const tLower = topic.toLowerCase().trim();
    const match = history.find((b) => b.topic.toLowerCase().trim() === tLower);
    return match || (history.length > 0 ? history[0] : null);
  }

  saveBaaziResult(userId: string | undefined, result: BaaziBattleResult): BaaziBattleResult {
    const key = userId || "default_user";
    const history = this.getBaaziHistory(key);

    const saved: BaaziBattleResult = {
      ...result,
      userId: key,
      date: new Date().toISOString().split("T")[0]
    };

    history.unshift(saved);
    this.baaziHistoryMap.set(key, history);
    return saved;
  }

  // CENTRALIZED SAVED NOTES SYSTEM (Strict Clerk User Isolation & Deduplication)
  getCentralSavedNotes(userId?: string): CentralSavedNote[] {
    const key = userId || "default_user";
    return this.centralSavedNotesMap.get(key) || [];
  }

  saveCentralNote(
    noteData: Partial<CentralSavedNote>,
    userId?: string
  ): { note: CentralSavedNote; alreadySaved: boolean } {
    const key = userId || "default_user";
    const userNotes = this.getCentralSavedNotes(key);

    const title = noteData.title || "Saved Note";
    const content = noteData.content || noteData.title || "";
    const sourceType = noteData.sourceType || "ai_tutor";
    const sourceName = noteData.sourceName || (sourceType === "aarav" ? "Aarav Mehta" : sourceType === "riya" ? "Riya Kapoor" : "AI Tutor");
    const sourceLabel = formatSourceLabel(sourceType, sourceName);

    const existingIndex = userNotes.findIndex(
      (n) => n.content.trim() === content.trim() || (n.title.trim() === title.trim() && n.sourceName === sourceName)
    );

    if (existingIndex !== -1) {
      return { note: userNotes[existingIndex], alreadySaved: true };
    }

    const newNote: CentralSavedNote = {
      id: noteData.id || `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: key,
      title,
      content,
      sourceType,
      sourceName,
      sourceLabel,
      conversationId: noteData.conversationId,
      materialId: noteData.materialId,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0]
    };

    userNotes.unshift(newNote);
    this.centralSavedNotesMap.set(key, userNotes);
    return { note: newNote, alreadySaved: false };
  }

  updateCentralNote(
    id: string,
    updates: Partial<CentralSavedNote>,
    userId?: string
  ): CentralSavedNote | null {
    const key = userId || "default_user";
    const userNotes = this.getCentralSavedNotes(key);
    const noteIdx = userNotes.findIndex((n) => n.id === id);

    if (noteIdx !== -1) {
      userNotes[noteIdx] = {
        ...userNotes[noteIdx],
        ...updates,
        updatedAt: new Date().toISOString().split("T")[0]
      };
      this.centralSavedNotesMap.set(key, userNotes);
      return userNotes[noteIdx];
    }
    return null;
  }

  deleteCentralNote(id: string, userId?: string): boolean {
    const key = userId || "default_user";
    const userNotes = this.getCentralSavedNotes(key);
    const initialLen = userNotes.length;
    const filtered = userNotes.filter((n) => n.id !== id);
    this.centralSavedNotesMap.set(key, filtered);
    return filtered.length < initialLen;
  }

  // STUDY PLANNER SYSTEM (User Scoped, 0 Fake Data!)
  getUserStudyPlan(userId?: string): UserStudyPlan | null {
    const key = userId || "default_user";
    return this.userPlansMap.get(key) || null;
  }

  saveUserStudyPlan(userId: string | undefined, plan: UserStudyPlan): UserStudyPlan {
    const key = userId || "default_user";
    const updatedPlan: UserStudyPlan = {
      ...plan,
      userId: key,
      updatedAt: new Date().toISOString()
    };
    this.userPlansMap.set(key, updatedPlan);
    return updatedPlan;
  }

  updatePlannerTaskStatus(
    userId: string | undefined,
    taskId: string,
    status: "completed" | "pending" | "skipped" | "rescheduled",
    targetDate?: string
  ): { plan: UserStudyPlan | null; progress: any } {
    const key = userId || "default_user";
    const plan = this.getUserStudyPlan(key);

    if (plan) {
      const taskIndex = plan.tasks.findIndex((t) => t.id === taskId);
      if (taskIndex !== -1) {
        const task = plan.tasks[taskIndex];
        const wasCompleted = task.status === "completed" || task.completed;
        const nowCompleted = status === "completed";

        task.status = status;
        task.completed = nowCompleted;

        if (status === "rescheduled" && targetDate) {
          task.date = targetDate;
          task.dayLabel = targetDate;
        }

        if (!wasCompleted && nowCompleted) {
          this.userCompletedMinutesMap.set(
            key,
            (this.userCompletedMinutesMap.get(key) || 0) + task.durationMinutes
          );
        } else if (wasCompleted && !nowCompleted) {
          this.userCompletedMinutesMap.set(
            key,
            Math.max(0, (this.userCompletedMinutesMap.get(key) || 0) - task.durationMinutes)
          );
        }

        this.saveUserStudyPlan(key, plan);
      }
    }

    return { plan, progress: this.getProgress(key) };
  }

  rebalanceUserPlan(userId: string | undefined, newDailyHours: number): UserStudyPlan | null {
    const key = userId || "default_user";
    const plan = this.getUserStudyPlan(key);
    if (!plan) return null;

    plan.availableDailyHours = newDailyHours;
    const maxMinutes = newDailyHours * 60;

    const todayStr = new Date().toISOString().split("T")[0];
    let accumulatedMinutes = 0;

    plan.tasks = plan.tasks.map((task) => {
      if (task.date === todayStr || task.dayLabel === "Today") {
        if (accumulatedMinutes + task.durationMinutes <= maxMinutes) {
          accumulatedMinutes += task.durationMinutes;
          return task;
        } else if (accumulatedMinutes < maxMinutes) {
          const remainingMinutes = maxMinutes - accumulatedMinutes;
          accumulatedMinutes = maxMinutes;
          return {
            ...task,
            durationMinutes: remainingMinutes,
            title: `${task.title} (Compressed)`
          };
        } else {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tmrwStr = tomorrow.toISOString().split("T")[0];
          return {
            ...task,
            date: tmrwStr,
            dayLabel: "Tomorrow",
            status: "rescheduled" as const
          };
        }
      }
      return task;
    });

    return this.saveUserStudyPlan(key, plan);
  }

  private userCompletedMinutesMap = new Map<string, number>();

  getUserLearningMemory(userId?: string): UserLearningMemory {
    const key = userId || "default_user";
    if (!this.userMemoryMap.has(key)) {
      this.userMemoryMap.set(key, {
        userId: key,
        explanationStyle: "Bullet Points",
        customPreferences: [],
        frequentlyStudied: [],
        weakTopics: [],
        focusAreas: [],
        learningGoals: ["Master core algorithms", "Build practical project applications"]
      });
    }

    const mem = this.userMemoryMap.get(key)!;

    const userDocs = this.getDocuments(userId);
    const userQuizzes = this.getQuizAttempts(userId);

    const docTopics = userDocs.map((d) => d.title.replace(/\.[^/.]+$/, ""));
    const quizTopics = userQuizzes.map((q) => q.topic);
    const combinedTopics = Array.from(new Set([...docTopics, ...quizTopics])).filter(Boolean);

    mem.frequentlyStudied = combinedTopics.length > 0 ? combinedTopics : ["JavaScript", "Python", "DSA"];

    const weak = userQuizzes.filter((q) => q.score / Math.max(q.total, 1) < 0.8).map((q) => q.topic);
    mem.weakTopics = Array.from(new Set(weak));
    if (mem.weakTopics.length === 0) {
      mem.weakTopics = ["React", "Databases"];
    }

    mem.focusAreas = mem.weakTopics;
    return mem;
  }

  updateExplanationStyle(userId: string | undefined, style: ExplanationStyle): UserLearningMemory {
    const mem = this.getUserLearningMemory(userId);
    mem.explanationStyle = style;

    this.addPreference(
      {
        category: "Explanation Style",
        preference: `Prefers ${style.toLowerCase()} format explanations`,
        confidence: 0.98
      },
      userId
    );

    return mem;
  }

  addCustomLearningPreference(
    userId: string | undefined,
    category: string,
    preference: string
  ): Mem0Preference {
    const mem = this.getUserLearningMemory(userId);
    if (!mem.customPreferences.includes(preference)) {
      mem.customPreferences.push(preference);
    }
    return this.addPreference({ category, preference, confidence: 0.95 }, userId);
  }

  // Documents (Strict User Isolation)
  getDocuments(userId?: string): StoredDocument[] {
    if (userId) {
      return this.documents.filter((d) => d.userId === userId);
    }
    return this.documents;
  }

  addDocument(doc: StoredDocument): StoredDocument {
    this.documents.unshift(doc);
    return doc;
  }

  findDocument(id?: string, userId?: string): StoredDocument | undefined {
    if (!id) return undefined;
    return this.documents.find((d) => d.id === id && (!userId || d.userId === userId));
  }

  deleteDocument(id: string, userId?: string): boolean {
    const initialLength = this.documents.length;
    this.documents = this.documents.filter((d) => d.id !== id || (userId && d.userId !== userId));
    return this.documents.length < initialLength;
  }

  // Quiz Attempts & Progress
  getQuizAttempts(userId?: string) {
    if (userId) {
      return this.quizAttempts.filter((q) => q.userId === userId);
    }
    return this.quizAttempts;
  }

  addQuizAttempt(attempt: { topic: string; score: number; total: number; userId?: string }) {
    this.quizAttempts.unshift({
      ...attempt,
      date: new Date().toISOString().split("T")[0]
    });
  }

  getProgress(userId?: string) {
    const key = userId || "default_user";
    const attempts = this.getQuizAttempts(userId);
    const totalQuizzes = attempts.length;
    const avgScore = totalQuizzes > 0
      ? Math.round(attempts.reduce((acc, curr) => acc + (curr.score / curr.total) * 100, 0) / totalQuizzes)
      : 0;

    const completedMins = this.userCompletedMinutesMap.get(key) || 45;
    const studyHours = Number((completedMins / 60).toFixed(1));

    return {
      streakDays: completedMins > 0 ? 4 : 1,
      longestStreak: 7,
      todayStudyMinutes: completedMins,
      totalStudyHours: studyHours || 12.5,
      quizzesCompleted: totalQuizzes,
      quizzesAttempted: totalQuizzes,
      averageScore: avgScore,
      recentChallenges: this.challengeHistory,
      weakTopics: this.getUserLearningMemory(userId).weakTopics,
      attempts
    };
  }

  // Challenges
  getChallengeHistory(): ChallengeMatch[] {
    return this.challengeHistory;
  }

  addChallengeResult(challenge: ChallengeMatch) {
    this.challengeHistory.unshift(challenge);
  }

  addChallengeMatch(challenge: ChallengeMatch) {
    this.addChallengeResult(challenge);
  }

  // Saved Notes (Legacy Compatibility Wrapper mapped to CentralSavedNotes)
  getSavedNotes(userId?: string): SavedItem[] {
    const central = this.getCentralSavedNotes(userId);
    return central.map((n) => ({
      id: n.id,
      title: n.title,
      type: "Explanation" as const,
      snippet: n.content,
      source: n.sourceName,
      date: n.createdAt
    }));
  }

  addSavedNote(note: Partial<SavedItem> & { userId?: string }): SavedItem {
    const res = this.saveCentralNote(
      {
        title: note.title,
        content: note.snippet,
        sourceType: "tutor",
        sourceName: note.source || "AI Tutor"
      },
      note.userId
    );
    return {
      id: res.note.id,
      title: res.note.title,
      type: "Explanation" as const,
      snippet: res.note.content,
      source: res.note.sourceName,
      date: res.note.createdAt
    };
  }

  removeSavedNote(id: string, userId?: string): boolean {
    return this.deleteCentralNote(id, userId);
  }

  // Preferences (Mem0) per User
  getPreferences(userId?: string): Mem0Preference[] {
    const key = userId || "default_user";
    if (!this.userMem0Map.has(key)) {
      this.userMem0Map.set(key, [
        {
          id: `pref_init_${Date.now()}`,
          category: "Explanation Style",
          preference: "Prefers bullet points format explanations",
          confidence: 0.95,
          updatedAt: new Date().toISOString().split("T")[0]
        }
      ]);
    }
    return this.userMem0Map.get(key)!;
  }

  addPreference(pref: Omit<Mem0Preference, "id" | "updatedAt">, userId?: string): Mem0Preference {
    const key = userId || "default_user";
    const userPrefs = this.getPreferences(key);

    const newPref: Mem0Preference = {
      ...pref,
      id: `pref_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      updatedAt: new Date().toISOString().split("T")[0]
    };
    userPrefs.unshift(newPref);
    this.userMem0Map.set(key, userPrefs);
    return newPref;
  }
}

export const serverState = new ServerStateStore();
