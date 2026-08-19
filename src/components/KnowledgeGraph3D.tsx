"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FileText, Video, Image as ImageIcon, Headphones, Globe, Sparkles, CheckSquare, BrainCircuit, Zap } from "lucide-react";

export function KnowledgeGraph3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Parallax physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), { stiffness: 300, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Canvas particle stream animation connecting knowledge nodes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Particle streams
    interface Particle {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      progress: number;
      speed: number;
      color: string;
      size: number;
    }

    const particles: Particle[] = [];
    const nodeCount = 8;

    const createParticle = () => {
      const w = canvas.width;
      const h = canvas.height;
      const centerX = w / 2;
      const centerY = h / 2;

      // Inputs on left, Outputs on right
      const isInput = Math.random() > 0.4;
      const angle = Math.random() * Math.PI * 2;
      const distance = 140 + Math.random() * 100;

      const startX = isInput ? centerX - Math.cos(angle) * distance : centerX;
      const startY = isInput ? centerY - Math.sin(angle) * distance : centerY;
      const targetX = isInput ? centerX : centerX + Math.cos(angle) * distance;
      const targetY = isInput ? centerY : centerY + Math.sin(angle) * distance;

      particles.push({
        x: startX,
        y: startY,
        targetX,
        targetY,
        progress: 0,
        speed: 0.008 + Math.random() * 0.012,
        color: isInput ? "#22D3EE" : "#38BDF8",
        size: 1.5 + Math.random() * 2.5,
      });
    };

    for (let i = 0; i < 24; i++) {
      createParticle();
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const centerX = w / 2;
      const centerY = h / 2;

      // Draw faint background node connection lines
      ctx.strokeStyle = "rgba(34, 211, 238, 0.12)";
      ctx.lineWidth = 1;

      // Radial web connections
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * 160;
        const y = centerY + Math.sin(angle) * 140;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      // Render streaming data particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.progress += p.speed;

        if (p.progress >= 1) {
          particles.splice(i, 1);
          createParticle();
          continue;
        }

        const currentX = p.x + (p.targetX - p.x) * p.progress;
        const currentY = p.y + (p.targetY - p.y) * p.progress;

        ctx.fillStyle = p.color;
        ctx.shadowColor = "#22D3EE";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(currentX, currentY, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="perspective-1000 relative w-full h-[420px] sm:h-[480px] flex items-center justify-center select-none"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full max-w-lg h-full flex items-center justify-center"
      >
        {/* Canvas background for node data streams */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* Central AI4Life AI Knowledge Core */}
        <div className="relative z-20 flex flex-col items-center justify-center p-6 rounded-3xl glass-card-cyan border border-cyan-400/40 shadow-2xl shadow-cyan-500/20 text-center transform translate-z-12">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-500 text-slate-950 mb-3 shadow-lg shadow-cyan-400/30 animate-pulse">
            <Zap className="w-8 h-8 fill-current text-slate-950" />
            <span className="absolute -inset-1 rounded-2xl border border-cyan-400/50 animate-ping opacity-30" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
            AI4Life Core
          </span>
          <span className="text-sm font-bold text-white font-heading mt-0.5">
            Knowledge Engine
          </span>
          <span className="text-[11px] text-slate-400 mt-1">
            Qdrant + Mem0 Vector Sync
          </span>
        </div>

        {/* Floating Input Nodes (Left side) */}
        
        {/* Node 1: PDF */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-2 sm:left-6 top-12 z-10 p-3 rounded-2xl glass-card border border-slate-700/80 flex items-center gap-2.5 shadow-xl hover:border-cyan-400/50 transition-colors"
        >
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-200">School Circular.pdf</span>
            <span className="text-[10px] text-slate-400">15 Pages Ingested</span>
          </div>
        </motion.div>

        {/* Node 2: YouTube Video */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute left-4 sm:left-10 bottom-16 z-10 p-3 rounded-2xl glass-card border border-slate-700/80 flex items-center gap-2.5 shadow-xl hover:border-cyan-400/50 transition-colors"
        >
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-200">Lecture Video URL</span>
            <span className="text-[10px] text-slate-400">Transcript Analyzed</span>
          </div>
        </motion.div>

        {/* Node 3: Audio Note */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute left-1/4 top-4 z-10 p-2.5 rounded-2xl glass-card border border-slate-700/80 flex items-center gap-2 shadow-lg"
        >
          <Headphones className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-xs font-medium text-slate-300">Voice Note.mp3</span>
        </motion.div>

        {/* Floating Output Nodes (Right side) */}

        {/* Node 4: Action Checklist */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          className="absolute right-2 sm:right-6 top-16 z-10 p-3 rounded-2xl glass-card border border-cyan-500/30 flex items-center gap-2.5 shadow-xl bg-slate-900/90"
        >
          <div className="p-2 rounded-xl bg-cyan-400/20 text-cyan-300">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs font-bold text-cyan-300">4 Actions Generated</span>
            <span className="text-[10px] text-slate-400">Parent Orientation Checklist</span>
          </div>
        </motion.div>

        {/* Node 5: Quiz Flashcards */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
          className="absolute right-4 sm:right-10 bottom-20 z-10 p-3 rounded-2xl glass-card border border-slate-700/80 flex items-center gap-2.5 shadow-xl hover:border-sky-400/50 transition-colors"
        >
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-200">12 Quiz Flashcards</span>
            <span className="text-[10px] text-slate-400">Exam Prep Ready</span>
          </div>
        </motion.div>

        {/* Node 6: Context Memory Indicator */}
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-1/4 bottom-4 z-10 p-2.5 rounded-2xl glass-card border border-slate-700/80 flex items-center gap-2 text-xs font-semibold text-slate-300"
        >
          <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
          <span>Mem0: "Prefers concise briefs"</span>
        </motion.div>

      </motion.div>
    </div>
  );
}
