"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Check } from "lucide-react";

export function PricingSimple() {
  const [creditUsage, setCreditUsage] = useState(1240);

  const plans = [
    {
      name: "FREE",
      price: "₹0",
      credits: "100 AI credits / month",
      cta: "Start Free",
      popular: false,
      borderStyle: "border-slate-200 dark:border-slate-800"
    },
    {
      name: "PLUS",
      price: "₹299",
      period: "/ month",
      credits: "2,000 AI credits / month",
      cta: "Choose Plus",
      popular: true,
      borderStyle: "border-[#3157D5] dark:border-[#4F8CFF] shadow-xl ring-2 ring-blue-500/20"
    },
    {
      name: "PRO",
      price: "₹799",
      period: "/ month",
      credits: "10,000 AI credits / month",
      cta: "Choose Pro",
      popular: false,
      borderStyle: "border-indigo-500/40 dark:border-indigo-500/40"
    },
    {
      name: "BUSINESS",
      price: "Custom",
      credits: "Flexible usage for teams",
      cta: "Talk to us",
      popular: false,
      borderStyle: "border-slate-300 dark:border-slate-800"
    }
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
            <span className="text-slate-900 dark:text-white font-mono">{creditUsage.toLocaleString()} / 2,000 credits</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-900 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(creditUsage / 2000) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-[#3157D5] dark:bg-[#4F8CFF]"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
            <span>Credits reset monthly</span>
            <button
              onClick={() => setCreditUsage((prev) => (prev >= 1800 ? 300 : prev + 300))}
              className="text-[#3157D5] dark:text-[#4F8CFF] font-bold hover:underline"
              type="button"
            >
              Test action (+300)
            </button>
          </div>
        </div>

        {/* 4 Distinct Pricing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
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

                {/* Price Typography as Largest Element */}
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
                <a
                  href="#get-started"
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-xs transition-all ${
                    plan.popular
                      ? "bg-[#3157D5] dark:bg-[#4F8CFF] text-white dark:text-slate-950 hover:bg-[#2848b8] dark:hover:bg-[#3b79f0] shadow-md"
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
