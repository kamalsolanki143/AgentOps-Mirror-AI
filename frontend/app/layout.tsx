import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AgentOps Mirror AI — AI Agent Reliability & Testing Platform",
    template: "%s | AgentOps Mirror AI",
  },
  description:
    "Autonomous AI agent stress testing. Generate adversarial personas, run parallel conversations, score reliability & security — all in real time.",
  keywords: [
    "AI agent testing",
    "LLM reliability",
    "hallucination detection",
    "prompt injection testing",
    "conversational AI",
  ],
  authors: [{ name: "AgentOps Mirror AI" }],
  openGraph: {
    title: "AgentOps Mirror AI",
    description: "AI Agent Reliability & Testing Platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans bg-bg-base text-ink antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
