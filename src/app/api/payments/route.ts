import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth-service";
import { UserService } from "@/lib/services/user-service";
import { RazorpayService } from "@/lib/services/razorpay-service";
import { getCreditsForPlanPrice } from "@/lib/config/pricing";

export async function POST(request: Request) {
  try {
    const clerkUserId = await AuthService.getUserIdFromRequest(request);
    if (!clerkUserId) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const { action, razorpayOrderId, razorpayPaymentId, razorpaySignature, amount, planId } = body;

    // 1. Create Order for Authenticated Clerk User
    if (action === "create-order") {
      // Validate amount is one of the known plan prices
      const validAmounts = [149, 399];
      const safeAmount = validAmounts.includes(amount) ? amount : 149;

      const order = await RazorpayService.createOrder(
        safeAmount,
        `rcpt_${clerkUserId}_${Date.now()}`
      );

      // Sync Clerk user with MongoDB
      await UserService.syncClerkUser(clerkUserId);

      return NextResponse.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: order.keyId,
        planId: planId || "starter",
      });
    }

    // 2. Verify Payment Signature Server-Side
    if (action === "verify") {
      if (!razorpayOrderId || !razorpayPaymentId) {
        return NextResponse.json({ success: false, error: "Missing verification parameters." }, { status: 400 });
      }

      const isValid = RazorpayService.verifyPaymentSignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature || ""
      );

      if (!isValid) {
        return NextResponse.json({ success: false, error: "Razorpay signature verification failed." }, { status: 400 });
      }

      // Determine credits from the paid amount
      const creditsGranted = getCreditsForPlanPrice(amount || 149);

      // Server-side MongoDB subscription update (never trust frontend status)
      await UserService.updateSubscription(
        clerkUserId,
        "premium",
        "active",
        undefined,
        undefined,
        amount || 149
      );

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully. Credits unlocked!",
        plan: planId || "starter",
        subscriptionStatus: "active",
        creditsGranted,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid payment action." }, { status: 400 });
  } catch (err) {
    console.error("Payment route error:", err);
    return NextResponse.json({ success: false, error: "Server error during payment processing." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const clerkUserId = await AuthService.getUserIdFromRequest(request);
    const user = await UserService.getUserByClerkId(clerkUserId);

    return NextResponse.json({
      success: true,
      plan: user?.plan || "free",
      subscriptionStatus: user?.subscriptionStatus || "inactive",
      isPremium: Boolean(user?.plan === "premium" && user?.subscriptionStatus === "active"),
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to fetch payment status." }, { status: 500 });
  }
}
