"use client";

import React, { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Briefcase,
  Home,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  Zap,
  BookOpen,
  Headphones,
  CheckSquare,
  Mail,
  Calendar,
  Receipt,
  Upload,
  BrainCircuit,
  Workflow,
  ChevronRight,
  RefreshCw
} from "lucide-react";

export type SpaceType = "all" | "student" | "professional" | "household";
export type StageType = "upload" | "understand" | "act";

interface SignatureElementProps {
  selectedSpace?: SpaceType;
  onSpaceChange?: (space: SpaceType) => void;
}

export function SignatureElement({ selectedSpace = "all", onSpaceChange }: SignatureElementProps) {
  const [activeSpace, setActiveSpace] = useState<SpaceType>(selectedSpace);
  const [activeStage, setActiveStage] = useState<StageType>("understand");
  const [interactiveSimulating, setInteractiveSimulating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchronize internal state if prop changes
  React.useEffect(() => {
    setActiveSpace(selectedSpace);
  }, [selectedSpace]);

  const handleSpaceSelect = (space: SpaceType) => {
    setActiveSpace(space);
    if (onSpaceChange) onSpaceChange(space);
  };

  // 3D Perspective Mouse Tilt Physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 350, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 350, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const triggerSimulation = () => {
    setInteractiveSimulating(true);
    setActiveStage("upload");
    setTimeout(() => setActiveStage("understand"), 1200);
    setTimeout(() => {
      setActiveStage("act");
      setInteractiveSimulating(false);
    }, 2400);
  };

  return (
    <div id="signature-core" className="w-full max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Header & Space Selector Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
              The AI4Life Tri-Space Engine
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive 3D preview of converging workflows
            </p>
          </div>
        </div>

        {/* Space Selector Tabs */}
        <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-900/80 border border-slate-300/60 dark:border-slate-800 shadow-inner">
          {[
            { id: "all" as const, label: "Convergent Core", icon: Layers },
            { id: "student" as const, label: "Student Space", icon: GraduationCap },
            { id: "professional" as const, label: "Professional Space", icon: Briefcase },
            { id: "household" as const, label: "Household Space", icon: Home },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSpace === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSpaceSelect(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                  isActive
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                type="button"
              >
                {isActive && (
                  <motion.div
                    layoutId="space-tab"
                    className="absolute inset-0 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-teal-600 dark:text-teal-400" : "text-slate-400"}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload -> Understand -> Act Stage Bar */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8 max-w-3xl mx-auto">
        {[
          { id: "upload" as const, stage: "1. Information", label: "Upload & Input", icon: Upload, color: "text-indigo-500 dark:text-indigo-400" },
          { id: "understand" as const, stage: "2. Synthesis", label: "Deep Understanding", icon: BrainCircuit, color: "text-teal-500 dark:text-teal-400" },
          { id: "act" as const, stage: "3. Execution", label: "Automated Action", icon: Workflow, color: "text-amber-500 dark:text-amber-400" },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeStage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveStage(item.id)}
              className={`flex flex-col items-center p-3 rounded-2xl border transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                isActive
                  ? "bg-white dark:bg-slate-800/90 border-teal-500/50 shadow-md scale-102"
                  : "bg-slate-100/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-200/40 dark:hover:bg-slate-800/40"
              }`}
              type="button"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {item.stage}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3D Perspective Card Container */}
      <div 
        className="perspective-1000 relative"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative w-full rounded-3xl glass-card p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xl transition-shadow duration-300"
        >
          {/* Subtle Background Glow Spheres */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Interactive Simulation Run Banner */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                Active Processing View: {activeSpace === "all" ? "Tri-Space Convergence Core" : `${activeSpace.toUpperCase()} Space`}
              </span>
            </div>

            <button
              onClick={triggerSimulation}
              disabled={interactiveSimulating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 hover:bg-teal-500/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              type="button"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${interactiveSimulating ? "animate-spin" : ""}`} />
              <span>{interactiveSimulating ? "Processing Stream..." : "Run Live Stream Demo"}</span>
            </button>
          </div>

          {/* 3 Workspace Panel Stack */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            
            {/* PANEL 1: STUDENT SPACE */}
            <motion.div
              animate={{
                scale: activeSpace === "all" || activeSpace === "student" ? 1 : 0.95,
                opacity: activeSpace === "all" || activeSpace === "student" ? 1 : 0.4,
                y: activeSpace === "student" ? -6 : 0
              }}
              transition={{ duration: 0.3 }}
              className={`rounded-2xl p-5 border transition-all ${
                activeSpace === "student"
                  ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500/40 shadow-lg ring-2 ring-indigo-500/20"
                  : "bg-white/60 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800/80"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                      Student Space
                    </h4>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                      Academic & Courseware Core
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                  INDIGO
                </span>
              </div>

              {/* Content depending on active stage */}
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    Uploaded Information
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    Organic Chemistry II Lecture Transcript.pdf (42 pgs)
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
                    <BrainCircuit className="w-3.5 h-3.5 text-indigo-500" />
                    Synthesized Understanding
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    14 Core Mechanisms Extracted • Exam High-Yield Summary Generated
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Automated Actions Generated:
                  </div>
                  <div className="flex items-center gap-2 text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>24 Spaced-Repetition Cards Created</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
                    <Headphones className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>15-Min Audio Commute Summary Built</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* PANEL 2: PROFESSIONAL SPACE */}
            <motion.div
              animate={{
                scale: activeSpace === "all" || activeSpace === "professional" ? 1 : 0.95,
                opacity: activeSpace === "all" || activeSpace === "professional" ? 1 : 0.4,
                y: activeSpace === "professional" ? -6 : 0
              }}
              transition={{ duration: 0.3 }}
              className={`rounded-2xl p-5 border transition-all ${
                activeSpace === "professional"
                  ? "bg-teal-50/80 dark:bg-teal-950/40 border-teal-500/40 shadow-lg ring-2 ring-teal-500/20"
                  : "bg-white/60 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800/80"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                      Professional Space
                    </h4>
                    <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                      Work, Meetings & Strategy Core
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                  TEAL
                </span>
              </div>

              {/* Content depending on active stage */}
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <FileText className="w-3.5 h-3.5 text-teal-500" />
                    Uploaded Information
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    Q3 Executive Roadmap & Zoom Transcript.txt
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-teal-500/5 dark:bg-teal-500/10 border border-teal-500/20">
                  <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-300 mb-1">
                    <BrainCircuit className="w-3.5 h-3.5 text-teal-500" />
                    Synthesized Understanding
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    3 Critical Engineering Blockers Identified & Risk Matrix Analyzed
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Automated Actions Generated:
                  </div>
                  <div className="flex items-center gap-2 text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
                    <CheckSquare className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    <span>5 Jira Tickets Created & Assigned</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
                    <Mail className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    <span>Executive Email Briefing Drafted for VP</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* PANEL 3: HOUSEHOLD SPACE */}
            <motion.div
              animate={{
                scale: activeSpace === "all" || activeSpace === "household" ? 1 : 0.95,
                opacity: activeSpace === "all" || activeSpace === "household" ? 1 : 0.4,
                y: activeSpace === "household" ? -6 : 0
              }}
              transition={{ duration: 0.3 }}
              className={`rounded-2xl p-5 border transition-all ${
                activeSpace === "household"
                  ? "bg-amber-50/80 dark:bg-amber-950/40 border-amber-500/40 shadow-lg ring-2 ring-amber-500/20"
                  : "bg-white/60 dark:bg-slate-900/60 border-slate-200/60 dark:border-slate-800/80"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                      Household Space
                    </h4>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                      Home, Bills & Life Admin Core
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  AMBER
                </span>
              </div>

              {/* Content depending on active stage */}
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    Uploaded Information
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                    HVAC Maintenance Warranty & Bids.pdf
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">
                    <BrainCircuit className="w-3.5 h-3.5 text-amber-500" />
                    Synthesized Understanding
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Filter Renewal Required • Warranty Valid Until Oct 2028
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Automated Actions Generated:
                  </div>
                  <div className="flex items-center gap-2 text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
                    <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Filter Replacement Reminder Set (Oct 15)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
                    <Receipt className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Auto-Categorized $450 in Home Ledger</span>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Convergence Core Bottom Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-300">
                <strong className="font-semibold text-slate-900 dark:text-white">Unified AI Intelligence:</strong> All 3 spaces feed one continuous memory bank with strict security privacy layers.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                Explore Core Engine
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
