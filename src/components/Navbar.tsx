"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X, Zap } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Workspaces", href: "#workspaces" },
    { name: "How it works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left: Logo & Wordmark */}
        <Link 
          href="/" 
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg p-1"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 dark:bg-blue-500 text-white font-black shadow-sm group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 fill-current" />
          </div>

          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white font-heading">
              AI4Life
            </span>
            <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium tracking-wide">
              One AI core. Three ways to live.
            </span>
          </div>
        </Link>

        {/* Center: Minimal Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-200/60 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-300/60 dark:border-slate-800">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />

          <a
            href="#pricing"
            className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-colors px-2 py-1"
          >
            Sign In
          </a>
          
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="#get-started"
            className="relative group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#3157D5] dark:bg-[#4F8CFF] hover:bg-[#2848b8] dark:hover:bg-[#3b79f0] shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Toggle Navigation Menu"
            type="button"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-[#F4F3EE]/95 dark:bg-[#080B12]/95 backdrop-blur-2xl px-4 py-6"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-900 transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                <a
                  href="#get-started"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-base font-bold text-white bg-[#3157D5] dark:bg-[#4F8CFF] shadow-md"
                >
                  <span>Get Started free</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
