"use client";

import { useState, useEffect, useRef } from "react";
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
  Smile,
  GraduationCap,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from "lucide-react";
import { AITutorMode, ChatMessage } from "@/lib/types/student-types";

interface AITutorViewProps {
  onDeductCredits: (cost: number) => boolean;
  isStandalone?: boolean;
}

export function AITutorView({ onDeductCredits, isStandalone = false }: AITutorViewProps) {
  const [selectedMode, setSelectedMode] = useState<AITutorMode>("Explain");
  const [persona, setPersona] = useState<"friendly" | "professional">("friendly");
  const [inputQuery, setInputQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Voice Mode State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Exactly 3 Tutor Modes: Explain, Quiz Me, Give Example
  const tutorModes: AITutorMode[] = [
    "Explain",
    "Quiz Me",
    "Give Example",
  ];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_init",
      sender: "ai",
      text: isStandalone
        ? "Hey! I'm your AI Tutor. What's on your mind today?"
        : "Hey! I'm your AI Tutor for AI4Life. What are you studying or working on today?",
      mode: "Explain",
      timestamp: "Just now",
    },
  ]);

  const sanitizeTextForSpeech = (rawText: string): string => {
    if (!rawText) return "";

    return rawText
      .replace(/```[\s\S]*?```/g, " Here is a code example. ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/#{1,6}\s?/g, "")
      .replace(/[*_~]{1,3}/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/^\s*[-+*]\s+/gm, "")
      .replace(/\$O\\?\(([^)]+)\\?\)\$/gi, "O of $1")
      .replace(/\$([^$]+)\$/g, "$1")
      .replace(/\n+/g, ". ")
      .trim();
  };

  const speakAnswerAloud = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const cleanSpeechText = sanitizeTextForSpeech(text);
    if (!cleanSpeechText) return;

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    const availableVoices = window.speechSynthesis.getVoices();

    if (persona === "friendly" && !isStandalone) {
      const maleVoice = availableVoices.find(
        (v) => (v.name.includes("Male") || v.name.includes("Daniel") || v.name.includes("Alex") || v.name.includes("Google UK English Male")) && v.lang.startsWith("en")
      ) || availableVoices.find((v) => v.lang.startsWith("en"));

      if (maleVoice) utterance.voice = maleVoice;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
    } else {
      const femaleVoice = availableVoices.find(
        (v) => (v.name.includes("Female") || v.name.includes("Samantha") || v.name.includes("Victoria") || v.name.includes("Google US English") || v.name.includes("Zira")) && v.lang.startsWith("en")
      ) || availableVoices.find((v) => v.lang.startsWith("en"));

      if (femaleVoice) utterance.voice = femaleVoice;
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your current browser. Switching to text input.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setIsVoiceActive(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputQuery(transcript);
      setIsListening(false);
      handleSendMessage(transcript);
    };

    recognition.onerror = (err: any) => {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

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

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!queryText) setInputQuery("");
    setIsGenerating(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: textToSend,
          mode: selectedMode,
          persona: isStandalone ? "standalone" : persona,
          isStandalone,
          conversationHistory: updatedMessages.slice(-8).map((m) => ({ sender: m.sender, content: m.text })),
          memoryContext: "Prefers intuitive explanations with real-world examples"
        })
      });

      const data = await res.json();
      const aiText = data.success && data.responseText 
        ? data.responseText 
        : "Couldn't generate a response. Please try again.";

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: aiText,
        codeSnippet: data.codeSnippet,
        mode: selectedMode,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (isVoiceActive) {
        speakAnswerAloud(aiText);
      }
    } catch (err) {
      console.error("AI Tutor API Error:", err);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: "ai",
        text: "Couldn't generate a response. Please try again.",
        mode: selectedMode,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSave = async (id: string, text: string) => {
    const isAarav = persona === "friendly" && !isStandalone;
    const isRiya = persona === "professional" && !isStandalone;
    const sourceType = isAarav ? "aarav" : isRiya ? "riya" : "ai_tutor";
    const sourceName = isAarav ? "Aarav Mehta" : isRiya ? "Riya Kapoor" : "AI Tutor";
    const title = text.split("\n")[0].substring(0, 45) || "Tutor Explanation";

    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, saved: true } : msg))
    );

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: text,
          sourceType,
          sourceName,
          conversationId: "tutor_session"
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Note saved.");
      }
    } catch (err) {
      console.error("Save note error:", err);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      
      {/* Header Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        
        {/* Left: AI Tutor Identity (Generic when isStandalone) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-[#3157D5] dark:text-[#4F8CFF]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white font-heading">AI Tutor</h2>
              <span className="text-[11px] text-slate-500">Gemini 1.5 Flash</span>
            </div>
          </div>

          {/* Persona Switcher shown ONLY when NOT standalone */}
          {!isStandalone && (
            <div className="flex items-center p-1 rounded-2xl bg-slate-200/60 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700 ml-2">
              <button
                onClick={() => setPersona("friendly")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  persona === "friendly"
                    ? "bg-amber-400 text-slate-900 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                type="button"
                title="Aarav Mehta — Friendly & Patient AI Tutor (Male Voice)"
              >
                <Smile className="w-3.5 h-3.5" />
                <span>Aarav Mehta</span>
              </button>
              <button
                onClick={() => setPersona("professional")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  persona === "professional"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                type="button"
                title="Riya Kapoor — Structured & Friendly AI Tutor (Female Voice)"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Riya Kapoor</span>
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setIsVoiceActive(!isVoiceActive);
              if (isSpeaking && typeof window !== "undefined") window.speechSynthesis.cancel();
            }}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
              isVoiceActive
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                : "bg-slate-100 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800"
            }`}
            type="button"
            title={isVoiceActive ? "Voice Audio On" : "Voice Audio Off"}
          >
            {isVoiceActive ? <Volume2 className="w-4 h-4 text-emerald-500 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{isVoiceActive ? "Voice On" : "Voice Off"}</span>
          </button>
        </div>

        {/* 3 Tutor Modes Selector */}
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
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-sky-400 border border-blue-500/20">
                      Mode: {msg.mode}
                    </span>
                    {!isStandalone && (
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {persona === "friendly" ? "Aarav Mehta 😊" : "Riya Kapoor 🎓"}
                      </span>
                    )}
                  </div>
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
                    onClick={() => speakAnswerAloud(msg.text)}
                    className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                    type="button"
                    title="Speak Answer Aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>Listen</span>
                  </button>

                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                    type="button"
                  >
                    {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                  </button>

                  <button
                    onClick={() => handleToggleSave(msg.id, msg.text)}
                    className={`flex items-center gap-1 cursor-pointer ${msg.saved ? "text-amber-500 font-bold" : "hover:text-slate-900 dark:hover:text-white"}`}
                    type="button"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{msg.saved ? "Saved" : "Save"}</span>
                  </button>

                  <button
                    onClick={() => handleSendMessage("Can you give another example?")}
                    className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
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
            <span>AI4Life is thinking...</span>
          </div>
        )}
      </div>

      {/* Suggested Follow-up Prompts */}
      <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto bg-slate-50/30 dark:bg-slate-900/30">
        <span className="text-[11px] font-bold text-slate-400 shrink-0">Try asking:</span>
        {(selectedMode === "Explain"
          ? ["Yaar I'm so confused", "What is a lab?", "What is React?"]
          : selectedMode === "Quiz Me"
          ? ["topic- python", "Quiz me on React", "Quiz me on JavaScript"]
          : ["Give me an example of React", "Give me an example of a Python loop", "Give me an example of global warming"]).map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500 shrink-0 cursor-pointer"
            type="button"
          >
            "{prompt}"
          </button>
        ))}
      </div>

      {/* Input Box with Voice Mic Button */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111722]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              isListening
                ? "bg-rose-600 text-white border-rose-600 animate-pulse shadow-lg"
                : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-200"
            }`}
            title={isListening ? "Listening... Click to stop" : "Speak to AI Tutor (Voice Input)"}
          >
            {isListening ? <Mic className="w-4 h-4 animate-bounce" /> : <MicOff className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={isListening ? "Listening to your voice..." : "Ask AI Tutor anything..."}
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isGenerating}
            className="p-3.5 rounded-2xl bg-[#3157D5] dark:bg-[#4F8CFF] text-white disabled:opacity-50 hover:bg-[#2848b8] transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
