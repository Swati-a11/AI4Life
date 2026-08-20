"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Clock,
  Check,
  AlertCircle,
  RotateCcw,
  Sliders,
  ArrowRight,
  ChevronRight,
  MoreVertical,
  CalendarDays,
  Target
} from "lucide-react";
import { StudyGoal, PlannerTask, UserStudyPlan } from "@/lib/services/server-store";
import { CreditService } from "@/lib/services/credit-service";

interface StudyPlannerViewProps {
  onDeductCredits?: (cost: number) => boolean;
}

export function StudyPlannerView({ onDeductCredits }: StudyPlannerViewProps) {
  const [plan, setPlan] = useState<UserStudyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Onboarding Step 1: Goals
  const [goals, setGoals] = useState<StudyGoal[]>([
    { id: "g1", title: "AI4Life Project", priority: "High", estimatedHours: 2 },
    { id: "g2", title: "Learning DSA", priority: "Medium", estimatedHours: 1 },
    { id: "g3", title: "Learning JavaScript", priority: "Medium", estimatedHours: 1 }
  ]);

  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalPriority, setNewGoalPriority] = useState<"High" | "Medium" | "Low">("High");

  // Onboarding Step 2: Available Daily Time
  const [availableDailyHours, setAvailableDailyHours] = useState<number>(4);
  const [dateRange, setDateRange] = useState<"Today" | "3 Days" | "1 Week">("Today");

  // Rebalance Input State
  const [rebalanceHours, setRebalanceHours] = useState<number>(4);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [activeTaskMenu, setActiveTaskMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = () => {
    setIsLoading(true);
    fetch("/api/planner")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.plan) {
          setPlan(data.plan);
          setRebalanceHours(data.plan.availableDailyHours || 4);
        } else {
          setPlan(null);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  const handleAddGoal = () => {
    if (!newGoalTitle.trim()) return;
    const newG: StudyGoal = {
      id: `g_${Date.now()}`,
      title: newGoalTitle.trim(),
      priority: newGoalPriority,
      estimatedHours: 1
    };
    setGoals((prev) => [...prev, newG]);
    setNewGoalTitle("");
  };

  const handleRemoveGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleGeneratePlan = async () => {
    if (goals.length === 0) return;
    setErrorMessage(null);

    const currentCredits = CreditService.getCredits();
    if (currentCredits < 20) {
      setErrorMessage("Insufficient credits. You need at least 20 credits to generate a study plan.");
      if (onDeductCredits) onDeductCredits(20);
      return;
    }

    setIsGenerating(true);
    const idempotencyKey = `plan_${Date.now()}`;

    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          goals,
          availableDailyHours,
          dateRange,
          idempotencyKey
        })
      });

      const data = await res.json();
      if (data.success && data.plan) {
        setPlan(data.plan);
        setRebalanceHours(data.plan.availableDailyHours);
        if (data.creditsRemaining !== undefined) {
          CreditService.notifyCreditDeduction(20, data.creditsRemaining);
        }
      } else {
        setErrorMessage(data.error || "Insufficient credits.");
        if (data.errorCode === "INSUFFICIENT_CREDITS" && onDeductCredits) {
          onDeductCredits(20);
        }
      }
    } catch (err) {
      console.error("Generate plan error:", err);
      setErrorMessage("Failed to generate plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleTaskStatus = async (taskId: string, currentCompleted?: boolean) => {
    const newStatus = currentCompleted ? "pending" : "completed";
    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_task",
          taskId,
          status: newStatus
        })
      });

      const data = await res.json();
      if (data.success && data.plan) {
        setPlan(data.plan);
      }
    } catch (err) {
      console.error("Update task status error:", err);
    }
  };

  const handleTaskAction = async (taskId: string, actionStatus: "rescheduled" | "skipped" | "completed") => {
    setActiveTaskMenu(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const targetDate = actionStatus === "rescheduled" ? tomorrow.toISOString().split("T")[0] : undefined;

    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_task",
          taskId,
          status: actionStatus,
          targetDate
        })
      });

      const data = await res.json();
      if (data.success && data.plan) {
        setPlan(data.plan);
      }
    } catch (err) {
      console.error("Task action error:", err);
    }
  };

  const handleRebalancePlan = async () => {
    setIsRebalancing(true);
    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rebalance",
          newDailyHours: rebalanceHours
        })
      });

      const data = await res.json();
      if (data.success && data.plan) {
        setPlan(data.plan);
      }
    } catch (err) {
      console.error("Rebalance error:", err);
    } finally {
      setIsRebalancing(false);
    }
  };

  const handleResetPlan = () => {
    setPlan(null);
  };

  const completedCount = plan ? plan.tasks.filter((t) => t.status === "completed" || t.completed).length : 0;
  const totalTasks = plan ? plan.tasks.length : 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  if (isLoading) {
    return (
      <div className="p-12 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <Calendar className="w-8 h-8 text-blue-500 animate-pulse mx-auto" />
        <p className="text-xs font-bold text-slate-500">Loading your personalized study schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* ONBOARDING STATE (No Active Study Plan) */}
      {!plan || plan.tasks.length === 0 ? (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-[#3157D5] dark:text-[#4F8CFF] text-xs font-bold border border-blue-500/20">
              <Calendar className="w-3.5 h-3.5" />
              AI Study Planner Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">
              Personalized Study Schedule
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl font-medium">
              No study plan yet. Tell me what you're currently working on and how much time you can study each day. I'll build a realistic plan for you.
            </p>
          </div>

          {/* STEP 1: Current Goals */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                  STEP 1 OF 3
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-heading">
                  What are you currently working on?
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-400">Add multiple goals</span>
            </div>

            {/* Goal Preset Chips */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Quick Preset Goals</label>
              <div className="flex flex-wrap gap-2">
                {["Building my AI4Life project", "Learning DSA", "Learning JavaScript", "Preparing for SDE interviews"].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      if (!goals.some((g) => g.title.toLowerCase() === preset.toLowerCase())) {
                        setGoals((prev) => [...prev, { id: `g_${Date.now()}`, title: preset, priority: "High" }]);
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-bold hover:border-blue-500/50 cursor-pointer"
                    type="button"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Added Goals List */}
            <div className="space-y-2 pt-2">
              {goals.map((goal, idx) => (
                <div
                  key={goal.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{goal.title}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                      goal.priority === "High" ? "bg-rose-500/10 text-rose-500" : "bg-amber-500/10 text-amber-500"
                    }`}>
                      {goal.priority} Priority
                    </span>
                    <button
                      onClick={() => handleRemoveGoal(goal.id)}
                      className="text-slate-400 hover:text-rose-500 cursor-pointer"
                      type="button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Custom Goal Input */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="text"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                placeholder="Enter custom goal or project name..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
              />
              <select
                value={newGoalPriority}
                onChange={(e) => setNewGoalPriority(e.target.value as any)}
                className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <button
                onClick={handleAddGoal}
                className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 flex items-center gap-1 cursor-pointer"
                type="button"
              >
                <Plus className="w-4 h-4" />
                <span>Add Goal</span>
              </button>
            </div>
          </div>

          {/* STEP 2: Available Daily Time */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                STEP 2 OF 3: HARD TIME CONSTRAINT
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white font-heading">
                How many hours can you realistically study/work each day?
              </h3>
              <p className="text-xs text-slate-500">
                The AI will use this number as a strict daily boundary. Your schedule will never exceed this duration.
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6].map((hrs) => (
                <button
                  key={hrs}
                  onClick={() => setAvailableDailyHours(hrs)}
                  className={`p-3.5 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer ${
                    availableDailyHours === hrs
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-500/50"
                  }`}
                  type="button"
                >
                  {hrs} {hrs === 1 ? "hour" : "hours"}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 3: Multi-Day Date Range & Generate CTA */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                  STEP 3 OF 3: PLAN HORIZON
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white font-heading">
                  Choose Plan Horizon
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {(["Today", "3 Days", "1 Week"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setDateRange(r)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      dateRange === r
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
                    }`}
                    type="button"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-between">
                <span>{errorMessage}</span>
                {onDeductCredits && (
                  <button
                    onClick={() => onDeductCredits(20)}
                    className="underline text-[11px] font-black cursor-pointer ml-2"
                    type="button"
                  >
                    Upgrade Plan
                  </button>
                )}
              </div>
            )}

            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating || goals.length === 0}
              className="w-full py-4 rounded-2xl bg-[#3157D5] dark:bg-[#4F8CFF] text-white font-black text-xs hover:bg-[#2848b8] disabled:opacity-50 flex items-center justify-center gap-2 shadow-md cursor-pointer"
              type="button"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>{isGenerating ? "AI is Building Your Schedule..." : `Generate AI Schedule (${availableDailyHours} Hours/Day) • 20 Credits`}</span>
            </button>
          </div>
        </div>
      ) : (
        /* ACTIVE STUDY PLAN SCHEDULE VIEW */
        <div className="space-y-6">
          
          {/* Header Bar */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/20">
                  <Calendar className="w-3.5 h-3.5" />
                  Active AI Study Plan
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                  Today's Time-Blocked Schedule
                </h2>
                <p className="text-xs text-slate-500">
                  Strictly bounded to {plan.availableDailyHours} hours/day across {plan.goals.length} target goals.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetPlan}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer"
                  type="button"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>New Plan</span>
                </button>
              </div>
            </div>

            {/* Rebalance Plan Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Need to change available time today?
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={rebalanceHours}
                  onChange={(e) => setRebalanceHours(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 font-bold text-slate-900 dark:text-white text-xs"
                >
                  {[1, 2, 3, 4, 5, 6].map((h) => (
                    <option key={h} value={h}>{h} {h === 1 ? "hour/day" : "hours/day"}</option>
                  ))}
                </select>

                <button
                  onClick={handleRebalancePlan}
                  disabled={isRebalancing}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-black text-xs hover:bg-blue-700 shadow-xs cursor-pointer disabled:opacity-50"
                  type="button"
                >
                  {isRebalancing ? "Rebalancing..." : "Rebalance Plan"}
                </button>
              </div>
            </div>

            {/* Overall Schedule Completion Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                <span>Overall Schedule Completion</span>
                <span>{completedCount} of {totalTasks} tasks completed ({progressPercent}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                <div className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-700" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>

          {/* Time-Blocked Task Cards */}
          <div className="space-y-3">
            {plan.tasks.map((task) => {
              const isCompleted = task.status === "completed" || task.completed;
              const isRescheduled = task.status === "rescheduled";

              return (
                <div key={task.id} className="relative">
                  <motion.div
                    whileHover={{ scale: 1.002 }}
                    className={`p-5 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                      isCompleted
                        ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30 text-slate-500"
                        : isRescheduled
                        ? "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30 text-slate-600 dark:text-slate-300"
                        : "bg-white dark:bg-[#111722] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-xs"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Checkbox Trigger */}
                      <button
                        onClick={() => handleToggleTaskStatus(task.id, isCompleted)}
                        className={`p-1 rounded-full cursor-pointer transition-colors ${isCompleted ? "text-emerald-500" : "text-slate-400 hover:text-blue-500"}`}
                        type="button"
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" /> : <Circle className="w-5 h-5" />}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-blue-600 dark:text-blue-400 text-xs">
                            ⏰ {task.startTime} – {task.endTime}
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase">
                            {task.goalTitle}
                          </span>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                            task.priority === "High" ? "bg-rose-500/10 text-rose-500" : "bg-amber-500/10 text-amber-500"
                          }`}>
                            {task.priority}
                          </span>
                          {isRescheduled && (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-600">
                              Rescheduled to {task.dayLabel}
                            </span>
                          )}
                        </div>

                        <h4 className={`text-sm font-bold ${isCompleted ? "line-through text-slate-400" : "text-slate-900 dark:text-white"}`}>
                          {task.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{task.durationMinutes} mins</span>
                      </div>

                      {/* Missed / Reschedule Action Trigger */}
                      <button
                        onClick={() => setActiveTaskMenu(activeTaskMenu === task.id ? null : task.id)}
                        className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 cursor-pointer"
                        type="button"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>

                  {/* Task Action Popover */}
                  {activeTaskMenu === task.id && (
                    <div className="absolute right-4 top-14 z-30 p-2 rounded-2xl bg-white dark:bg-[#161D2A] border border-slate-200 dark:border-slate-800 shadow-xl space-y-1 w-44">
                      <button
                        onClick={() => handleTaskAction(task.id, "completed")}
                        className="w-full text-left p-2 rounded-xl text-xs font-bold hover:bg-emerald-500/10 text-emerald-600 flex items-center gap-2 cursor-pointer"
                        type="button"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark Complete
                      </button>
                      <button
                        onClick={() => handleTaskAction(task.id, "rescheduled")}
                        className="w-full text-left p-2 rounded-xl text-xs font-bold hover:bg-amber-500/10 text-amber-600 flex items-center gap-2 cursor-pointer"
                        type="button"
                      >
                        <CalendarDays className="w-3.5 h-3.5" /> Move to Tomorrow
                      </button>
                      <button
                        onClick={() => handleTaskAction(task.id, "skipped")}
                        className="w-full text-left p-2 rounded-xl text-xs font-bold hover:bg-rose-500/10 text-rose-500 flex items-center gap-2 cursor-pointer"
                        type="button"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Skip Task
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
