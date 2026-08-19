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

  private static getInitialCredits(userId?: string): number {
    const key = userId || "default_user";
    if (!this.userCreditsMap.has(key)) {
      this.userCreditsMap.set(key, 420);
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
    description: string = "AI Se Baazi Challenge"
  ): { success: boolean; remainingCredits: number; alreadyProcessed?: boolean } {
    const key = userId || "default_user";
    const current = this.getInitialCredits(key);

    if (idempotencyKey && this.processedTransactions.has(`${key}_deduct_${idempotencyKey}`)) {
      return { success: true, remainingCredits: current, alreadyProcessed: true };
    }

    if (current >= cost) {
      const remaining = current - cost;
      this.userCreditsMap.set(key, remaining);

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

    return { success: false, remainingCredits: current };
  }

  static addCredits(
    amount: number = 20,
    userId?: string,
    idempotencyKey?: string,
    description: string = "Quiz Completion Reward"
  ): { remainingCredits: number; alreadyProcessed?: boolean } {
    const key = userId || "default_user";
    const current = this.getInitialCredits(key);

    if (idempotencyKey && this.processedTransactions.has(`${key}_reward_${idempotencyKey}`)) {
      return { remainingCredits: current, alreadyProcessed: true };
    }

    const updated = current + amount;
    this.userCreditsMap.set(key, updated);

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
    const key = userId || "default_user";
    return this.transactionLogs.filter((t) => !t.userId || t.userId === key);
  }
}
