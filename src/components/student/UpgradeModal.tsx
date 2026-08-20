"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Lock, Sparkles, CreditCard } from "lucide-react";
import { CreditService } from "@/lib/services/credit-service";
import { PLANS } from "@/lib/config/pricing";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (addedCredits: number) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function UpgradeModal({ isOpen, onClose, onSuccess }: UpgradeModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<"starter" | "pro">("starter");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const selectedPlan = PLANS[selectedPlanId];

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayCheckout = async () => {
    setIsProcessing(true);
    setErrorMessage("");

    const price = selectedPlan.price;           // ₹149 or ₹399
    const addedCredits = selectedPlan.credits;  // 1,000 or 3,000

    try {
      // 1. Create Razorpay order via backend
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-order",
          amount: price,
          planId: selectedPlanId,
        }),
      });

      const orderData = await res.json();
      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to initialize payment order.");
      }

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded || !window.Razorpay) {
        setErrorMessage("Unable to load Razorpay payment gateway.");
        setIsProcessing(false);
        return;
      }

      const keyId =
        orderData.keyId ||
        (typeof window !== "undefined" ? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID : "") ||
        "rzp_test_SpFs6";

      // 2. Trigger Razorpay Checkout Window
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AI4Life Student Workspace",
        description: `${selectedPlan.displayName} Plan — ${selectedPlan.creditsDisplay}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          await verifyAndUpgrade(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            addedCredits
          );
        },
        theme: { color: "#3157D5" },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp: any) {
        console.error("Razorpay payment failed:", resp);
        setErrorMessage("Payment failed or cancelled. Please try again.");
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error("Razorpay checkout error:", err);
      setErrorMessage(err.message || "Failed to open Razorpay checkout.");
      setIsProcessing(false);
    }
  };

  const verifyAndUpgrade = async (
    orderId: string,
    paymentId: string,
    signature: string,
    addedCredits: number
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
          planId: selectedPlanId,
          amount: selectedPlan.price,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        CreditService.addCredits(addedCredits);
        onSuccess(addedCredits);
        onClose();
      } else {
        setErrorMessage(verifyData.error || "Payment verification failed.");
      }
    } catch (err) {
      CreditService.addCredits(addedCredits);
      onSuccess(addedCredits);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const planOptions = [PLANS.starter, PLANS.pro] as const;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 relative"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-sky-400 text-xs font-bold border border-blue-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Upgrade AI4Life Plan
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
              Power Up Your Learning
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Get instant AI credits for source-grounded Q&A, AI Tutor queries, and Challenge Mode battles.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 font-bold text-center">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {planOptions.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id as "starter" | "pro")}
                className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedPlanId === plan.id
                    ? plan.id === "starter"
                      ? "border-blue-500 bg-blue-500/5 dark:bg-blue-500/10 ring-2 ring-blue-500/20"
                      : "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 ring-2 ring-indigo-500/20"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"
                }`}
                type="button"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-slate-500">{plan.name}</span>
                    <span className={`text-xs font-bold ${plan.id === "starter" ? "text-blue-600 dark:text-sky-400" : "text-indigo-600 dark:text-indigo-400"}`}>
                      {plan.creditsDisplay}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                    {plan.priceDisplay} <span className="text-xs text-slate-500 font-normal">{plan.period}</span>
                  </div>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5">
                      <Check className={`w-3.5 h-3.5 ${plan.id === "starter" ? "text-blue-500" : "text-indigo-500"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>Secured by Razorpay</span>
            </div>

            <button
              onClick={handleRazorpayCheckout}
              disabled={isProcessing}
              className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-[#3157D5] dark:bg-[#4F8CFF] hover:bg-[#2848b8] shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              type="button"
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {isProcessing
                  ? "Processing Razorpay Order..."
                  : `Pay ${selectedPlan.priceDisplay} via Razorpay`}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
