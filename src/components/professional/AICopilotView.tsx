"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Copy,
  Check,
  Plus,
  ArrowRight,
  Brain,
} from "lucide-react";
import { CopilotMode, CopilotSource, StructuredWorkAction } from "@/lib/types/professional-types";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  mode?: CopilotMode;
  sources?: CopilotSource[];
  suggestedActions?: string[];
  structuredResult?: StructuredWorkAction;
  timestamp: string;
}

export function AICopilotView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init_msg",
      sender: "ai",
      text: "### Welcome to AI4Life Professional Copilot\n\nI turn scattered work (Documents, Meetings, Notes, Research) into **clear decisions, drafts, and action items**.\n\nSelect a mode or try one of the suggested prompts below to get started.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [selectedMode, setSelectedMode] = useState<CopilotMode>("Explain");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [taskCreatedMessage, setTaskCreatedMessage] = useState<string | null>(null);

  const copilotModes: CopilotMode[] = [
    "Explain",
    "Summarize",
    "Analyze",
    "Compare",
    "Draft",
    "Plan",
  ];

  const suggestedPrompts = [
    "Compare the vendor proposals, summarize today's meeting, and create my action items.",
    "Summarize this proposal.",
    "Compare these two vendor proposals.",
    "What decisions were made in today's meeting?",
    "Draft a follow-up email.",
    "What should I work on today?",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: "user",
      text: query,
      mode: selectedMode,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/professional/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          mode: selectedMode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Couldn't generate a response. Please try again.");
      }

      const aiMsg: Message = {
        id: `msg_ai_${Date.now()}`,
        sender: "ai",
        text: data.answer,
        mode: selectedMode,
        sources: data.sources,
        suggestedActions: data.suggestedActions,
        structuredResult: data.structuredResult,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("Copilot query error:", err);
      setErrorMessage("Couldn't generate a response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTasksFromActions = async (structured: StructuredWorkAction) => {
    if (!structured.actionItems || structured.actionItems.length === 0) return;

    try {
      const res = await fetch("/api/professional/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: structured.actionItems.map((item) => ({
            title: item.title,
            priority: item.priority || "High",
            dueDate: item.dueDate || "Upcoming",
            owner: item.owner || "Swati",
            status: "Todo",
            description: `Auto-extracted by AI Copilot from workspace analysis.`,
          })),
        }),
      });

      if (res.ok) {
        setTaskCreatedMessage(`Successfully created ${structured.actionItems.length} action items in Tasks module!`);
        setTimeout(() => setTaskCreatedMessage(null), 4000);
      }
    } catch (e) {
      console.error("Failed to create tasks:", e);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto flex flex-col h-[82vh]">
      
      {/* Copilot Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-3xl bg-[#EFEAE6]/90 dark:bg-[#111722] border border-[#D5CBC2] dark:border-slate-800 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
              AI4Life Copilot
            </h2>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
              Executive AI
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Turn scattered work into clear decisions, actions, and drafts.
          </p>
        </div>

        {/* Modes Pill Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {copilotModes.map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedMode(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedMode === mode
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-[#DFD7D0]/60 dark:bg-[#1A2232] text-slate-700 dark:text-slate-300 hover:bg-[#D5CBC2]"
              }`}
              type="button"
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Toast Banner */}
      <div className="px-4 py-2 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-800 dark:text-teal-300 text-xs font-semibold flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-teal-500 shrink-0" />
          <span>AI4Life remembered your preference: "Prefers concise executive summaries & structured action items."</span>
        </div>
      </div>

      {/* Notification toast when tasks are created */}
      {taskCreatedMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold flex items-center gap-2 shrink-0"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{taskCreatedMessage}</span>
        </motion.div>
      )}

      {/* Messages Thread Container */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 rounded-3xl bg-[#EFEAE6]/60 dark:bg-[#0E1422]/60 border border-[#D5CBC2] dark:border-slate-800/80 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-3xl rounded-3xl p-5 text-xs sm:text-sm leading-relaxed space-y-3 shadow-xs ${
                msg.sender === "user"
                  ? "bg-teal-600 text-white rounded-br-none"
                  : "bg-white dark:bg-[#151C2B] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-bl-none"
              }`}
            >
              {/* Header inside AI bubble */}
              {msg.sender === "ai" && (
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-teal-600 dark:text-teal-400">
                    <Sparkles className="w-4 h-4" />
                    <span>AI4Life Executive Copilot</span>
                  </div>
                  <button
                    onClick={() => handleCopyText(msg.text, msg.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    type="button"
                  >
                    {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}

              {/* Message Markdown Text */}
              <div className="whitespace-pre-wrap font-sans">
                {msg.text}
              </div>

              {/* Signature Feature: Work → Action Structured Response Block */}
              {msg.structuredResult && (
                <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-slate-900 dark:text-slate-100 space-y-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-teal-700 dark:text-teal-400 tracking-wider">
                      WORK → ACTION EXTRACTED BLOCK
                    </span>
                    <button
                      onClick={() => handleCreateTasksFromActions(msg.structuredResult!)}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                      type="button"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>1-Click Create Tasks</span>
                    </button>
                  </div>

                  {msg.structuredResult.actionItems && (
                    <div className="space-y-1.5 pt-1">
                      {msg.structuredResult.actionItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
                        >
                          <span className="font-bold text-slate-900 dark:text-white">
                            {item.title}
                          </span>
                          <span className="text-[10px] font-extrabold text-teal-600 dark:text-teal-400">
                            {item.owner} • {item.dueDate}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sources / Citations */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-1 text-[11px]">
                  <span className="font-bold text-slate-500 dark:text-slate-400">Sources:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.sources.map((src, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                      >
                        {src.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="p-4 rounded-3xl bg-white dark:bg-[#151C2B] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2.5">
              <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
              <span>AI4Life is thinking...</span>
            </div>
          </div>
        )}

        {/* Error State Banner */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => handleSendMessage()}
              className="text-[11px] underline font-black"
              type="button"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
        <span className="text-[11px] font-bold text-slate-500 shrink-0">Try:</span>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1 rounded-full bg-[#DFD7D0]/60 dark:bg-[#161D2A] border border-[#D5CBC2] dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold hover:bg-teal-500/20 hover:text-teal-700 dark:hover:text-teal-300 transition-colors whitespace-nowrap cursor-pointer shrink-0"
            type="button"
          >
            "{prompt}"
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="relative flex items-center shrink-0">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Ask AI Copilot to summarize, analyze, compare proposals, or create action items..."
          disabled={isLoading}
          className="w-full pl-5 pr-14 py-3.5 rounded-2xl bg-white dark:bg-[#151C2B] border border-[#D5CBC2] dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputQuery.trim() || isLoading}
          className="absolute right-2 p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-40 transition-all cursor-pointer"
          type="button"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
