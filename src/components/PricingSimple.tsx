"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Zap, Loader2, X, CreditCard, AlertCircle } from "lucide-react";
import { PLANS, FREE_PLAN } from "@/lib/config/pricing";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type PaymentState = "idle" | "creating_order" | "opening_checkout" | "processing" | "success" | "failed" | "cancelled";

// Cleanup helper to restore body scroll and remove injected Razorpay backdrop overlays
const cleanupRazorpayDom = () => {
  try {
    document.body.style.overflow = "";
    document.body.style.pointerEvents = "";
    const overlays = document.querySelectorAll(".razorpay-container, iframe[name^='razorpay']");
    overlays.forEach((el) => el.remove());
  } catch (err) {
    // Teardown fallback
  }
};

// Safe idempotent script loading - check if already injected
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export function PricingSimple() {
  const [creditUsage, setCreditUsage] = useState(620);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [noKeyDialogPlan, setNoKeyDialogPlan] = useState<{ name: string; price: string } | null>(null);

  useEffect(() => {
    return () => {
      cleanupRazorpayDom();
    };
  }, []);

  const handleCtaClick = async (plan: any) => {
    if (plan.id === "free") {
      window.location.href = "/student";
      return;
    }
    if (plan.id === "business") {
      window.location.href = "mailto:support@ai4life.com";
      return;
    }
    await startRazorpayCheckout(plan.id, plan.name, plan.price);
  };

  const startRazorpayCheckout = async (planId: string, planName: string, priceAmount: number) => {
    setProcessingPlan(planId);
    setPaymentState("creating_order");

    try {
      // 0. Early key check — show dialog if no real key configured
      const envKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
      const isRealKey = Boolean(
        envKeyId &&
        envKeyId.startsWith("rzp_") &&
        envKeyId.length >= 20 &&
        !envKeyId.includes("your_") &&
        !envKeyId.includes("SpFs6") // known placeholder fragment
      );

      if (!isRealKey) {
        // No real Razorpay key — show configure dialog, do NOT redirect
        setProcessingPlan(null);
        setPaymentState("idle");
        setNoKeyDialogPlan({ name: planName, price: `₹${priceAmount}` });
        return;
      }

      // 1. Create order on backend via POST /api/payments
      let orderData: any = null;
      try {
        const res = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create-order",
            amount: priceAmount,
            planId,
          }),
        });
        orderData = await res.json();
      } catch (err) {
        console.error("Failed to create order on server API:", err);
      }

      setPaymentState("opening_checkout");

      // 2. Load Razorpay Checkout Script idempotently
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        console.error("Razorpay SDK script failed to load");
        setProcessingPlan(null);
        setPaymentState("idle");
        return;
      }

      const keyId = envKeyId || orderData?.keyId || "";
      const userName = "Student";
      const userEmail = "student@ai4life.com";

      // 3. Construct Razorpay Options & open Checkout Gateway
      const options = {
        key: keyId,
        amount: (orderData?.amount || Math.round(priceAmount * 100)),
        currency: orderData?.currency || "INR",
        name: "AI4Life",
        description: `AI4Life ${planName} Plan`,
        order_id: (orderData?.success && orderData?.orderId) ? orderData.orderId : undefined,
        prefill: {
          name: userName,
          email: userEmail,
        },
        notes: {
          planId,
          plan: planName,
          userId: "default_student_user",
        },
        handler: async function (response: any) {
          setPaymentState("processing");
          await verifyAndComplete(
            response.razorpay_order_id || orderData?.orderId,
            response.razorpay_payment_id,
            response.razorpay_signature,
            planId,
            priceAmount
          );
        },
        theme: { color: "#3157D5" },
        modal: {
          ondismiss: function () {
            setPaymentState("cancelled");
            setProcessingPlan(null);
            cleanupRazorpayDom();
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (failureResp: any) {
        console.error("Razorpay payment failed:", failureResp);
        setPaymentState("failed");
        setProcessingPlan(null);
        cleanupRazorpayDom();
      });

      rzp.open();
    } catch (err) {
      console.error("Razorpay initialization error:", err);
      setProcessingPlan(null);
      setPaymentState("idle");
      cleanupRazorpayDom();
    }
  };

  const verifyAndComplete = async (
    orderId: string,
    paymentId: string,
    signature: string,
    planId: string,
    priceAmount: number
  ) => {
    try {
      const verifyRes = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
          planId,
          amount: priceAmount,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        setPaymentState("success");
        window.location.href = "/student";
      } else {
        setPaymentState("failed");
        alert(verifyData.error || "Payment signature verification failed.");
      }
    } catch (err) {
      console.error("Error during payment verification API call:", err);
      setPaymentState("failed");
    } finally {
      setProcessingPlan(null);
      cleanupRazorpayDom();
    }
  };

  const plans = [
    {
      id: "free",
      name: FREE_PLAN.name,
      price: FREE_PLAN.priceDisplay,
      amount: FREE_PLAN.price,
      credits: `${FREE_PLAN.creditsDisplay} / month`,
      cta: FREE_PLAN.ctaLabel,
      popular: FREE_PLAN.popular,
      borderStyle: FREE_PLAN.borderStyle,
    },
    {
      id: PLANS.starter.id,
      name: PLANS.starter.name,
      price: PLANS.starter.priceDisplay,
      amount: PLANS.starter.price,
      period: PLANS.starter.period,
      credits: `${PLANS.starter.creditsDisplay} / month`,
      cta: PLANS.starter.ctaLabel,
      popular: PLANS.starter.popular,
      borderStyle: PLANS.starter.borderStyle,
    },
    {
      id: PLANS.pro.id,
      name: PLANS.pro.name,
      price: PLANS.pro.priceDisplay,
      amount: PLANS.pro.price,
      period: PLANS.pro.period,
      credits: `${PLANS.pro.creditsDisplay} / month`,
      cta: PLANS.pro.ctaLabel,
      popular: PLANS.pro.popular,
      borderStyle: PLANS.pro.borderStyle,
    },
    {
      id: "business",
      name: "BUSINESS",
      price: "Custom",
      amount: 0,
      credits: "Flexible usage for teams",
      cta: "Talk to us",
      popular: false,
      borderStyle: "border-slate-300 dark:border-slate-800",
    },
  ];

  return (
    <section id="pricing" className="py-28 border-t border-slate-200/80 dark:border-slate-800/80 bg-[#EEF1F7] dark:bg-[#0D111A] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="small-label text-slate-600 dark:text-slate-400">
            PRICING
          </span>
          <h2 className="section-headline text-slate-900 dark:text-white font-heading">
            Start free. Upgrade when you <span className="text-[#3157D5] dark:text-[#4F8CFF]">need more.</span>
          </h2>
          <p className="body-lead text-slate-700 dark:text-slate-200 font-normal">
            Simple plans. Predictable AI usage.
          </p>
        </div>

        {/* Subtle Animated Credit Usage Meter */}
        <div className="max-w-sm mx-auto mb-14 p-4 rounded-2xl bg-white dark:bg-[#111722] border border-slate-300/80 dark:border-slate-800 shadow-md space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
            <span className="flex items-center gap-1.5 text-[#3157D5] dark:text-[#4F8CFF]">
              <Zap className="w-4 h-4 fill-current" />
              Credit Usage
            </span>
            <span className="text-slate-900 dark:text-white font-mono">{creditUsage.toLocaleString()} / {PLANS.starter.credits.toLocaleString()} credits</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-900 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(creditUsage / PLANS.starter.credits) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-[#3157D5] dark:bg-[#4F8CFF]"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
            <span>Credits reset monthly</span>
            <button
              onClick={() => setCreditUsage((prev) => (prev >= 900 ? 200 : prev + 300))}
              className="text-[#3157D5] dark:text-[#4F8CFF] font-bold hover:underline cursor-pointer"
              type="button"
            >
              Test action (+300)
            </button>
          </div>
        </div>

        {/* 4 Distinct Pricing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isThisProcessing = processingPlan === plan.id;
            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all bg-white dark:bg-[#111722] border ${plan.borderStyle}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 font-heading">
                      {plan.name}
                    </span>
                    {plan.popular && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[#3157D5] dark:text-[#4F8CFF] border border-blue-500/20">
                        MOST POPULAR
                      </span>
                    )}
                  </div>

                  {/* Price Typography */}
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
                      {plan.price}
                    </span>
                    {plan.period && <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{plan.period}</span>}
                  </div>

                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-8">
                    {plan.credits}
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => handleCtaClick(plan)}
                    disabled={Boolean(processingPlan)}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs transition-all cursor-pointer disabled:opacity-60 ${
                      plan.popular
                        ? "bg-[#3157D5] dark:bg-[#4F8CFF] text-[#111722] dark:text-[#0D111A] hover:bg-[#2848b8] dark:hover:bg-[#3b79f0] shadow-md"
                        : "bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                    }`}
                    type="button"
                  >
                    {isThisProcessing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Opening Razorpay...</span>
                      </>
                    ) : (
                      <>
                        <span>{plan.cta}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Razorpay Not Configured Dialog */}
      <AnimatePresence>
        {noKeyDialogPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setNoKeyDialogPlan(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 p-7 shadow-2xl space-y-5 relative"
            >
              <button
                onClick={() => setNoKeyDialogPlan(null)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white font-heading">
                    Payment Gateway Not Configured
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {noKeyDialogPlan.name} Plan — {noKeyDialogPlan.price}/month
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white">To enable payments, add your Razorpay keys:</p>
                <div className="space-y-1.5 font-mono text-[11px] bg-white dark:bg-slate-950 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                  <p className="text-slate-500"># In .env or Vercel environment variables:</p>
                  <p><span className="text-blue-600 dark:text-sky-400">NEXT_PUBLIC_RAZORPAY_KEY_ID</span>=rzp_test_XXXX</p>
                  <p><span className="text-blue-600 dark:text-sky-400">RAZORPAY_KEY_ID</span>=rzp_test_XXXX</p>
                  <p><span className="text-blue-600 dark:text-sky-400">RAZORPAY_KEY_SECRET</span>=XXXX</p>
                </div>
                <p className="text-slate-500">Get your keys from <a href="https://dashboard.razorpay.com" target="_blank" rel="noreferrer" className="text-[#3157D5] dark:text-[#4F8CFF] underline font-semibold">dashboard.razorpay.com</a></p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setNoKeyDialogPlan(null)}
                  className="flex-1 py-3 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  type="button"
                >
                  Close
                </button>
                <a
                  href="https://dashboard.razorpay.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white bg-[#3157D5] dark:bg-[#4F8CFF] hover:bg-[#2848b8] transition-all shadow-md"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Set Up Razorpay
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
