"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Bookmark,
  RotateCcw,
  Code2,
  Check,
  Zap
} from "lucide-react";
import { AITutorMode, ChatMessage } from "@/lib/types/student-types";
import { GeminiAIService } from "@/lib/services/ai-service";
import { CreditService } from "@/lib/services/credit-service";

interface AITutorViewProps {
  onDeductCredits: (cost: number) => boolean;
}

export function AITutorView({ onDeductCredits }: AITutorViewProps) {
  const [selectedMode, setSelectedMode] = useState<AITutorMode>("Explain");
  const [inputQuery, setInputQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const tutorModes: AITutorMode[] = [
    "Explain",
    "Summarize",
    "Solve",
    "Quiz Me",
    "Give Examples",
    "Simplify",
    "Deep Dive",
  ];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_init",
      sender: "ai",
      text: "Hello Swati! I'm your AI Tutor for AI4Life. What topic or concept would you like to explore today?",
      mode: "Explain",
      timestamp: "Just now",
    },
  ]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const hasCredits = onDeductCredits(10);
    if (!hasCredits) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: textToSend,
      mode: selectedMode,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery("");
    setIsGenerating(true);

    setTimeout(async () => {
      const aiResponse = await GeminiAIService.generateTutorResponse(textToSend, selectedMode);
      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: aiResponse.responseText,
        codeSnippet: aiResponse.codeSnippet,
        mode: selectedMode,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsGenerating(false);
    }, 900);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSave = (id: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, saved: !msg.saved } : msg))
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      
      {/* Header & Mode Selector Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10 text-[#3157D5] dark:text-[#4F8CFF]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white font-heading">AI Tutor</h2>
            <span className="text-[11px] text-slate-500">Gemini 1.5 Pro Model</span>
          </div>
        </div>

        {/* 7 AI Modes Selector */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto max-w-full">
          {tutorModes.map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedMode(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedMode === mode
                  ? "bg-[#3157D5] dark:bg-[#4F8CFF] text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              type="button"
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Stream Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 max-w-3xl ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.sender === "user" ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950" : "bg-blue-600 text-white"}`}>
              {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className="space-y-3">
              <div className={`p-4 rounded-2xl border text-sm ${
                msg.sender === "user"
                  ? "bg-[#3157D5] dark:bg-[#4F8CFF] text-white border-blue-500"
                  : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
              }`}>
                {msg.mode && msg.sender === "ai" && (
                  <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-sky-400 mb-2 border border-blue-500/20">
                    Mode: {msg.mode}
                  </span>
                )}
                <div className="whitespace-pre-wrap leading-relaxed font-sans">{msg.text}</div>

                {msg.codeSnippet && (
                  <div className="mt-3 rounded-xl bg-slate-950 text-slate-200 p-3 font-mono text-xs overflow-x-auto border border-slate-800">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pb-2 mb-2 border-b border-slate-800">
                      <span className="flex items-center gap-1"><Code2 className="w-3.5 h-3.5" /> TypeScript</span>
                      <span>Execution snippet</span>
                    </div>
                    <pre>{msg.codeSnippet}</pre>
                  </div>
                )}
              </div>

              {msg.sender === "ai" && (
                <div className="flex items-center gap-3 text-xs text-slate-500 pl-1">
                  <span>{msg.timestamp}</span>
                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                    type="button"
                  >
                    {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                  </button>

                  <button
                    onClick={() => handleToggleSave(msg.id)}
                    className={`flex items-center gap-1 ${msg.saved ? "text-amber-500 font-bold" : "hover:text-slate-900 dark:hover:text-white"}`}
                    type="button"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{msg.saved ? "Saved" : "Save"}</span>
                  </button>

                  <button
                    onClick={() => handleSendMessage("Can you give another example?")}
                    className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
                    type="button"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Regenerate</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {isGenerating && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic">
            <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
            <span>AI Tutor is formulating {selectedMode.toLowerCase()} explanation...</span>
          </div>
        )}
      </div>

      {/* Suggested Follow-up Prompts */}
      <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto bg-slate-50/30 dark:bg-slate-900/30">
        <span className="text-[11px] font-bold text-slate-400 shrink-0">Try asking:</span>
        {["Explain binary search like I'm a beginner", "Give 3 real-world code examples", "What is O(log N) intuition?"].map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500 shrink-0"
            type="button"
          >
            "{prompt}"
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111722]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={`Ask AI Tutor in "${selectedMode}" mode... (10 credits per query)`}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isGenerating}
            className="p-3.5 rounded-2xl bg-[#3157D5] dark:bg-[#4F8CFF] text-white disabled:opacity-50 hover:bg-[#2848b8] transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
