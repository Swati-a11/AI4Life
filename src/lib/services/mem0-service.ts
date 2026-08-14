import { Mem0Preference } from "../types/student-types";

export class Mem0Service {
  private static mockPreferences: Mem0Preference[] = [
    {
      id: "pref_1",
      category: "Explanation Style",
      preference: "Prefers bullet points, code examples, and intuitive analogies",
      confidence: 0.96,
      updatedAt: "2026-08-12"
    },
    {
      id: "pref_2",
      category: "Target Exam Focus",
      preference: "GATE Computer Science / Software Engineering algorithms",
      confidence: 0.91,
      updatedAt: "2026-08-10"
    },
    {
      id: "pref_3",
      category: "Weak Topic Tracker",
      preference: "Dynamic Programming state transitions & space optimization",
      confidence: 0.88,
      updatedAt: "2026-08-13"
    }
  ];

  static async getStudentContext(): Promise<Mem0Preference[]> {
    return this.mockPreferences;
  }

  static async addPreference(category: string, preference: string): Promise<Mem0Preference> {
    const newPref: Mem0Preference = {
      id: `pref_${Date.now()}`,
      category,
      preference,
      confidence: 0.95,
      updatedAt: new Date().toISOString().split("T")[0]
    };
    this.mockPreferences.push(newPref);
    return newPref;
  }
}
