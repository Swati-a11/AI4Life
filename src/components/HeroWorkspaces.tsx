"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { WorkspaceCard } from "./WorkspaceCard";

export function HeroWorkspaces() {
  const typewriterPhrases = [
    "Learn smarter.",
    "Understand faster.",
    "Master weak topics.",
    "Ace your exams.",
  ];

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [bgTilt, setBgTilt] = useState({ rotateX: 0, rotateY: 0 });

  // Scroll parallax calculation for hero background
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 800], [0, 110]);
  const opacityBg = useTransform(scrollY, [0, 600], [0.95, 0.25]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    // Subtle 3D tilt calculation for background 3D books image
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setBgTilt({
      rotateX: -((y - centerY) / centerY) * 3,
      rotateY: ((x - centerX) / centerX) * 3,
    });
  };

  const handleMouseLeave = () => {
    setBgTilt({ rotateX: 0, rotateY: 0 });
  };

  useEffect(() => {
    const fullText = typewriterPhrases[currentPhraseIndex];
    const typingSpeed = isDeleting ? 40 : 80;

    const timer = setTimeout(() => {
      if (!isDeleting && currentText === fullText) {
        setTimeout(() => setIsDeleting(true), 1800);
      } else if (isDeleting && currentText === "") {
        setIsDeleting(false);
        setCurrentPhraseIndex((prev) => (prev + 1) % typewriterPhrases.length);
      } else {
        setCurrentText(
          fullText.substring(0, currentText.length + (isDeleting ? -1 : 1))
        );
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentPhraseIndex]);

  return (
    <>
      {/* 1. HERO SECTION — Occupies full initial viewport with parallax & 3D books animation */}
      <section
        id="hero"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="min-h-screen sm:min-h-[95vh] flex flex-col items-center justify-center relative overflow-hidden isolate pt-28 pb-16"
      >
        {/* Subtle Ambient Cursor Light (Desktop only) */}
        <div
          className="pointer-events-none absolute inset-0 -z-5 hidden md:block transition-opacity duration-500 opacity-60"
          style={{
            background: `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(49, 87, 213, 0.09), transparent 75%)`,
          }}
        />

        {/* 3D FLOATING & TILTING BACKGROUND BOOKS LAYER */}
        <div className="absolute inset-0 pointer-events-none -z-10 perspective-1000 overflow-hidden">
          <motion.div
            style={{
              y: yBg,
              opacity: opacityBg,
              rotateX: bgTilt.rotateX,
              rotateY: bgTilt.rotateY,
              transformStyle: "preserve-3d",
            }}
            animate={{
              y: [-10, 10, -10],
              rotateZ: [-1, 1, -1],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 9,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            className="w-full h-full bg-contain sm:bg-cover bg-center bg-no-repeat transition-transform duration-500 ease-out"
          >
            <div
              className="w-full h-full bg-contain sm:bg-cover bg-center bg-no-repeat opacity-90 dark:opacity-85"
              style={{ backgroundImage: "url('/images/hero-bg-3d.png')" }}
            />
          </motion.div>
        </div>

        {/* Soft radial overlay mask so hero text remains 100% crisp */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F4F3EE]/40 via-[#F4F3EE]/60 to-[#F4F3EE]/40 dark:from-[#080B12]/50 dark:via-[#080B12]/70 dark:to-[#080B12]/50 pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            {/* Staggered Hero Headline Reveal */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <h1 className="hero-headline text-slate-950 dark:text-white font-heading drop-shadow-md">
                AI that helps you <br />
                <motion.span
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="text-shimmer"
                >
                  learn, understand & improve.
                </motion.span>
              </h1>

              {/* Typewriter Animation */}
              <div className="h-12 flex items-center justify-center">
                <span className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white font-heading tracking-tight drop-shadow-md">
                  {currentText}
                  <span className="animate-pulse text-[#3157D5] dark:text-[#4F8CFF] font-normal ml-0.5">|</span>
                </span>
              </div>
            </motion.div>

            {/* Supporting Description Reveal */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="body-lead text-slate-900 dark:text-slate-100 max-w-2xl mx-auto font-semibold drop-shadow-xs"
            >
              AI4Life Student Workspace — Upload notes, ask questions, generate quizzes, and challenge AI to master your subjects.
            </motion.p>

            {/* Scroll Down Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="pt-10 flex flex-col items-center gap-2"
            >
              <a
                href="#student"
                className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer group"
              >
                <span>Scroll down to explore Student Workspace</span>
                <span className="animate-bounce text-blue-600 dark:text-blue-400 font-bold">↓</span>
              </a>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. STUDENT WORKSPACE SECTION — Smooth scroll entrance + 3D emergence */}
      <section id="student" className="py-24 sm:py-32 relative overflow-hidden bg-slate-50/50 dark:bg-[#0A0E17]/50 border-t border-slate-200/50 dark:border-slate-800/50">
        
        {/* Hero -> Workspace Transition Ambient Glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95, rotateX: 5 }}
            whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto space-y-6 perspective-1000"
          >
            <div className="text-center space-y-2 mb-8">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#3157D5] dark:text-[#4F8CFF] px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                PRODUCT PREVIEW
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">
                Student Workspace MVP
              </h2>
            </div>

            {/* Subtle settled floating effect after scroll reveal */}
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
            >
              <WorkspaceCard
                id="student"
                type="student"
                title="Student Workspace MVP"
                description="Upload notes, get grounded answers, generate custom quizzes, and challenge AI to master weak topics."
                actions={["AI Tutor", "Ask From Notes", "Quiz Lab", "AI Se Baazi", "Mem0 Memory"]}
                buttonText="Enter Student Workspace →"
                accentColor="bg-blue-500"
                glowClass="radial-blue-glow"
                borderHoverColor="hover:border-blue-500/50"
              />
            </motion.div>
          </motion.div>

        </div>
      </section>
    </>
  );
}
