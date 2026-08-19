"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X, Zap, LogIn, UserPlus } from "lucide-react";
import { useAuth, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  let isSignedIn = false;
  let isClerkAvailable = false;
  try {
    const authObj = useAuth();
    isSignedIn = Boolean(authObj.isSignedIn);
    isClerkAvailable = true;
  } catch (err) {
    // Unwrapped or inactive Clerk context guard
  }

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navLinks = [
    { name: "Student Workspace", href: "/student" },
    { name: "How it works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
  ];

  return (
    <header
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`absolute top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isHovered || mobileMenuOpen
          ? "bg-[#F4F3EE]/85 dark:bg-[#080B12]/85 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
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
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white font-heading drop-shadow-xs">
              AI4Life
            </span>
            <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium tracking-wide drop-shadow-xs">
              AI that helps you learn, understand and improve.
            </span>
          </div>
        </Link>

        {/* Center: Minimal Navigation */}
        <nav className={`hidden md:flex items-center gap-1 p-1.5 rounded-2xl border transition-all duration-300 ${
          isHovered
            ? "bg-slate-200/80 dark:bg-slate-900/90 border-slate-300/60 dark:border-slate-800"
            : "bg-slate-900/5 dark:bg-white/5 border-slate-900/10 dark:border-white/10"
        }`}>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right: Actions (Sign In, Sign Up, Theme Toggle, User Controls) */}
        <div className="hidden md:flex items-center gap-3">
          
          {isMounted && isClerkAvailable && !isSignedIn && (
            <>
              {/* Sign In Button -> Opens Clerk Authentication Gateway Modal */}
              <SignInButton mode="modal" forceRedirectUrl="/student">
                <button
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 transition-all flex items-center gap-1.5 cursor-pointer"
                  type="button"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </SignInButton>

              {/* Sign Up Button -> Opens Clerk SignUp Authentication Gateway Modal */}
              <SignUpButton mode="modal" forceRedirectUrl="/student">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#3157D5] dark:bg-[#4F8CFF] hover:bg-[#2848b8] shadow-xs flex items-center gap-1.5 cursor-pointer"
                  type="button"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </motion.button>
              </SignUpButton>
            </>
          )}

          {isMounted && isClerkAvailable && isSignedIn && (
            <UserButton />
          )}

          {isMounted && !isClerkAvailable && (
            <>
              <Link
                href="/student"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/80 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/student"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#3157D5] dark:bg-[#4F8CFF] hover:bg-[#2848b8] shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </Link>
            </>
          )}

          {/* Light/Dark Theme Toggle */}
          <ThemeToggle />

          {/* Direct Workspace Access CTA */}
          <Link
            href="/student"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-200/80 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            <span>Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
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
                {isMounted && isClerkAvailable && !isSignedIn && (
                  <>
                    <SignInButton mode="modal" forceRedirectUrl="/student">
                      <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-base font-bold text-slate-900 dark:text-white border border-slate-300 dark:border-slate-800 cursor-pointer"
                        type="button"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Sign In</span>
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal" forceRedirectUrl="/student">
                      <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-base font-bold text-white bg-[#3157D5] dark:bg-[#4F8CFF] shadow-md cursor-pointer"
                        type="button"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Sign Up Free</span>
                      </button>
                    </SignUpButton>
                  </>
                )}

                {isMounted && isClerkAvailable && isSignedIn && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-bold text-slate-500">Account Profile:</span>
                    <UserButton />
                  </div>
                )}

                {isMounted && !isClerkAvailable && (
                  <Link
                    href="/student"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-base font-bold text-white bg-[#3157D5] dark:bg-[#4F8CFF] shadow-md cursor-pointer"
                  >
                    <span>Go to Student Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
