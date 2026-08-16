"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart2, TrendingUp, Clock, CheckCircle2, Trophy, Flame, Target, BookOpen } from "lucide-react";

export function ProgressView() {
  const [progressData, setProgressData] = useState<any>(null);
  const [hasActivity, setHasActivity] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/progress")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setHasActivity(Boolean(data.hasActivity));
          if (data.progress) {
            setProgressData(data.progress);
          }
        }
      })
      .catch(console.error);
  }, []);

  const weeklyData = [
    { day: "Mon", hours: 2.5 },
    { day: "Tue", hours: 4.0 },
    { day: "Wed", hours: 3.0 },
    { day: "Thu", hours: 3.5 },
    { day: "Fri", hours: 5.0 },
    { day: "Sat", hours: 2.0 },
    { day: "Sun", hours: 4.2 },
  ];

  const topicsMastered = [
    { name: "Binary Search Trees", progress: 95, status: "Mastered" },
    { name: "Time & Space Complexity", progress: 90, status: "Mastered" },
    { name: "Operating Systems Paging", progress: 65, status: "Review Needed" },
    { name: "Dynamic Programming DP States", progress: 40, status: "Weak Topic" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-[#3157D5] dark:text-[#4F8CFF] text-xs font-bold border border-blue-500/20">
          <BarChart2 className="w-3.5 h-3.5" />
          Study Analytics & Mastery
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
          Progress & Learning Velocity
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Real-time tracking of study hours, quiz mastery, and topic retention.
        </p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-slate-500 text-xs font-semibold">Total Study Hours</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-heading">24.2 hrs</div>
          <div className="text-[11px] text-emerald-500 font-bold">+12% this week</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-slate-500 text-xs font-semibold">Questions Solved</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-heading">184</div>
          <div className="text-[11px] text-slate-500 font-medium">92% accuracy</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-slate-500 text-xs font-semibold">Quizzes Passed</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-heading">14</div>
          <div className="text-[11px] text-purple-500 font-bold">Avg score: 91%</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-slate-500 text-xs font-semibold">Current Streak</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-heading flex items-center gap-1">
            5 Days <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-[11px] text-orange-500 font-bold">Longest: 12 days</div>
        </div>
      </div>

      {/* Activity Chart & Mastery Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weekly Activity Bar Chart */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Weekly Study Activity</h3>
            <span className="text-xs text-slate-500 font-medium">Target: 20 hrs/week</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-100 dark:border-slate-800">
            {weeklyData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="text-[10px] font-bold text-slate-500">{d.hours}h</div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.hours / 6) * 100}%` }}
                  className="w-full max-w-[36px] rounded-t-xl bg-[#3157D5] dark:bg-[#4F8CFF]"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Mastery Tracker */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">Topic Mastery Tracker</h3>

          <div className="space-y-4">
            {topicsMastered.map((t) => (
              <div key={t.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800 dark:text-slate-200">{t.name}</span>
                  <span className={t.progress >= 80 ? "text-emerald-500" : t.progress >= 60 ? "text-amber-500" : "text-rose-500"}>
                    {t.progress}% ({t.status})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <div
                    className={`h-full ${t.progress >= 80 ? "bg-emerald-500" : t.progress >= 60 ? "bg-amber-500" : "bg-rose-500"}`}
                    style={{ width: `${t.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
