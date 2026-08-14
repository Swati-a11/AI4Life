export class CreditService {
  private static currentCredits = 420;

  static getCredits(): number {
    return this.currentCredits;
  }

  static deductCredits(cost: number = 10): { success: boolean; remainingCredits: number } {
    if (this.currentCredits >= cost) {
      this.currentCredits -= cost;
      return { success: true, remainingCredits: this.currentCredits };
    }
    return { success: false, remainingCredits: this.currentCredits };
  }

  static addCredits(amount: number): number {
    this.currentCredits += amount;
    return this.currentCredits;
  }
}
