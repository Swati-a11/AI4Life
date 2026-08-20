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
        if (!isNaN(parsed) && parsed >= 0) return parsed;
      }
      const genericStored = localStorage.getItem("ai4life_credits");
      if (genericStored !== null) {
        const parsed = parseInt(genericStored, 10);
        if (!isNaN(parsed) && parsed >= 0) return parsed;
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

  /**
   * Set credits for a user and sync to memory / storage and dispatch update
   */
  static setCredits(credits: number, userId?: string) {
    const key = userId || "anonymous_student_user";
    const safeCredits = Math.max(0, credits);
    this.userCreditsMap.set(key, safeCredits);

    if (typeof window !== "undefined") {
      localStorage.setItem(`ai4life_credits_${key}`, safeCredits.toString());
      localStorage.setItem("ai4life_credits", safeCredits.toString());
      window.dispatchEvent(
        new CustomEvent("ai4life:credits-updated", {
          detail: { credits: safeCredits, userId: key }
        })
      );
    }
  }

  /**
   * Trigger UI notification for credit deduction:
   * "20 credits used · [BALANCE] credits remaining"
   */
  static notifyCreditDeduction(cost: number, remainingCredits: number) {
    if (typeof window !== "undefined") {
      this.setCredits(remainingCredits);
      window.dispatchEvent(
        new CustomEvent("ai4life:credit-deducted", {
          detail: { cost, remainingCredits }
        })
      );
    }
  }

  /**
   * Synchronous deduction with in-memory atomic check & idempotency.
   */
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
        window.dispatchEvent(
          new CustomEvent("ai4life:credits-updated", {
            detail: { credits: remaining, userId: key }
          })
        );
        window.dispatchEvent(
          new CustomEvent("ai4life:credit-deducted", {
            detail: { cost, remainingCredits: remaining }
          })
        );
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
      error: "Insufficient credits." 
    };
  }

  /**
   * Async database-backed atomic deduction using MongoDB when available on server.
   * If MongoDB is unavailable or when called on client, gracefully falls back to state store.
   */
  static async deductCreditsAsync(
    cost: number = 20,
    userId?: string,
    idempotencyKey?: string,
    description: string = "AI Action"
  ): Promise<{ success: boolean; remainingCredits: number; alreadyProcessed?: boolean; error?: string }> {
    const key = userId || "anonymous_student_user";

    // 1. Idempotency Check
    if (idempotencyKey && this.processedTransactions.has(`${key}_deduct_${idempotencyKey}`)) {
      const current = this.getInitialCredits(key);
      return { success: true, remainingCredits: current, alreadyProcessed: true };
    }

    // 2. Try MongoDB Atomic Update on Server
    if (typeof window === "undefined") {
      try {
        const { getDb } = await import("../db/mongodb");
        const db = await getDb();
        if (db) {
          // Idempotency check in DB if available
          if (idempotencyKey) {
            const existingTx = await db.collection("credit_transactions").findOne({
              userId: key,
              idempotencyKey
            });
            if (existingTx) {
              const user = await db.collection("users").findOne({ clerkUserId: key });
              const userCredits = user?.credits ?? this.getInitialCredits(key);
              this.userCreditsMap.set(key, userCredits);
              this.processedTransactions.add(`${key}_deduct_${idempotencyKey}`);
              return { success: true, remainingCredits: userCredits, alreadyProcessed: true };
            }
          }

          // Atomic check and decrement: only update if credits >= cost
          const userBefore = await db.collection("users").findOne({ clerkUserId: key });
          if (!userBefore) {
            // If user doesn't exist yet, insert with NEW_USER_FREE_CREDITS
            await db.collection("users").insertOne({
              clerkUserId: key,
              name: "Student",
              email: `${key}@student.ai4life.com`,
              credits: NEW_USER_FREE_CREDITS,
              plan: "free",
              subscriptionStatus: "inactive",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }

          const updateResult = await db.collection("users").findOneAndUpdate(
            { clerkUserId: key, credits: { $gte: cost } },
            { 
              $inc: { credits: -cost }, 
              $set: { updatedAt: new Date().toISOString() } 
            },
            { returnDocument: "after" }
          );

          if (updateResult && updateResult.credits !== undefined) {
            const updatedCredits = updateResult.credits;
            this.userCreditsMap.set(key, updatedCredits);

            if (idempotencyKey) {
              this.processedTransactions.add(`${key}_deduct_${idempotencyKey}`);
              await db.collection("credit_transactions").insertOne({
                userId: key,
                amount: -cost,
                type: "deduction",
                description,
                idempotencyKey,
                createdAt: new Date().toISOString()
              }).catch(console.error);
            }

            return { success: true, remainingCredits: updatedCredits };
          } else {
            // User exists but has fewer credits than cost
            const userDoc = await db.collection("users").findOne({ clerkUserId: key });
            const currentBal = userDoc?.credits ?? 0;
            this.userCreditsMap.set(key, currentBal);
            return {
              success: false,
              remainingCredits: currentBal,
              error: "Insufficient credits."
            };
          }
        }
      } catch (err) {
        console.warn("MongoDB atomic credit deduction fallback:", err);
      }
    }

    // 3. Fallback to synchronous in-memory store
    return this.deductCredits(cost, key, idempotencyKey, description);
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
      window.dispatchEvent(
        new CustomEvent("ai4life:credits-updated", {
          detail: { credits: updated, userId: key }
        })
      );
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
