import { NextResponse } from "next/server";
import { RazorpayService } from "@/lib/services/razorpay-service";
import { UserService } from "@/lib/services/user-service";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";

    // 1. Verify Webhook Signature Server-Side
    const isValid = RazorpayService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid webhook signature." }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const payload = event.payload;

    console.log(`Razorpay Webhook Event Received: ${eventType}`);

    // 2. Handle Payment & Subscription Events
    if (eventType === "payment.captured" || eventType === "subscription.charged" || eventType === "subscription.activated") {
      const entity = payload?.payment?.entity || payload?.subscription?.entity;
      const notes = entity?.notes || {};
      const clerkUserId = notes.clerkUserId;

      if (clerkUserId) {
        await UserService.updateSubscription(
          clerkUserId,
          "premium",
          "active",
          entity.customer_id,
          entity.subscription_id || entity.id
        );
      }
    } else if (eventType === "subscription.halted" || eventType === "subscription.cancelled") {
      const entity = payload?.subscription?.entity;
      const clerkUserId = entity?.notes?.clerkUserId;

      if (clerkUserId) {
        await UserService.updateSubscription(
          clerkUserId,
          "free",
          "cancelled"
        );
      }
    } else if (eventType === "subscription.completed" || eventType === "subscription.expired") {
      const entity = payload?.subscription?.entity;
      const clerkUserId = entity?.notes?.clerkUserId;

      if (clerkUserId) {
        await UserService.updateSubscription(
          clerkUserId,
          "free",
          "expired"
        );
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (err) {
    console.error("Razorpay Webhook Error:", err);
    return NextResponse.json({ success: false, error: "Webhook handler failed." }, { status: 500 });
  }
}
