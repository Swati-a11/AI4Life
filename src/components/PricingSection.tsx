"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Zap } from "lucide-react";
import { PLANS, FREE_PLAN } from "@/lib/config/pricing";

export function PricingSection() {
  const [creditUsage, setCreditUsage] = useState(620);

  const plans = [
    {
      name: FREE_PLAN.name,
      price: FREE_PLAN.priceDisplay,
      credits: `${FREE_PLAN.creditsDisplay} / month`,
      diffs: [
        `${FREE_PLAN.creditsDisplay} AI credits monthly`,
        "Upload basic PDFs & notes",
        "Standard answer generation"
      ],
      cta: FREE_PLAN.ctaLabel,
      popular: FREE_PLAN.popular
    },
    {
      name: PLANS.starter.name,
      price: PLANS.starter.priceDisplay,
      period: PLANS.starter.period,
      credits: `${PLANS.starter.creditsDisplay} / month`,
      diffs: [
        `${PLANS.starter.creditsDisplay} AI credits monthly`,
        "Persistent context memory",
        "Audio transcripts & quizzes"
      ],
      cta: PLANS.starter.ctaLabel,
      popular: PLANS.starter.popular
    },
    {
      name: PLANS.pro.name,
      price: PLANS.pro.priceDisplay,
      period: PLANS.pro.period,
      credits: `${PLANS.pro.creditsDisplay} / month`,
      diffs: [
        `${PLANS.pro.creditsDisplay} AI credits monthly`,
        "AI Se Baazi Challenge Mode",
        "Priority Processing"
      ],
      cta: PLANS.pro.ctaLabel,
      popular: PLANS.pro.popular
    },
    {
      name: "BUSINESS",
      price: "Custom",
      credits: "Custom usage",
      diffs: [
        "Custom credit pool",
        "Dedicated onboarding",
        "Custom workspace rules"
      ],
      cta: "Contact Us",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            PRICING
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
            Start free. Pay when you <span className="gradient-text-cyan">need more.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            AI credits keep usage simple and predictable.
          </p>
        </div>

        {/* Interactive Credit Meter Simulator */}
        <div className="max-w-md mx-auto mb-12 p-4 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 text-center space-y-3 shadow-md">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
            <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
              <Zap className="w-4 h-4 fill-current" />
              Usage Meter
            </span>
            <span>{creditUsage.toLocaleString()} / {PLANS.starter.credits.toLocaleString()} credits used</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-950 overflow-hidden border border-slate-300/40 dark:border-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(creditUsage / PLANS.starter.credits) * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-cyan-400 to-sky-400"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Credits reset monthly.</span>
            <button
              onClick={() => setCreditUsage((prev) => (prev >= 900 ? 200 : prev + 350))}
              className="text-cyan-600 dark:text-cyan-400 underline font-semibold hover:opacity-80"
              type="button"
            >
              Simulate action (+350)
            </button>
          </div>
        </div>

        {/* 4 Pricing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl glass-card p-6 border flex flex-col justify-between transition-all ${
                plan.popular
                  ? "border-cyan-500/60 shadow-lg ring-2 ring-cyan-500/20"
                  : "border-slate-200/80 dark:border-slate-800"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 font-heading">
                    {plan.name}
                  </span>
                  {plan.popular && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                      POPULAR
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white font-heading">{plan.price}</span>
                  {plan.period && <span className="text-xs text-slate-500">{plan.period}</span>}
                </div>

                <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mb-4">{plan.credits}</div>

                <div className="space-y-2 pt-4 border-t border-slate-200/60 dark:border-slate-800">
                  {plan.diffs.map((diff) => (
                    <div key={diff} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      <Check className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                      <span>{diff}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <a
                  href="#try-ai4life"
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all ${
                    plan.popular
                      ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-md"
                      : "bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
