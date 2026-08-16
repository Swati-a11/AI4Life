import { QuizQuestion, ChallengeMatch, StudyTask, Mem0Preference } from "../types/student-types";

export interface StoredDocument {
  id: string;
  title: string;
  sizeMb: number;
  uploadedAt: string;
  chunks: { id: string; text: string; page?: number }[];
}

export interface ProgressData {
  quizzesAttempted: number;
  totalQuestionsAnswered: number;
  correctAnswersCount: number;
  averageScore: number;
  weakTopics: string[];
  strongTopics: string[];
  recentChallenges: ChallengeMatch[];
}

// In-memory server state fallback
class ServerStateStore {
  private documents: StoredDocument[] = [
    {
      id: "doc_init_1",
      title: "DBMS_Transactions_and_Normalization.pdf",
      sizeMb: 2.4,
      uploadedAt: "2026-08-14",
      chunks: [
        {
          id: "c1",
          text: "Section 1.1: Functional Dependencies & Normalization. 1NF requires atomic values. 2NF eliminates partial dependency. 3NF eliminates transitive dependency.",
          page: 4
        },
        {
          id: "c2",
          text: "Section 2.3: Deadlock in Database Systems. A deadlock occurs when two or more transactions are waiting indefinitely for locks held by each other. Techniques to prevent deadlock include Wait-Die and Wound-Wait schemes.",
          page: 12
        }
      ]
    }
  ];

  private quizAttempts: { topic: string; score: number; total: number; date: string }[] = [
    { topic: "Database Normalization", score: 4, total: 5, date: "2026-08-15" }
  ];

  private challengeHistory: ChallengeMatch[] = [];

  private preferences: Mem0Preference[] = [
    {
      id: "pref_1",
      category: "Explanation Style",
      preference: "Prefers simple bullet points, intuitive analogies, and Hinglish explanations",
      confidence: 0.95,
      updatedAt: new Date().toISOString().split("T")[0]
    }
  ];

  // Documents
  getDocuments(): StoredDocument[] {
    return this.documents;
  }

  addDocument(doc: StoredDocument): StoredDocument {
    this.documents.unshift(doc);
    return doc;
  }

  findDocument(id?: string): StoredDocument | undefined {
    if (!id) return this.documents[0];
    return this.documents.find((d) => d.id === id) || this.documents[0];
  }

  // Quiz Attempts
  addQuizAttempt(attempt: { topic: string; score: number; total: number }) {
    this.quizAttempts.push({ ...attempt, date: new Date().toISOString().split("T")[0] });
  }

  // Challenge Matches
  addChallengeMatch(match: ChallengeMatch) {
    this.challengeHistory.unshift(match);
    this.addQuizAttempt({
      topic: match.topic,
      score: match.studentScore,
      total: 5
    });
  }

  getChallengeHistory(): ChallengeMatch[] {
    return this.challengeHistory;
  }

  // Progress
  getProgress(): ProgressData {
    if (this.quizAttempts.length === 0 && this.challengeHistory.length === 0) {
      return {
        quizzesAttempted: 0,
        totalQuestionsAnswered: 0,
        correctAnswersCount: 0,
        averageScore: 0,
        weakTopics: [],
        strongTopics: [],
        recentChallenges: []
      };
    }

    let totalScore = 0;
    let totalQuestions = 0;

    this.quizAttempts.forEach((q) => {
      totalScore += q.score;
      totalQuestions += q.total;
    });

    const average = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

    return {
      quizzesAttempted: this.quizAttempts.length,
      totalQuestionsAnswered: totalQuestions,
      correctAnswersCount: totalScore,
      averageScore: average,
      weakTopics: ["3NF & Transitive Dependency", "Deadlock Wound-Wait Schemes"],
      strongTopics: ["1NF Atomicity", "2NF Partial Dependency", "B-Tree Indexing"],
      recentChallenges: this.challengeHistory
    };
  }

  // Mem0 Preferences
  getPreferences(): Mem0Preference[] {
    return this.preferences;
  }

  addPreference(category: string, preference: string): Mem0Preference {
    const newPref: Mem0Preference = {
      id: `pref_${Date.now()}`,
      category,
      preference,
      confidence: 0.95,
      updatedAt: new Date().toISOString().split("T")[0]
    };
    this.preferences.unshift(newPref);
    return newPref;
  }

  removePreference(id: string) {
    this.preferences = this.preferences.filter((p) => p.id !== id);
  }
}

export const serverState = new ServerStateStore();
