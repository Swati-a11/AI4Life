"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckSquare,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Filter,
} from "lucide-react";
import { ProfessionalTask } from "@/lib/types/professional-types";

export function TasksView() {
  const [tasks, setTasks] = useState<ProfessionalTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<"High" | "Medium" | "Low">("High");
  const [newDueDate, setNewDueDate] = useState("Sept 5");
  const [isCreating, setIsCreating] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/professional/tasks");
      const data = await res.json();
      if (data.success) {
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error("Fetch tasks error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/professional/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          priority: newPriority,
          dueDate: newDueDate,
          owner: "Swati",
          status: "Todo",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTasks((prev) => [data.task, ...prev]);
        setNewTitle("");
      }
    } catch (err) {
      console.error("Create task error:", err);
    } finally {
      setIsCreating(false);
    }
  };

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
    } catch (err) {
      console.error("Update task error:", err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/professional/tasks/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Delete task error:", err);
    }
  };

  const todaysTasks = tasks.filter((t) => t.status !== "Done" && (t.dueDate.includes("Today") || t.dueDate.includes("Sept 1") || t.dueDate.includes("Sept 2") || t.priority === "High"));
  const upcomingTasks = tasks.filter((t) => t.status !== "Done" && !todaysTasks.includes(t));
  const completedTasks = tasks.filter((t) => t.status === "Done");

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header & Task Creator Bar */}
      <div className="p-6 rounded-3xl bg-[#EFEAE6]/90 dark:bg-[#111722] border border-[#D5CBC2] dark:border-slate-800 space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
            Professional Tasks & Action Items
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            AI understands work → AI creates actionable tasks.
          </p>
        </div>

        {/* Quick Add Form */}
        <form onSubmit={handleCreateTask} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a new action item or task title..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-[#151C2B] border border-[#D5CBC2] dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          <select
            value={newPriority}
            onChange={(e: any) => setNewPriority(e.target.value)}
            className="px-3 py-2.5 rounded-2xl bg-white dark:bg-[#151C2B] border border-[#D5CBC2] dark:border-slate-800 text-xs text-slate-900 dark:text-white font-bold focus:outline-none"
          >
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <input
            type="text"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            placeholder="Due Date (e.g. Sept 5)"
            className="w-32 px-3 py-2.5 rounded-2xl bg-white dark:bg-[#151C2B] border border-[#D5CBC2] dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
          />

          <button
            type="submit"
            disabled={!newTitle.trim() || isCreating}
            className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-40"
          >
            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Add Task</span>
          </button>
        </form>
      </div>

      {/* Task Sections */}
      {isLoading ? (
        <div className="p-8 text-center text-slate-500 text-xs">
          Loading task list...
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TODAY'S TASKS */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white font-heading uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              TODAY'S TASKS ({todaysTasks.length})
            </h3>

            {todaysTasks.length === 0 ? (
              <p className="text-xs text-slate-500 p-4 rounded-2xl bg-[#EFEAE6]/50 dark:bg-[#111722]/50 border border-[#D5CBC2]">
                No priority tasks due today.
              </p>
            ) : (
              <div className="space-y-2">
                {todaysTasks.map((t) => (
                  <TaskRow key={t.id} task={t} onToggle={handleToggleTask} onDelete={handleDeleteTask} />
                ))}
              </div>
            )}
          </div>

          {/* UPCOMING */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white font-heading uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              UPCOMING ({upcomingTasks.length})
            </h3>

            {upcomingTasks.length === 0 ? (
              <p className="text-xs text-slate-500 p-4 rounded-2xl bg-[#EFEAE6]/50 dark:bg-[#111722]/50 border border-[#D5CBC2]">
                No upcoming tasks.
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingTasks.map((t) => (
                  <TaskRow key={t.id} task={t} onToggle={handleToggleTask} onDelete={handleDeleteTask} />
                ))}
              </div>
            )}
          </div>

          {/* COMPLETED */}
          {completedTasks.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#D5CBC2]/60 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-500 dark:text-slate-400 font-heading uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                COMPLETED ({completedTasks.length})
              </h3>

              <div className="space-y-2 opacity-75">
                {completedTasks.map((t) => (
                  <TaskRow key={t.id} task={t} onToggle={handleToggleTask} onDelete={handleDeleteTask} />
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onDelete,
}: {
  task: ProfessionalTask;
  onToggle: (task: ProfessionalTask) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.005 }}
      className="p-4 rounded-2xl bg-[#EFEAE6]/90 dark:bg-[#111722] border border-[#D5CBC2] dark:border-slate-800 flex items-center justify-between gap-4 shadow-xs"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <button
          onClick={() => onToggle(task)}
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
            className={`text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate ${
              task.status === "Done" ? "line-through text-slate-400 dark:text-slate-500" : ""
            }`}
          >
            {task.title}
          </h4>
          {task.description && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
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

        <button
          onClick={() => onDelete(task.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
          type="button"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
