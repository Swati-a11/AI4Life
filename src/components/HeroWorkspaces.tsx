"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { WorkspaceCard } from "./WorkspaceCard";

export function HeroWorkspaces() {
  const typewriterPhrases = [
    "Learn smarter.",
    "Work clearer.",
    "Live simpler.",
  ];

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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
    <section id="workspaces" className="py-12 sm:py-20 relative overflow-hidden isolate">
      
      {/* 3D Image Background spanning directly behind the header text without any box container */}
      <div 
        className="absolute top-0 left-0 right-0 h-[480px] sm:h-[560px] bg-contain sm:bg-cover bg-center bg-no-repeat pointer-events-none opacity-90 dark:opacity-85 transition-opacity -z-10"
        style={{ backgroundImage: "url('/images/hero-bg-3d.png')" }}
      />

      {/* Soft radial overlay mask so text remains 100% crisp without an artificial box */}
      <div className="absolute top-0 left-0 right-0 h-[480px] sm:h-[560px] bg-gradient-to-r from-[#F4F3EE]/40 via-[#F4F3EE]/60 to-[#F4F3EE]/40 dark:from-[#080B12]/50 dark:via-[#080B12]/70 dark:to-[#080B12]/50 pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Hero Header — Pure Text Block without any outer box/card container */}
        <div className="text-center max-w-4xl mx-auto space-y-6 pt-6 pb-14 sm:pt-12 sm:pb-20">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h1 className="hero-headline text-slate-950 dark:text-white font-heading drop-shadow-md">
              AI that fits <br />
              <span className="text-[#3157D5] dark:text-[#4F8CFF]">your life.</span>
            </h1>

            {/* Typewriter Animation */}
            <div className="h-12 flex items-center justify-center">
              <span className="text-2xl sm:text-4xl font-extrabold text-slate-950 dark:text-white font-heading tracking-tight drop-shadow-md">
                {currentText}
                <span className="animate-pulse text-[#3157D5] dark:text-[#4F8CFF] font-normal ml-0.5">|</span>
              </span>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="body-lead text-slate-900 dark:text-slate-100 max-w-2xl mx-auto font-semibold drop-shadow-xs"
          >
            One AI core, designed around the way you actually live.
          </motion.p>

        </div>

        {/* THREE WORKSPACE CARDS BELOW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          <WorkspaceCard
            id="student"
            type="student"
            title="Student"
            description="Learn, revise and understand without the overwhelm."
            actions={["Study", "Quiz", "Explain"]}
            buttonText="Open Student →"
            accentColor="bg-blue-500"
            glowClass="radial-blue-glow"
            borderHoverColor="hover:border-blue-500/50"
          />

          <WorkspaceCard
            id="professional"
            type="professional"
            title="Professional"
            description="Turn meetings, documents and ideas into clear next steps."
            actions={["Summarize", "Plan", "Act"]}
            buttonText="Open Professional →"
            accentColor="bg-teal-500"
            glowClass="radial-teal-glow"
            borderHoverColor="hover:border-teal-500/50"
          />

          <WorkspaceCard
            id="household"
            type="household"
            title="Household"
            description="Keep everyday information, plans and tasks in one place."
            actions={["Plan", "Remember", "Organize"]}
            buttonText="Open Household →"
            accentColor="bg-orange-500"
            glowClass="radial-coral-glow"
            borderHoverColor="hover:border-orange-500/50"
          />

        </div>

      </div>
    </section>
  );
}
