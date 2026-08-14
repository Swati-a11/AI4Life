"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Sparkles, CheckCircle2, Circle, Plus, Trash2, Clock, Check } from "lucide-react";
import { StudyTask } from "@/lib/types/student-types";
import { GeminiAIService } from "@/lib/services/ai-service";

interface StudyPlannerViewProps {
  onDeductCredits: (cost: number) => boolean;
}

export function StudyPlannerView({ onDeductCredits }: StudyPlannerViewProps) {
  const [examName, setExamName] = useState("Computer Science Midterm Exam");
  const [targetDate, setTargetDate] = useState("2026-08-25");
  const [isGenerating, setIsGenerating] = useState(false);

  const [tasks, setTasks] = useState<StudyTask[]>([
    { id: "1", dayLabel: "Day 1", topic: "Array Fundamentals & Two Pointers", subject: "Computer Science", estimatedMinutes: 60, completed: true },
    { id: "2", dayLabel: "Day 2", topic: "Binary Search & Monotonic Conditions", subject: "Computer Science", estimatedMinutes: 75, completed: true },
    { id: "3", dayLabel: "Day 3", topic: "Binary Search Trees & Traversal (DFS/BFS)", subject: "Computer Science", estimatedMinutes: 90, completed: false },
    { id: "4", dayLabel: "Day 4", topic: "Operating Systems Memory Paging & Virtual RAM", subject: "Operating Systems", estimatedMinutes: 90, completed: false },
    { id: "5", dayLabel: "Day 5", topic: "Dynamic Programming Memoization & Tabulation", subject: "Algorithms", estimatedMinutes: 120, completed: false },
  ]);

  const handleGeneratePlan = async () => {
    const hasCredits = onDeductCredits(15);
    if (!hasCredits) return;

    setIsGenerating(true);
    setTimeout(async () => {
      const generatedTasks = await GeminiAIService.generateStudyPlan(examName, 5);
      setTasks(generatedTasks);
      setIsGenerating(false);
    }, 1200);
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="space-y-6">
      
      {/* Header & Plan Generator Bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-[#3157D5] dark:text-[#4F8CFF] text-xs font-bold border border-blue-500/20">
              <Calendar className="w-3.5 h-3.5" />
              AI Exam Study Planner
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
              Personalized Study Schedule
            </h2>
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="px-6 py-3 rounded-2xl bg-[#3157D5] dark:bg-[#4F8CFF] text-white font-bold text-xs hover:bg-[#2848b8] disabled:opacity-50 flex items-center gap-2 shadow-md"
            type="button"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? "Generating Plan..." : "Regenerate AI Schedule"}</span>
          </button>
        </div>

        {/* Input Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Target Exam Name</label>
            <input
              type="text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Target Exam Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
          <span>Overall Schedule Completion</span>
          <span>{completedCount} of {tasks.length} tasks completed ({progressPercent}%)</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
          <div className="h-full bg-[#3157D5] dark:bg-[#4F8CFF] transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Day Tasks Checklist */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            whileHover={{ scale: 1.005 }}
            onClick={() => handleToggleTask(task.id)}
            className={`p-5 rounded-2xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
              task.completed
                ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30 text-slate-500"
                : "bg-white dark:bg-[#111722] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <button
                type="button"
                className={`p-1 rounded-full ${task.completed ? "text-emerald-500" : "text-slate-400"}`}
              >
                {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#3157D5] dark:text-[#4F8CFF] uppercase text-[11px]">{task.dayLabel}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-500 font-semibold">{task.subject}</span>
                </div>
                <h4 className={`text-sm font-bold mt-0.5 ${task.completed ? "line-through text-slate-400" : ""}`}>
                  {task.topic}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Clock className="w-4 h-4" />
              <span>{task.estimatedMinutes} mins</span>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
