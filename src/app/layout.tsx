import type { Metadata } from "next";
import {
  Montserrat,
  Lora,
  Hind_Madurai,
  Electrolize,
  Rationale,
  Pridi
} from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const hindMadurai = Hind_Madurai({
  subsets: ["latin"],
  variable: "--font-hind-madurai",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const electrolize = Electrolize({
  subsets: ["latin"],
  variable: "--font-electrolize",
  weight: ["400"],
  display: "swap",
});

const rationale = Rationale({
  subsets: ["latin"],
  variable: "--font-rationale",
  weight: ["400"],
  display: "swap",
});

const pridi = Pridi({
  subsets: ["latin"],
  variable: "--font-pridi",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI4Life — One AI Core. Three Ways to Live.",
  description: "AI4Life is an AI workspace platform with three focused spaces: Student, Professional, and Household.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      className={`${montserrat.variable} ${lora.variable} ${hindMadurai.variable} ${electrolize.variable} ${rationale.variable} ${pridi.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--bg-canvas)] text-[var(--fg-primary)] selection:bg-blue-500/30 selection:text-blue-200 transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

