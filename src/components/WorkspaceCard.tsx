"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Briefcase, Home, CheckCircle2, FileText, Calendar } from "lucide-react";

interface WorkspaceCardProps {
  id: string;
  title: string;
  description: string;
  actions: string[];
  buttonText: string;
  type: "student" | "professional" | "household";
  accentColor: string;
  glowClass: string;
  borderHoverColor: string;
}

export function WorkspaceCard({
  title,
  description,
  actions,
  buttonText,
  type,
  accentColor,
  glowClass,
  borderHoverColor,
}: WorkspaceCardProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX(-(y - centerY) * 0.05);
    setRotateY((x - centerX) * 0.05);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const cardLink = "/student";

  return (
    <a href={cardLink} className="perspective-1000 block">
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX, rotateY }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        whileHover={{ y: -8 }}
        style={{ transformStyle: "preserve-3d" }}
        className={`premium-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between group cursor-pointer relative overflow-hidden transition-all ${borderHoverColor}`}
      >
        {/* Subtle Radial Glow per Card Type */}
        <div className={`absolute -top-12 -right-12 w-56 h-56 rounded-full blur-2xl opacity-40 group-hover:opacity-80 transition-opacity pointer-events-none ${glowClass}`} />

        {/* Mouse Tracking Inner Highlight */}
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.08), transparent 80%)`,
          }}
        />

        <div className="space-y-6 relative z-10" style={{ transform: "translateZ(20px)" }}>
          
          {/* Header & Icon */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white group-hover:scale-110 transition-transform shadow-xs">
                {type === "student" && <BookOpen className="w-5 h-5 text-[#3157D5] dark:text-[#4F8CFF]" />}
                {type === "professional" && <Briefcase className="w-5 h-5 text-[#0D9488] dark:text-[#38D9C5]" />}
                {type === "household" && <Home className="w-5 h-5 text-[#E56B4E]" />}
              </div>
              <h3 className="card-title font-bold text-slate-900 dark:text-white font-heading">
                {title}
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-base text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
            "{description}"
          </p>

          {/* Floating Workspace Mockup */}
          <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 space-y-2 group-hover:translate-y-[-4px] transition-transform">
            {type === "student" && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                  <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-[#3157D5] dark:text-[#4F8CFF]" /> Lecture_Notes.pdf</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-[#3157D5] dark:text-[#4F8CFF]">12 Quiz Cards</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-800 dark:text-slate-100 font-medium">
                  Q: What are the key concepts of neural memory?
                </div>
              </div>
            )}

            {type === "professional" && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                  <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-[#0D9488] dark:text-[#38D9C5]" /> Q3_Product_Roadmap.docx</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/10 text-[#0D9488] dark:text-[#38D9C5]">3 Action Items</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-800 dark:text-slate-100 font-medium flex items-center justify-between">
                  <span>Ship v2.0 feature release</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#38D9C5]" />
                </div>
              </div>
            )}

            {type === "household" && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#E56B4E]" /> Household_Schedule</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/10 text-[#E56B4E]">Synced</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-800 dark:text-slate-100 font-medium flex items-center justify-between">
                  <span>Medical appointment • Sept 22</span>
                  <span className="text-[10px] text-slate-400">10:00 AM</span>
                </div>
              </div>
            )}
          </div>

          {/* Subtle Action Chips */}
          <div className="flex items-center gap-2">
            {actions.map((act) => (
              <span
                key={act}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800"
              >
                {act}
              </span>
            ))}
          </div>

        </div>

        {/* Action Button */}
        <div className="pt-6 mt-6 border-t border-slate-200/60 dark:border-slate-800/80 relative z-10" style={{ transform: "translateZ(30px)" }}>
          <div className="w-full flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#3157D5] dark:group-hover:text-[#4F8CFF] transition-colors">
            <span>{buttonText}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>

      </motion.div>
    </a>
  );
}
