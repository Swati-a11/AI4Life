"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  CheckSquare,
  Video,
  Clock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Plus,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { ProfessionalTask, ProfessionalDocument, ProfessionalMeeting } from "@/lib/types/professional-types";

interface DashboardViewProps {
  onNavigateTab?: (tab: string) => void;
}

export function DashboardView({ onNavigateTab }: DashboardViewProps) {
  const [tasks, setTasks] = useState<ProfessionalTask[]>([]);
  const [documents, setDocuments] = useState<ProfessionalDocument[]>([]);
  const [meetings, setMeetings] = useState<ProfessionalMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [tasksRes, docsRes, meetsRes] = await Promise.all([
        fetch("/api/professional/tasks"),
        fetch("/api/professional/documents"),
        fetch("/api/professional/meetings"),
      ]);

      const tasksData = await tasksRes.json();
      const docsData = await docsRes.json();
      const meetsData = await meetsRes.json();

      if (tasksData.success) setTasks(tasksData.tasks || []);
      if (docsData.success) setDocuments(docsData.documents || []);
      if (meetsData.success) setMeetings(meetsData.meetings || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleTask = async (task: ProfessionalTask) => {
    const nextStatus = task.status === "Done" ? "Todo" : "Done";
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    try {
      await fetch(`/api/professional/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch (e) {
      console.error("Task toggle error:", e);
    }
  };

  const openTasks = tasks.filter((t) => t.status !== "Done");
  const priorityTasks = openTasks.slice(0, 5);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Top Banner Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-500/20 backdrop-blur-xs">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">
            Good morning.
          </h2>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1">
            Here's what needs your attention.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/professional/copilot"
            className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch AI Copilot</span>
          </Link>
        </div>
      </div>

      {/* Top Statistics Cards Inspired by Reference Design */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Stat 1: Documents */}
        <motion.div
          whileHover={{ y: -4 }}
          className="p-6 rounded-3xl bg-[#EFEAE6]/90 dark:bg-[#111722] border border-[#D5CBC2] dark:border-slate-800 shadow-sm space-y-4 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
              Documents
            </span>
            <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-white font-heading">
              {isLoading ? (
                <span className="animate-pulse">...</span>
              ) : documents.length > 0 ? (
                `${documents.length} Documents`
              ) : (
                "No activity yet."
              )}
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Indexed in RAG Vector Store
            </p>
          </div>
          <Link
            href="/professional/documents"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-teal-600 dark:text-teal-400 hover:underline pt-2"
          >
            <span>View Documents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {/* Stat 2: Open Tasks */}
        <motion.div
          whileHover={{ y: -4 }}
          className="p-6 rounded-3xl bg-[#EFEAE6]/90 dark:bg-[#111722] border border-[#D5CBC2] dark:border-slate-800 shadow-sm space-y-4 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
              Open Tasks
            </span>
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-white font-heading">
              {isLoading ? (
                <span className="animate-pulse">...</span>
              ) : openTasks.length > 0 ? (
                `${openTasks.length} Open Tasks`
              ) : (
                "No activity yet."
              )}
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              {tasks.filter((t) => t.priority === "High" && t.status !== "Done").length} High Priority
            </p>
          </div>
          <Link
            href="/professional/tasks"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600 dark:text-amber-400 hover:underline pt-2"
          >
            <span>Manage Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {/* Stat 3: Meetings */}
        <motion.div
          whileHover={{ y: -4 }}
          className="p-6 rounded-3xl bg-[#EFEAE6]/90 dark:bg-[#111722] border border-[#D5CBC2] dark:border-slate-800 shadow-sm space-y-4 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
              Meetings
            </span>
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Video className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 dark:text-white font-heading">
              {isLoading ? (
                <span className="animate-pulse">...</span>
              ) : meetings.length > 0 ? (
                `${meetings.length} Upcoming Meetings`
              ) : (
                "No activity yet."
              )}
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Processed with Action Extraction
            </p>
          </div>
          <Link
            href="/professional/meetings"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-purple-600 dark:text-purple-400 hover:underline pt-2"
          >
            <span>Meeting Intelligence</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

      </div>

      {/* Main Grid: Today's Priorities + Upcoming Compact List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Today's Priorities (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 dark:text-white font-heading uppercase tracking-wide">
              TODAY'S PRIORITIES
            </h3>
            <Link
              href="/professional/tasks"
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
            >
              View all tasks
            </Link>
          </div>

          {isLoading ? (
            <div className="p-8 rounded-3xl bg-[#EFEAE6]/60 dark:bg-[#111722]/60 border border-[#D5CBC2] dark:border-slate-800 text-center text-slate-500 text-sm">
              Loading priorities...
            </div>
          ) : priorityTasks.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#EFEAE6]/60 dark:bg-[#111722]/60 border border-[#D5CBC2] dark:border-slate-800 text-center text-slate-500 text-sm space-y-2">
              <CheckCircle2 className="w-8 h-8 text-teal-500 mx-auto" />
              <p className="font-bold text-slate-800 dark:text-slate-200">No open priority tasks!</p>
              <p className="text-xs">Upload meeting transcripts or ask AI Copilot to generate tasks.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {priorityTasks.map((task) => (
                <motion.div
                  key={task.id}
                  whileHover={{ scale: 1.01 }}
                  className="p-4 rounded-2xl bg-[#EFEAE6]/80 dark:bg-[#151C2B] border border-[#D5CBC2] dark:border-slate-800/80 flex items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      onClick={() => handleToggleTask(task)}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        task.status === "Done"
                          ? "bg-teal-600 border-teal-600 text-white"
                          : "border-slate-400 dark:border-slate-600 hover:border-teal-500"
                      }`}
                      type="button"
                    >
                      {task.status === "Done" && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <div className="min-w-0">
                      <h4
                        className={`text-sm font-bold text-slate-900 dark:text-white truncate ${
                          task.status === "Done" ? "line-through text-slate-400 dark:text-slate-500" : ""
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        task.priority === "High"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          : task.priority === "Medium"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.dueDate}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: UPCOMING (Compact) */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-900 dark:text-white font-heading uppercase tracking-wide">
            UPCOMING
          </h3>

          <div className="p-5 rounded-3xl bg-[#EFEAE6]/90 dark:bg-[#111722] border border-[#D5CBC2] dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5CBC2]/60 dark:border-slate-800">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-500" />
                Next Event / Sync
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400">
                Scheduled
              </span>
            </div>

            {meetings.length > 0 ? (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                  <h5 className="text-xs font-black text-slate-900 dark:text-white">
                    {meetings[0].title}
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {meetings[0].date} • {meetings[0].actionItems.length} action items
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                  <h5 className="text-xs font-black text-slate-900 dark:text-white">
                    Closed Beta Release Sync
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Sept 5, 2026 • Product & Engineering
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No upcoming meetings scheduled.
              </p>
            )}

            <Link
              href="/professional/meetings"
              className="block w-full text-center py-2.5 rounded-2xl bg-slate-200/80 dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Open Meeting Intelligence
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
