"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Trophy,
  Bot,
  User,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  FileText,
  ShieldCheck,
  Brain,
  Clock,
  Eye,
  X,
  TrendingUp,
  Award,
  Layers,
  HelpCircle
} from "lucide-react";
import { BaaziBattleResult } from "@/lib/services/server-store";
import { loadMaterialsFromCache, getMaterialFromCache } from "@/lib/utils/materials-cache";
import { CreditService } from "@/lib/services/credit-service";

interface ChallengeModeViewProps {
  onDeductCredits?: (cost: number) => boolean;
}

type ChallengeState =
  | "IDLE"
  | "CREDIT_CONFIRMATION"
  | "EXPLAIN_IT_BACK"
  | "EVALUATING"
  | "RESULT";

// Dual Human vs AI 4-Dimension Radar / Spider Chart SVG Component
function RadarChart({
  humanScores,
  aiScores
}: {
  humanScores: { accuracy: number; depth: number; speed: number; application: number };
  aiScores: { accuracy: number; depth: number; speed: number; application: number };
}) {
  const size = 260;
  const center = size / 2;
  const radius = 95;

  // 4 Axes: Top = Accuracy (0°), Right = Speed (90°), Bottom = Application (180°), Left = Depth (270°)
  const getCoordinates = (value: number, index: number) => {
    const angle = (index * Math.PI) / 2 - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const humanPoints = [
    getCoordinates(humanScores.accuracy, 0),
    getCoordinates(humanScores.speed, 1),
    getCoordinates(humanScores.application, 2),
    getCoordinates(humanScores.depth, 3)
  ];

  const aiPoints = [
    getCoordinates(aiScores.accuracy, 0),
    getCoordinates(aiScores.speed, 1),
    getCoordinates(aiScores.application, 2),
    getCoordinates(aiScores.depth, 3)
  ];

  const humanPoly = humanPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const aiPoly = aiPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="flex flex-col items-center space-y-3">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Concentric Grid Rings */}
        {[0.25, 0.5, 0.75, 1].map((level, i) => (
          <polygon
            key={i}
            points={[0, 1, 2, 3]
              .map((idx) => {
                const p = getCoordinates(100 * level, idx);
                return `${p.x},${p.y}`;
              })
              .join(" ")}
            className="fill-none stroke-slate-200 dark:stroke-slate-800"
            strokeWidth="1"
            strokeDasharray={level === 1 ? "none" : "3,3"}
          />
        ))}

        {/* Cross Axes Lines */}
        {[0, 1, 2, 3].map((idx) => {
          const p = getCoordinates(100, idx);
          return (
            <line
              key={idx}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeWidth="1"
            />
          );
        })}

        {/* AI Polygon (Blue) */}
        <polygon
          points={aiPoly}
          className="fill-blue-500/20 stroke-blue-500"
          strokeWidth="2.5"
        />

        {/* Human Polygon (Amber/Emerald) */}
        <polygon
          points={humanPoly}
          className="fill-amber-500/30 stroke-amber-500"
          strokeWidth="2.5"
        />

        {/* Vertices Markers */}
        {humanPoints.map((p, idx) => (
          <circle key={`h_${idx}`} cx={p.x} cy={p.y} r="4" className="fill-amber-500 stroke-white dark:stroke-slate-900" strokeWidth="2" />
        ))}
        {aiPoints.map((p, idx) => (
          <circle key={`a_${idx}`} cx={p.x} cy={p.y} r="4" className="fill-blue-500 stroke-white dark:stroke-slate-900" strokeWidth="2" />
        ))}

        {/* Labels */}
        <text x={center} y={15} textAnchor="middle" className="text-[10px] font-black fill-slate-700 dark:fill-slate-300 uppercase">Accuracy</text>
        <text x={size - 10} y={center + 4} textAnchor="start" className="text-[10px] font-black fill-slate-700 dark:fill-slate-300 uppercase">Speed</text>
        <text x={center} y={size - 5} textAnchor="middle" className="text-[10px] font-black fill-slate-700 dark:fill-slate-300 uppercase">Application</text>
        <text x={10} y={center + 4} textAnchor="end" className="text-[10px] font-black fill-slate-700 dark:fill-slate-300 uppercase">Depth</text>
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs font-extrabold pt-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
          <span className="text-slate-900 dark:text-white">YOU (Human)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
          <span className="text-slate-900 dark:text-white">AI Reference</span>
        </div>
      </div>
    </div>
  );
}

