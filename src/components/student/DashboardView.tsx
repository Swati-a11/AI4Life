"use client";

import { motion } from "framer-motion";
import {
  MessageSquare,
  Upload,
  Sparkles,
  Zap,
  Search,
  Clock,
  CheckCircle2,
  Trophy,
  Flame,
  FileText,
  ArrowRight,
  BookOpen
} from "lucide-react";
import { StudentTab } from "@/lib/types/student-types";

interface DashboardViewProps {
  userName: string;
  onTabChange: (tab: StudentTab) => void;
  onOpenUpgradeModal: () => void;
}

export function DashboardView({ userName, onTabChange, onOpenUpgradeModal }: DashboardViewProps) {
  const quickActions = [
    { label: "Ask AI", icon: MessageSquare, tab: "tutor" as StudentTab, color: "text-[#3157D5] dark:text-[#4F8CFF]", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Upload Notes", icon: Upload, tab: "materials" as StudentTab, color: "text-[#0D9488] dark:text-[#38D9C5]", bg: "bg-teal-500/10 border-teal-500/20" },
    { label: "Generate Quiz", icon: Sparkles, tab: "quiz-lab" as StudentTab, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20" },
    { label: "Challenge AI", icon: Zap, tab: "challenge" as StudentTab, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
    { label: "Research Topic", icon: Search, tab: "research" as StudentTab, color: "text-indigo-500", bg: "bg-indigo-500/10 border-indigo-500/20" },
  ];

  const recentItems = [
    { id: "1", title: "Data_Structures_Chapter3.pdf", subject: "Computer Science", time: "2 hours ago", progress: 75, type: "PDF" },
    { id: "2", title: "Algorithms & Time Complexity", subject: "Software Engineering", time: "Yesterday", progress: 90, type: "Topic" },
    { id: "3", title: "Binary Search Midterm Quiz", subject: "Algorithms", time: "3 days ago", progress: 100, type: "Quiz" },
    { id: "4", title: "Operating Systems Lecture 5", subject: "Computer Systems", time: "4 days ago", progress: 40, type: "Note" },
  ];

  return (
    <div className="space-y-8">
      
      {/* Top Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-[#3157D5] dark:text-[#4F8CFF] text-xs font-bold border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            AI4Life Student Workspace
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-heading">
            Good evening, {userName || "Swati"}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
            Ready to make today's study session count?
          </p>
        </div>

        <button
          onClick={onOpenUpgradeModal}
          className="self-start md:self-auto px-5 py-3 rounded-2xl bg-[#3157D5] dark:bg-[#4F8CFF] text-white font-bold text-xs shadow-md hover:bg-[#2848b8] transition-colors flex items-center gap-2 z-10"
          type="button"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Get More Credits</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Study Time Today</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-heading">3.5 hrs</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">+45 mins vs yesterday</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Questions Solved</span>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-heading">48</div>
          <div className="text-[11px] text-slate-500 font-medium">12 RAG notes queries</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Quiz Score Avg</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-heading">92%</div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">Top 5% in workspace</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Study Streak</span>
            <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-heading">5 Days</div>
          <div className="text-[11px] text-orange-600 dark:text-orange-400 font-bold">Best: 12 days</div>
        </div>
      </div>

      {/* DASHBOARD QUICK ACTIONS SECTION */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
          What do you want to do?
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickActions.map((act) => {
            const Icon = act.icon;
            return (
              <motion.button
                key={act.label}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onTabChange(act.tab)}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all bg-white dark:bg-[#111722] ${act.bg} cursor-pointer group`}
                type="button"
              >
                <div className={`p-3 rounded-xl w-max bg-white dark:bg-slate-900 ${act.color} shadow-xs`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="pt-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 dark:text-white font-heading">{act.label}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* CONTINUE LEARNING SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
            Continue Learning
          </h2>
          <button
            onClick={() => onTabChange("materials")}
            className="text-xs font-bold text-[#3157D5] dark:text-[#4F8CFF] hover:underline"
            type="button"
          >
            View All Materials
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -3 }}
              className="p-5 rounded-2xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
                    {item.type}
                  </span>
                  <span className="text-slate-400">{item.time}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                  {item.title}
                </h3>
                <span className="text-xs text-slate-500 font-medium">{item.subject}</span>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Progress</span>
                  <span>{item.progress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <div className="h-full bg-[#3157D5] dark:bg-[#4F8CFF]" style={{ width: `${item.progress}%` }} />
                </div>
                <button
                  onClick={() => onTabChange(item.type === "PDF" ? "ask-notes" : item.type === "Quiz" ? "quiz-lab" : "tutor")}
                  className="w-full py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1 mt-2"
                  type="button"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}
