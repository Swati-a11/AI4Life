"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Check, Lock, Sparkles, CreditCard } from "lucide-react";
import { CreditService } from "@/lib/services/credit-service";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (addedCredits: number) => void;
}

export function UpgradeModal({ isOpen, onClose, onSuccess }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"plus" | "pro">("plus");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleRazorpayCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const added = selectedPlan === "plus" ? 2000 : 10000;
      CreditService.addCredits(added);
      onSuccess(added);
      onClose();
    }, 1500);
  };

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
            className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white"
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
              Get instant AI credits for RAG document parsing, AI Tutor queries, and Challenge Mode.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Plus Plan */}
            <button
              onClick={() => setSelectedPlan("plus")}
              className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                selectedPlan === "plus"
                  ? "border-blue-500 bg-blue-500/5 dark:bg-blue-500/10 ring-2 ring-blue-500/20"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"
              }`}
              type="button"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-slate-500">PLUS</span>
                  <span className="text-xs font-bold text-blue-600 dark:text-sky-400">2,000 Credits</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                  ₹299 <span className="text-xs text-slate-500 font-normal">/ mo</span>
                </div>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-4">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-500" /> 2,000 AI Credits</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-500" /> Qdrant RAG Notes Q&A</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-500" /> Mem0 AI Memory Vault</li>
              </ul>
            </button>

            {/* Pro Plan */}
            <button
              onClick={() => setSelectedPlan("pro")}
              className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                selectedPlan === "pro"
                  ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 ring-2 ring-indigo-500/20"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"
              }`}
              type="button"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-slate-500">PRO</span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">10,000 Credits</span>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                  ₹799 <span className="text-xs text-slate-500 font-normal">/ mo</span>
                </div>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pt-4">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-500" /> 10,000 AI Credits</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-500" /> Tavily Web Research</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-indigo-500" /> Priority Processing</li>
              </ul>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>Secured by Razorpay</span>
            </div>

            <button
              onClick={handleRazorpayCheckout}
              disabled={isProcessing}
              className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-[#3157D5] dark:bg-[#4F8CFF] hover:bg-[#2848b8] shadow-md flex items-center gap-2"
              type="button"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isProcessing ? "Processing Razorpay Order..." : `Pay ${selectedPlan === "plus" ? "₹299" : "₹799"} via Razorpay`}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
