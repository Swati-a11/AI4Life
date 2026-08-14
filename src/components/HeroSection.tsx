"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, Variants } from "framer-motion";
import { Sparkles, ArrowRight, Play, FileText, CheckSquare, Zap, GraduationCap, Briefcase, Home, Layers, ListChecks } from "lucide-react";
import { ImageStreamHero } from "@/components/ui/image-stream-hero";

const CDN_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
    alt: "AI workspace analytics and document synthesis",
  },
  {
    src: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80",
    alt: "Student studying with digital textbook and study guide",
  },
  {
    src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80",
    alt: "Professional executive strategy meeting and project roadmap",
  },
  {
    src: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80",
    alt: "Modern household management, appliance warranties and budget notes",
  },
  {
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
    alt: "Team collaboration on digital AI workspace dashboard",
  },
  {
    src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
    alt: "Research notes, exam flashcards and automated study guides",
  },
  {
    src: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
    alt: "Financial invoices, expense tracking and home maintenance receipts",
  },
  {
    src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    alt: "Abstract 3D cyan network representing knowledge memory core",
  },
];

const ROTATING_PHRASES = [
  "Action shouldn't be.",
  "Three spaces. One AI core.",
  "Understand anything.",
  "Remember what matters.",
  "Turn knowledge into action."
];

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  // Typewriter state
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Micro-interaction card stage state: 0: Upload -> 1: Understanding -> 2: Decision -> 3: Action Executed
  const [microStage, setMicroStage] = useState(0);

  // Typewriter effect logic
  useEffect(() => {
    const fullPhrase = ROTATING_PHRASES[phraseIndex];
    const typingSpeed = isDeleting ? 35 : 75;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setCurrentText(fullPhrase.substring(0, currentText.length + 1));
        if (currentText === fullPhrase) {
          setTimeout(() => setIsDeleting(true), 2200);
        }
      } else {
        setCurrentText(fullPhrase.substring(0, currentText.length - 1));
        if (currentText === "") {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, phraseIndex]);

  // Micro-interaction sequence auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      setMicroStage((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <ImageStreamHero
      images={CDN_IMAGES}
      speed={22}
      axis={52}
      className="min-h-[calc(100vh-80px)] w-full bg-[#070B14] text-white flex flex-col justify-center py-12 lg:py-20"
    >
      {/* Background Radial Glow Layer */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] lg:w-[950px] h-[500px] bg-gradient-to-tr from-cyan-500/15 via-sky-500/10 to-teal-500/10 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
          
          {/* Top Pill Indicator */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-6"
          >
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-semibold text-cyan-300 shadow-md backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </span>
                <span className="font-bold text-cyan-400 uppercase tracking-wider">AI4Life v2.0:</span>
                <span>Student • Professional • Household Workspaces</span>
              </div>
            </motion.div>

            {/* Main Headline with Typewriter */}
            <motion.div variants={itemVariants} className="w-full">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white font-heading leading-[1.1]">
                Information is everywhere. <br />
                <span className="gradient-text-cyan inline-block min-h-[1.2em]">
                  {currentText}
                  <span className="animate-pulse text-cyan-400 ml-1">|</span>
                </span>
              </h1>
            </motion.div>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed"
            >
              Upload anything. Ask anything. Turn what you know into something you can do.
            </motion.p>

            {/* 3 Workspaces Quick Chips */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                Student Space
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                <Briefcase className="w-4 h-4 text-cyan-400" />
                Professional Space
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30">
                <Home className="w-4 h-4 text-amber-400" />
                Household Space
              </span>
            </motion.div>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md pt-2"
            >
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="#try-ai4life"
                className="w-full sm:w-auto relative group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-teal-300 hover:from-cyan-300 hover:to-sky-300 shadow-xl shadow-cyan-500/25 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <Sparkles className="w-5 h-5 text-slate-950 group-hover:rotate-12 transition-transform" />
                <span>Try AI4Life Free</span>
                <ArrowRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="#solution"
                className="w-full sm:w-auto relative inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl text-base font-bold text-slate-200 bg-slate-900/90 border border-slate-700/90 hover:bg-slate-800 shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
                <span>See how it works</span>
              </motion.a>
            </motion.div>

            {/* HERO MICRO-INTERACTION CARD (Info -> Understand -> Act) */}
            <motion.div variants={itemVariants} className="w-full pt-4 max-w-xl">
              <div className="p-4 rounded-2xl glass-card-cyan bg-slate-950/90 shadow-2xl relative overflow-hidden text-left border border-cyan-400/40">
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    AI4Life Pipeline Visualizer
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                    Live Demo
                  </span>
                </div>

                <div className="min-h-[54px] flex items-center justify-between gap-4">
                  {microStage === 0 && (
                    <motion.div
                      key="stage0"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center gap-3 w-full"
                    >
                      <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-400">UPLOADED SOURCE</span>
                        <h4 className="text-sm font-bold text-white">School Circular.pdf</h4>
                      </div>
                    </motion.div>
                  )}

                  {microStage === 1 && (
                    <motion.div
                      key="stage1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center gap-3 w-full"
                    >
                      <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        <Sparkles className="w-5 h-5 animate-spin" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-sky-400">DEEP UNDERSTANDING</span>
                        <h4 className="text-sm font-bold text-white">3 important dates found</h4>
                      </div>
                    </motion.div>
                  )}

                  {microStage === 2 && (
                    <motion.div
                      key="stage2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center gap-3 w-full"
                    >
                      <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        <ListChecks className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-teal-400">DECISION HUB</span>
                        <h4 className="text-sm font-bold text-white">Create checklist</h4>
                      </div>
                    </motion.div>
                  )}

                  {microStage === 3 && (
                    <motion.div
                      key="stage3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center gap-3 w-full"
                    >
                      <div className="p-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold">
                        <CheckSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-cyan-400">AUTOMATED ACTION</span>
                        <h4 className="text-sm font-bold text-white">4 actions generated</h4>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex items-center gap-1 shrink-0">
                    {[0, 1, 2, 3].map((step) => (
                      <button
                        key={step}
                        onClick={() => setMicroStage(step)}
                        className={`h-2 rounded-full transition-all ${
                          microStage === step ? "w-6 bg-cyan-400" : "w-2 bg-slate-700 hover:bg-slate-600"
                        }`}
                        aria-label={`Jump to stage ${step + 1}`}
                        type="button"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

          </motion.div>

        </div>
      </div>
    </ImageStreamHero>
  );
}
