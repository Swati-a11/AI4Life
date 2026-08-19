import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth-service";
import { UserService } from "@/lib/services/user-service";
import { RazorpayService } from "@/lib/services/razorpay-service";

export async function POST(request: Request) {
  try {
    const clerkUserId = await AuthService.getUserIdFromRequest(request);
    if (!clerkUserId) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const { action, razorpayOrderId, razorpayPaymentId, razorpaySignature, amount } = body;

    // 1. Create Order for Authenticated Clerk User
    if (action === "create-order") {
      const order = await RazorpayService.createOrder(amount || 499, `rcpt_${clerkUserId}_${Date.now()}`);
      
      // Sync Clerk user with MongoDB
      await UserService.syncClerkUser(clerkUserId);

      return NextResponse.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: order.keyId,
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

      // Server-side MongoDB subscription update (never trust frontend status)
      await UserService.updateSubscription(clerkUserId, "premium", "active");

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully. Premium features unlocked!",
        plan: "premium",
        subscriptionStatus: "active",
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
