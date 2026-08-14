"use client";

import { Navbar } from "@/components/Navbar";
import { HeroWorkspaces } from "@/components/HeroWorkspaces";
import { HowItWorksSimple } from "@/components/HowItWorksSimple";
import { PricingSimple } from "@/components/PricingSimple";
import { GetStartedFinal } from "@/components/GetStartedFinal";
import { FooterSimple } from "@/components/FooterSimple";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-canvas)] text-[var(--fg-primary)] transition-colors duration-300">
      {/* Minimal Sticky Navbar with Working ThemeToggle */}
      <Navbar />

      {/* Main 4 Sections */}
      <main className="flex-1">
        {/* Section 1: Hero + Three Workspaces (Student, Professional, Household) */}
        <HeroWorkspaces />

        {/* Section 2: How It Works (Simple 3 steps) */}
        <HowItWorksSimple />

        {/* Section 3: Pricing (4 minimal plans + credit meter) */}
        <PricingSimple />

        {/* Section 4: Get Started (Convergence visual + final CTA) */}
        <GetStartedFinal />
      </main>

      {/* Minimal Footer */}
      <FooterSimple />
    </div>
  );
}
