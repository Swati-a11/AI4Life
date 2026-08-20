import { NEW_USER_FREE_CREDITS } from "../config/pricing";

export interface CreditTransaction {
  id: string;
  userId?: string;
  amount: number;
  type: "deduction" | "reward" | "purchase";
  description: string;
  date: string;
  idempotencyKey?: string;
}

export class CreditService {
  private static userCreditsMap = new Map<string, number>();
  private static processedTransactions = new Set<string>();
  private static transactionLogs: CreditTransaction[] = [];

  private static getStoredCredits(key: string): number {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`ai4life_credits_${key}`);
      if (stored !== null) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed)) return parsed;
      }
      const genericStored = localStorage.getItem("ai4life_credits");
      if (genericStored !== null) {
        const parsed = parseInt(genericStored, 10);
        if (!isNaN(parsed)) return parsed;
      }
    }
    return NEW_USER_FREE_CREDITS;
  }

  private static getInitialCredits(userId?: string): number {
    const key = userId || "anonymous_student_user";
    if (!this.userCreditsMap.has(key)) {
      const val = this.getStoredCredits(key);
      this.userCreditsMap.set(key, val);
    }
    return this.userCreditsMap.get(key)!;
  }

  static getCredits(userId?: string): number {
    return this.getInitialCredits(userId);
  }

  static deductCredits(
    cost: number = 20,
    userId?: string,
    idempotencyKey?: string,
    description: string = "AI Action"
  ): { success: boolean; remainingCredits: number; alreadyProcessed?: boolean; error?: string } {
    const key = userId || "anonymous_student_user";
    const current = this.getInitialCredits(key);

    if (idempotencyKey && this.processedTransactions.has(`${key}_deduct_${idempotencyKey}`)) {
      return { success: true, remainingCredits: current, alreadyProcessed: true };
    }

    if (current >= cost) {
      const remaining = current - cost;
      this.userCreditsMap.set(key, remaining);

      if (typeof window !== "undefined") {
        localStorage.setItem(`ai4life_credits_${key}`, remaining.toString());
        localStorage.setItem("ai4life_credits", remaining.toString());
      }

      if (idempotencyKey) {
        this.processedTransactions.add(`${key}_deduct_${idempotencyKey}`);
      }

      this.transactionLogs.unshift({
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: key,
        amount: -cost,
        type: "deduction",
        description,
        date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        idempotencyKey
      });

      return { success: true, remainingCredits: remaining };
    }

    return { 
      success: false, 
      remainingCredits: current, 
      error: "Insufficient credits. Please upgrade your plan to continue." 
    };
  }

  static addCredits(
    amount: number = 20,
    userId?: string,
    idempotencyKey?: string,
    description: string = "Credit Purchase / Reward"
  ): { remainingCredits: number; alreadyProcessed?: boolean } {
    const key = userId || "anonymous_student_user";
    const current = this.getInitialCredits(key);

    if (idempotencyKey && this.processedTransactions.has(`${key}_reward_${idempotencyKey}`)) {
      return { remainingCredits: current, alreadyProcessed: true };
    }

    const updated = current + amount;
    this.userCreditsMap.set(key, updated);

    if (typeof window !== "undefined") {
      localStorage.setItem(`ai4life_credits_${key}`, updated.toString());
      localStorage.setItem("ai4life_credits", updated.toString());
    }

    if (idempotencyKey) {
      this.processedTransactions.add(`${key}_reward_${idempotencyKey}`);
    }

    this.transactionLogs.unshift({
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: key,
      amount,
      type: "reward",
      description,
      date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      idempotencyKey
    });

    return { remainingCredits: updated };
  }

  static getTransactionHistory(userId?: string): CreditTransaction[] {
    const key = userId || "anonymous_student_user";
    return this.transactionLogs.filter((t) => !t.userId || t.userId === key);
  }
}
