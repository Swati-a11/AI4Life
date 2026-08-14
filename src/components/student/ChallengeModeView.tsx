"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Trophy, Bot, User, Flame, CheckCircle2, XCircle, Award, ArrowRight } from "lucide-react";
import { ChallengeMatch } from "@/lib/types/student-types";
import { GeminiAIService } from "@/lib/services/ai-service";

interface ChallengeModeViewProps {
  onDeductCredits: (cost: number) => boolean;
}

export function ChallengeModeView({ onDeductCredits }: ChallengeModeViewProps) {
  const [topicInput, setTopicInput] = useState("Algorithms & Data Structures");
  const [isBattleActive, setIsBattleActive] = useState(false);
  const [match, setMatch] = useState<ChallengeMatch | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [battleState, setBattleState] = useState<"ready" | "thinking" | "completed">("ready");

  const [studentScore, setStudentScore] = useState(8);
  const [aiScore, setAiScore] = useState(7);
  const [totalXp, setTotalXp] = useState(1250);
  const [streak, setStreak] = useState(4);

  const handleStartChallenge = async () => {
    const hasCredits = onDeductCredits(20);
    if (!hasCredits) return;

    setSelectedOption(null);
    setBattleState("ready");

    const newMatch = await GeminiAIService.generateChallengeMatch(topicInput);
    setMatch(newMatch);
    setIsBattleActive(true);
  };

  const handleLockAnswer = (optIdx: number) => {
    if (battleState !== "ready") return;
    setSelectedOption(optIdx);
    setBattleState("thinking");

    setTimeout(() => {
      if (!match) return;
      const studentCorrect = optIdx === match.correctOptionIndex;
      const newStudentScore = studentCorrect ? studentScore + 1 : studentScore;
      const newAiScore = match.aiAnswerIndex === match.correctOptionIndex ? aiScore + 1 : aiScore;

      setStudentScore(newStudentScore);
      setAiScore(newAiScore);

      if (studentCorrect) {
        setTotalXp((prev) => prev + match.xpEarned);
        setStreak((prev) => prev + 1);
      }

      setMatch((prev) =>
        prev
          ? {
              ...prev,
              userAnswerIndex: optIdx,
              userResult: studentCorrect ? "win" : "loss",
            }
          : null
      );
      setBattleState("completed");
    }, 1400);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Arena Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 dark:from-amber-500/20 dark:via-orange-500/20 dark:to-slate-900 border border-amber-500/30 space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-10 relative">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider border border-amber-500/30">
              <Zap className="w-3.5 h-3.5 fill-current" />
              AI Se Baazi — Challenge Mode
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white font-heading">
              Can You Beat the AI?
            </h2>
            <p className="text-xs text-slate-700 dark:text-slate-200">
              Lock in your answer first. AI generates its own answer in real-time. Win XP and build your battle streak!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white dark:bg-[#111722] border border-amber-500/30 text-center space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Your Score</span>
              <span className="text-xl font-black text-slate-900 dark:text-white font-heading">{studentScore}</span>
            </div>
            <span className="text-sm font-black text-amber-500">VS</span>
            <div className="p-3 rounded-2xl bg-white dark:bg-[#111722] border border-amber-500/30 text-center space-y-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">AI Score</span>
              <span className="text-xl font-black text-[#3157D5] dark:text-[#4F8CFF] font-heading">{aiScore}</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="pt-4 border-t border-amber-500/20 flex flex-wrap items-center gap-6 text-xs font-bold text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-1.5"><Flame className="w-4 h-4 text-orange-500" /> {streak} Battle Streak</div>
          <div className="flex items-center gap-1.5"><Trophy className="w-4 h-4 text-amber-500" /> {totalXp} Total XP</div>
          <div className="flex items-center gap-1.5"><Award className="w-4 h-4 text-purple-500" /> Rank: Grandmaster Student</div>
        </div>
      </div>

      {/* Arena Match Generator */}
      {!isBattleActive ? (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-4 text-center max-w-xl mx-auto">
          <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 w-max mx-auto">
            <Zap className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">Start New Battle Match</h3>
          <p className="text-xs text-slate-500">Pick a subject or let AI select a random challenge question.</p>

          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white text-center focus:outline-none"
            placeholder="Enter challenge topic..."
          />

          <button
            onClick={handleStartChallenge}
            className="w-full py-4 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-colors shadow-md flex items-center justify-center gap-2"
            type="button"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Challenge AI Now (20 Credits)</span>
          </button>
        </div>
      ) : match && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Topic: {match.topic}
            </span>
            <span className="text-xs font-bold text-slate-500">+150 XP per win</span>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">{match.question}</h3>

            <div className="space-y-2">
              {match.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = match.correctOptionIndex === idx;

                let style = "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200";
                if (battleState === "completed") {
                  if (isCorrect) style = "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold";
                  else if (isSelected && !isCorrect) style = "bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400";
                } else if (isSelected) {
                  style = "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleLockAnswer(idx)}
                    disabled={battleState !== "ready"}
                    className={`w-full text-left p-4 rounded-2xl border text-xs flex items-center justify-between transition-all ${style}`}
                    type="button"
                  >
                    <span>{opt}</span>
                    {battleState === "completed" && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {battleState === "completed" && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Battle Status & Explanation */}
          {battleState === "thinking" && (
            <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
              <Bot className="w-4 h-4" />
              <span>AI is analyzing options and submitting its answer...</span>
            </div>
          )}

          {battleState === "completed" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-slate-900 text-white space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl font-black font-heading text-amber-400">
                  {match.userResult === "win" ? "🔥 AI Defeated!" : "🤖 AI Wins This Round"}
                </span>
                <span className="text-xs font-bold text-slate-400">+{match.xpEarned} XP Awarded</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="font-bold text-slate-200">AI Explanation:</div>
                <p>{match.aiExplanation}</p>
              </div>

              <button
                onClick={handleStartChallenge}
                className="w-full py-3.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
                type="button"
              >
                <span>Play Next Round</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>
      )}

    </div>
  );
}
