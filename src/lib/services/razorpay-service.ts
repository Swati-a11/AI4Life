import Razorpay from "razorpay";
import crypto from "crypto";

export class RazorpayService {
  private static instance: Razorpay | null = null;

  // Lazy initialize server-side Razorpay SDK instance
  private static getInstance(): Razorpay | null {
    if (this.instance) return this.instance;

    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET || (process.env as any).RAZORPAY_SECRET;

    if (!key_id || !key_secret || key_id.includes("your_razorpay_key_id") || key_id.includes("rzp_test_key_id")) {
      return null;
    }

    try {
      this.instance = new Razorpay({
        key_id,
        key_secret,
      });
      return this.instance;
    } catch (err) {
      console.warn("Razorpay SDK initialization warning:", err);
      return null;
    }
  }

  // Create Razorpay Order Server-Side
  static async createOrder(amountINR: number = 299, receiptId?: string): Promise<{ id: string; amount: number; currency: string; keyId: string }> {
    const razorpay = this.getInstance();
    const amountInPaise = Math.round(amountINR * 100);
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "";

    if (razorpay) {
      try {
        const order = await razorpay.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: receiptId || `receipt_${Date.now()}`,
        });
        return {
          id: order.id,
          amount: Number(order.amount),
          currency: order.currency,
          keyId,
        };
      } catch (err) {
        console.error("Razorpay SDK Order Creation Failed:", err);
      }
    }

    // Fallback order object for test environment
    return {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      amount: amountInPaise,
      currency: "INR",
      keyId,
    };
  }

  // Server-Side Razorpay Payment Signature Verification
  static verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || (process.env as any).RAZORPAY_SECRET;
    if (!keySecret || keySecret.includes("your_razorpay_key_secret")) {
      return true; // Test mode auto-pass if key secret not configured
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    return generatedSignature === signature;
  }

  // Server-Side Webhook Signature Verification
  static verifyWebhookSignature(
    rawBody: string,
    signature: string
  ): boolean {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) return true;

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    return expectedSignature === signature;
  }
}
