/**
 * AI4Life Pricing Configuration — SINGLE SOURCE OF TRUTH
 *
 * All plan definitions, prices, credits, and feature costs must
 * be read from this file. Do NOT hardcode pricing anywhere else.
 */

// ── Plan Definitions ────────────────────────────────────────────────────────

export const PLANS = {
  starter: {
    id: "starter",
    name: "STARTER",
    displayName: "Starter",
    price: 149,           // INR — actual Razorpay amount
    priceDisplay: "₹149",
    period: "/ month",
    credits: 1000,
    creditsDisplay: "1,000 credits",
    ctaLabel: "Get Starter",
    popular: true,
    borderStyle: "border-[#3157D5] dark:border-[#4F8CFF] shadow-xl ring-2 ring-blue-500/20",
    features: [
      "1,000 AI Credits / month",
      "AI Tutor — All Learning Modes",
      "Source-Grounded Material Q&A",
      "PDF / DOCX / TXT / MP4 upload",
    ],
  },
  pro: {
    id: "pro",
    name: "PRO",
    displayName: "Pro",
    price: 399,           // INR — actual Razorpay amount
    priceDisplay: "₹399",
    period: "/ month",
    credits: 3000,
    creditsDisplay: "3,000 credits",
    ctaLabel: "Get Pro",
    popular: false,
    borderStyle: "border-indigo-500/40 dark:border-indigo-500/40",
    features: [
      "3,000 AI Credits / month",
      "Everything in Starter",
      "AI Se Baazi Challenge Mode",
      "Priority Processing",
    ],
  },
} as const;

// ── Free Tier ────────────────────────────────────────────────────────────────

export const FREE_PLAN = {
  id: "free",
  name: "FREE",
  displayName: "Free",
  price: 0,
  priceDisplay: "₹0",
  credits: 100,
  creditsDisplay: "100 credits",
  ctaLabel: "Start Free",
  popular: false,
  borderStyle: "border-slate-200 dark:border-slate-800",
  features: [
    "100 AI Credits / month",
    "Basic PDF upload",
    "Standard AI Tutor access",
  ],
};

// ── Default starting credits for new users ────────────────────────────────────

export const NEW_USER_FREE_CREDITS = 200;

// ── Credits granted when a plan is purchased ─────────────────────────────────

export function getCreditsForPlanPrice(amountINR: number): number {
  if (amountINR === PLANS.pro.price) return PLANS.pro.credits;
  if (amountINR === PLANS.starter.price) return PLANS.starter.credits;
  // Fallback — grant starter credits
  return PLANS.starter.credits;
}

// ── Feature Credit Costs ──────────────────────────────────────────────────────

export const CREDIT_COSTS = {
  AI_SE_BAAZI: 20,       // Challenge Mode battle
  STUDY_PLAN: 20,        // Study Plan generation
  IMAGE_GENERATION: 20,  // Image generation
  AI_TUTOR_QUERY: 10,    // AI Tutor query
  MATERIAL_QA: 10,       // Source-grounded Q&A
  QUIZ_GENERATION: 5,    // Quiz Lab
  HINT: 5,               // Hint request
} as const;

export type PlanId = "free" | "starter" | "pro";