export function ChallengeModeView({ onDeductCredits }: ChallengeModeViewProps) {
  const [userCredits, setUserCredits] = useState(100);
  const [topicInput, setTopicInput] = useState("React");
  const [battleMode, setBattleMode] = useState<"general" | "material">("general");
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
  const [materials, setMaterials] = useState<any[]>([]);

  const [gameState, setGameState] = useState<ChallengeState>("IDLE");
  const [activeChallengeId, setActiveChallengeId] = useState<string>("");

  // Explain It Back Round State
  const [humanExplanation, setHumanExplanation] = useState("");
  const [responseStartTime, setResponseStartTime] = useState<number>(0);
  const [isViewingMaterialModal, setIsViewingMaterialModal] = useState(false);
  const [activeMaterialContent, setActiveMaterialContent] = useState<string>("");

  // Battle Result State
  const [battleResult, setBattleResult] = useState<BaaziBattleResult | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const current = CreditService.getCredits();
    setUserCredits(current);

    const handleCreditsUpdated = (e: any) => {
      if (e.detail && e.detail.credits !== undefined) {
        setUserCredits(e.detail.credits);
      }
    };

    window.addEventListener("ai4life:credits-updated", handleCreditsUpdated);

    fetch("/api/auth")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user && data.user.credits !== undefined) {
          setUserCredits(data.user.credits);
        }
      })
      .catch(console.error);

    try {
      const cached = loadMaterialsFromCache();
      if (cached.length > 0) {
        setMaterials(cached.map((m: any) => ({ id: m.id, title: m.title, sourceType: m.sourceType })));
      }
    } catch (e) {
      console.error("ChallengeModeView cache load error:", e);
    }

    return () => {
      window.removeEventListener("ai4life:credits-updated", handleCreditsUpdated);
    };
  }, []);

  const handleOpenConfirmation = () => {
    setErrorText(null);
    if (userCredits < 20) {
      setErrorText("Insufficient credits. AI Se Baazi requires 20 credits.");
      if (onDeductCredits) onDeductCredits(20);
      return;
    }
    setGameState("CREDIT_CONFIRMATION");
  };

  const handleConfirmStart = async () => {
    setIsProcessing(true);
    setErrorText(null);
    const idKey = `ch_${Date.now()}`;
    setActiveChallengeId(idKey);

    try {
      const res = await fetch("/api/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          topic: topicInput,
          materialId: battleMode === "material" ? selectedMaterialId : undefined,
          challengeId: idKey
        })
      });

      const data = await res.json();
      if (data.success) {
        if (data.creditsRemaining !== undefined) {
          setUserCredits(data.creditsRemaining);
          CreditService.notifyCreditDeduction(20, data.creditsRemaining);
        }
        setGameState("EXPLAIN_IT_BACK");
        setResponseStartTime(Date.now());

        // Fetch material content for Human Advantage view if selected
        if (battleMode === "material" && selectedMaterialId) {
          const cachedMat = getMaterialFromCache(selectedMaterialId);
          if (cachedMat) {
            setActiveMaterialContent(cachedMat.extractedText || cachedMat.content || "");
          } else {
            fetch(`/api/materials/${selectedMaterialId}`)
              .then((r) => r.json())
              .then((d) => {
                if (d.success && d.material) {
                  setActiveMaterialContent(d.material.extractedText || "");
                }
              })
              .catch(console.error);
          }
        }
      } else {
        setErrorText(data.error || "AI Se Baazi requires 20 credits.");
        setGameState("IDLE");
      }
    } catch (err) {
      console.error("Start battle error:", err);
      setErrorText("Could not start battle. Please try again.");
      setGameState("IDLE");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitExplanation = async () => {
    if (!humanExplanation.trim()) return;
    setIsProcessing(true);
    setGameState("EVALUATING");

    const elapsedSeconds = Math.max(5, Math.round((Date.now() - responseStartTime) / 1000));

    try {
      const res = await fetch("/api/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate_explain_back",
          topic: topicInput,
          materialId: battleMode === "material" ? selectedMaterialId : undefined,
          challengeId: activeChallengeId,
          humanExplanation,
          responseSeconds: elapsedSeconds
        })
      });

      const data = await res.json();
      if (data.success && data.result) {
        setBattleResult(data.result);
        if (data.creditsRemaining !== undefined) {
          setUserCredits(data.creditsRemaining);
        }
        setGameState("RESULT");
      } else {
        setErrorText("Couldn't calculate battle evaluation.");
        setGameState("IDLE");
      }
    } catch (err) {
      console.error("Evaluation error:", err);
      setErrorText("Failed to calculate battle evaluation.");
      setGameState("IDLE");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setGameState("IDLE");
    setHumanExplanation("");
    setBattleResult(null);
    setErrorText(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Flagship Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-purple-600/20 dark:from-amber-500/30 dark:via-orange-500/20 dark:to-slate-900 border border-amber-500/40 space-y-4 relative overflow-hidden shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-500/30">
              <Zap className="w-3.5 h-3.5 fill-current animate-pulse text-amber-500" />
              <span>AI SE BAAZI — FLAGSHIP HUMAN VS AI BATTLE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-heading">
              Can you understand this topic better than AI?
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-xl font-medium">
              Don't just learn. Prove what you know. Multi-dimensional evaluation (Accuracy, Depth, Speed, Application).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#111722]/90 border border-amber-500/30 text-center space-y-1 shadow-md shrink-0">
            <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              YOUR CREDITS
            </span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-heading flex items-center justify-center gap-1">
              <Zap className="w-5 h-5 fill-current" />
              <span>{userCredits}</span>
            </div>
          </div>
        </div>
      </div>

      {errorText && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorText}</span>
        </div>
      )}

      {/* STATE 1: IDLE — TOPIC & GROUNDED MODE SELECTION */}
      {gameState === "IDLE" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs">
          
          {/* Mode Selector */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider block">1. Select Battle Grounding Mode</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setBattleMode("general")}
                className={`p-4 rounded-2xl border text-left space-y-1 transition-all cursor-pointer ${
                  battleMode === "general"
                    ? "bg-amber-500/10 border-amber-500 text-slate-900 dark:text-white shadow-xs"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
                type="button"
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Brain className="w-4 h-4 text-amber-500" />
                  <span>Battle from General Knowledge</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Test your conceptual knowledge against AI's general training benchmark.</p>
              </button>

              <button
                onClick={() => setBattleMode("material")}
                className={`p-4 rounded-2xl border text-left space-y-1 transition-all cursor-pointer ${
                  battleMode === "material"
                    ? "bg-emerald-500/10 border-emerald-500 text-slate-900 dark:text-white shadow-xs"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
                type="button"
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Human Home Advantage (My Material)</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">You get open-book access to your uploaded material. AI answers without private file access!</p>
              </button>
            </div>
          </div>

          {/* Topic Selection */}
          <div className="space-y-4">
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider block">2. Choose Battle Topic</label>
            
            <div className="flex flex-wrap gap-2">
              {["React", "Python", "SQL", "Operating Systems", "Machine Learning", "Binary Search"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTopicInput(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    topicInput === t
                      ? "bg-amber-500 text-slate-950 shadow-md"
                      : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50"
                  }`}
                  type="button"
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Custom Topic</label>
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="Enter custom topic..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none"
                />
              </div>

              {battleMode === "material" && (
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Select Uploaded Material</label>
                  <select
                    value={selectedMaterialId}
                    onChange={(e) => {
                      const mId = e.target.value;
                      setSelectedMaterialId(mId);
                      const m = materials.find((mat) => mat.id === mId);
                      if (m) setTopicInput(m.title);
                    }}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="">Choose material for Home Advantage...</option>
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>📄 {m.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleOpenConfirmation}
            className="w-full py-4 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            type="button"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Start AI Se Baazi Battle (20 Credits)</span>
          </button>
        </div>
      )}

      {/* STATE 2: CREDIT CONFIRMATION MODAL */}
      <AnimatePresence>
        {gameState === "CREDIT_CONFIRMATION" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-2xl text-center"
            >
              <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 w-max mx-auto">
                <Zap className="w-8 h-8 fill-current" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white font-heading">
                  Confirm Battle Deduction
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Starting <span className="font-bold text-amber-600 dark:text-amber-400">"{topicInput}"</span> battle requires 20 credits.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold space-y-2 text-left">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Current Balance:</span> <span>{userCredits} Credits</span>
                </div>
                <div className="flex justify-between text-rose-500">
                  <span>Battle Fee:</span> <span>-20 Credits</span>
                </div>
                <div className="flex justify-between text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800 font-extrabold">
                  <span>Remaining Balance:</span> <span>{userCredits - 20} Credits</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGameState("IDLE")}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmStart}
                  disabled={isProcessing}
                  className="flex-1 py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 shadow-md cursor-pointer disabled:opacity-50"
                  type="button"
                >
                  {isProcessing ? "Deducting..." : "Start Battle — 20 Credits"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STATE 3: EXPLAIN IT BACK ROUND */}
      {(gameState === "EXPLAIN_IT_BACK" || gameState === "EVALUATING") && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs"
        >
          {/* Human Home Advantage Banner */}
          {battleMode === "material" && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>
                  <strong>Human Home Advantage Enabled:</strong> You can open your selected material. AI is answering using general knowledge without access to your private files.
                </span>
              </div>

              <button
                onClick={() => setIsViewingMaterialModal(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-[11px] hover:bg-emerald-400 shrink-0 cursor-pointer flex items-center gap-1"
                type="button"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View My Material</span>
              </button>
            </div>
          )}

          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                ROUND 1: EXPLAIN IT BACK
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white font-heading mt-1">
                Explain {topicInput} in your own words
              </h3>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Explain the core concept, practical real-world usage, and key mechanisms of <strong>{topicInput}</strong>. The AI Judge will evaluate your Accuracy, Depth, Speed, and Application against AI's benchmark.
          </p>

          <textarea
            value={humanExplanation}
            onChange={(e) => setHumanExplanation(e.target.value)}
            placeholder={`Type your explanation of ${topicInput} here... Include practical use cases or code examples to boost your Application score!`}
            rows={6}
            className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none leading-relaxed font-sans"
          />

          <div className="flex justify-end gap-3">
            <button
              onClick={handleSubmitExplanation}
              disabled={isProcessing || !humanExplanation.trim()}
              className="px-6 py-3.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              type="button"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isProcessing ? "AI Judge Evaluating..." : "Submit Explanation & Compare Scores"}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* STATE 4: FINAL BATTLE RESULT SCREEN */}
      {gameState === "RESULT" && battleResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 space-y-8 shadow-xl"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-wider border border-amber-500/20">
                <Trophy className="w-3.5 h-3.5 fill-current" />
                AI SE BAAZI BATTLE RESULT
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                Topic: {battleResult.topic}
              </h2>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>+20 Credits Awarded!</span>
            </div>
          </div>

          {/* 1. Radar Chart & Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-6 flex justify-center">
              <RadarChart humanScores={battleResult.humanScores} aiScores={battleResult.aiScores} />
            </div>

            <div className="md:col-span-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase">YOUR OVERALL SCORE</span>
                  <div className="text-3xl font-black text-amber-500 font-heading">{battleResult.humanOverall}%</div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center space-y-1">
                  <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase">AI REFERENCE BENCHMARK</span>
                  <div className="text-3xl font-black text-blue-500 font-heading">{battleResult.aiOverall}%</div>
                </div>
              </div>

              {/* YOUR WINS vs AI WINS */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-black text-emerald-500 uppercase block">YOUR WINS</span>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {battleResult.humanWins.length > 0 ? battleResult.humanWins.join(" • ") : "Close match"}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-black text-blue-500 uppercase block">AI WINS</span>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {battleResult.aiWins.length > 0 ? battleResult.aiWins.join(" • ") : "Equal match"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Beat Your Past Self / Growth Section */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-500">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">YOUR GROWTH (BEAT YOUR PAST SELF)</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Previous Attempt: {battleResult.previousOverall || 60}% → Current Attempt: {battleResult.humanOverall}%
                </h4>
              </div>
            </div>

            <div className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs shadow-xs shrink-0">
              +{battleResult.growthPercentage || 18}% Improvement! You're closing the gap.
            </div>
          </div>

          {/* 3. Side-by-Side Explanation Comparison & AI Judge Analysis */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">Side-by-Side Explanation Comparison</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
                  <User className="w-4 h-4" /> Your Explanation
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                  {battleResult.humanExplanationText}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-500">
                  <Bot className="w-4 h-4" /> AI Reference Explanation
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                  {battleResult.aiExplanationText}
                </p>
              </div>
            </div>

            {/* AI Judge Summary */}
            <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                <Sparkles className="w-4 h-4" /> AI Judge Analysis
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {battleResult.judgeSummary}
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 flex items-center justify-center gap-2 cursor-pointer"
              type="button"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Choose Another Topic</span>
            </button>

            <button
              onClick={handleOpenConfirmation}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 shadow-md flex items-center justify-center gap-2 cursor-pointer"
              type="button"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Challenge Me Again (20 Credits)</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* HUMAN ADVANTAGE MATERIAL MODAL */}
      <AnimatePresence>
        {isViewingMaterialModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl relative max-h-[80vh] flex flex-col"
            >
              <button
                onClick={() => setIsViewingMaterialModal(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  HUMAN HOME ADVANTAGE MATERIAL
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Selected Material Content</h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed border border-slate-800 whitespace-pre-wrap">
                {activeMaterialContent || "Material content loaded."}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
