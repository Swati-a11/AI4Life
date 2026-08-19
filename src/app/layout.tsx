import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
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
  const pubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isKeyValid = Boolean(
    pubKey &&
    pubKey.startsWith("pk_") &&
    !pubKey.includes("your_clerk_pub_key") &&
    !pubKey.includes("vercel.app") &&
    pubKey.length > 25
  );

  return (
    <html 
      lang="en" 
      className={`${plusJakartaSans.variable} ${inter.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-[var(--bg-canvas)] text-[var(--fg-primary)] selection:bg-blue-500/30 selection:text-blue-200 transition-colors duration-300">
        {isKeyValid ? (
          <ClerkProvider publishableKey={pubKey}>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </ClerkProvider>
        ) : (
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        )}
      </body>
    </html>
  );
}
