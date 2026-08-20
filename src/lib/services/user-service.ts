import { getDb } from "../db/mongodb";
import { UserDoc } from "../db/models";
import { NEW_USER_FREE_CREDITS, getCreditsForPlanPrice } from "../config/pricing";

export class UserService {
  // Sync or create a MongoDB user record bound to Clerk User ID
  static async syncClerkUser(
    clerkUserId: string,
    name?: string,
    email?: string,
    imageUrl?: string
  ): Promise<UserDoc> {
    const db = await getDb();
    const defaultUser: UserDoc = {
      clerkUserId,
      name: name || "Student",
      email: email || `${clerkUserId}@student.ai4life.com`,
      imageUrl: imageUrl || "",
      credits: NEW_USER_FREE_CREDITS,
      plan: "free",
      subscriptionStatus: "inactive",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!db) {
      return defaultUser;
    }

    const usersCollection = db.collection("users");
    const existing = (await usersCollection.findOne({ clerkUserId })) as UserDoc | null;

    if (existing) {
      // Update basic fields if changed
      const updateData: Partial<UserDoc> = { updatedAt: new Date().toISOString() };
      if (name && name !== existing.name) updateData.name = name;
      if (email && email !== existing.email) updateData.email = email;
      if (imageUrl && imageUrl !== existing.imageUrl) updateData.imageUrl = imageUrl;

      if (Object.keys(updateData).length > 1) {
        await usersCollection.updateOne({ clerkUserId }, { $set: updateData });
      }
      return { ...existing, ...updateData };
    }

    // Insert new user record
    await usersCollection.insertOne(defaultUser);
    return defaultUser;
  }

  // Get user profile by clerkUserId
  static async getUserByClerkId(clerkUserId: string): Promise<UserDoc | null> {
    const db = await getDb();
    if (!db) return null;
    return (await db.collection("users").findOne({ clerkUserId })) as UserDoc | null;
  }

  // Check if user has active premium subscription
  static async isPremium(clerkUserId: string): Promise<boolean> {
    const user = await this.getUserByClerkId(clerkUserId);
    return Boolean(user && user.plan === "premium" && user.subscriptionStatus === "active");
  }

  // Update subscription status in MongoDB (server-side only)
  static async updateSubscription(
    clerkUserId: string,
    plan: "free" | "premium",
    subscriptionStatus: "inactive" | "active" | "cancelled" | "expired",
    razorpayCustomerId?: string,
    razorpaySubscriptionId?: string,
    paidAmountINR?: number
  ): Promise<boolean> {
    const db = await getDb();
    if (!db) return false;

    const updateFields: Partial<UserDoc> = {
      plan,
      subscriptionStatus,
      updatedAt: new Date().toISOString(),
    };

    if (plan === "premium" && subscriptionStatus === "active") {
      // Grant credits based on the plan amount paid — reads from pricing config
      updateFields.credits = paidAmountINR
        ? getCreditsForPlanPrice(paidAmountINR)
        : getCreditsForPlanPrice(149); // Default: Starter plan credits
    }

    if (razorpayCustomerId) updateFields.razorpayCustomerId = razorpayCustomerId;
    if (razorpaySubscriptionId) updateFields.razorpaySubscriptionId = razorpaySubscriptionId;

    await db.collection("users").updateOne(
      { clerkUserId },
      { $set: updateFields }
    );

    return true;
  }
}
