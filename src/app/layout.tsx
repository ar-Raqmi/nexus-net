import type { Metadata } from "next";
import { Inter, Micro_5, Quantico, Rammetto_One } from "next/font/google";
import TopNav from "@/components/TopNav";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const micro5 = Micro_5({
  variable: "--font-micro5",
  weight: "400",
  subsets: ["latin"],
});

const quantico = Quantico({
  variable: "--font-quantico",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const rammetto = Rammetto_One({
  variable: "--font-rammetto",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexus Net · ASEAN Quest",
  description:
    "Company onboarding, AI review of registration evidence, and cross-border growth for ASEAN startups.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${micro5.variable} ${quantico.variable} ${rammetto.variable} h-full antialiased`}
    >
      <body className="bg-grid min-h-full flex flex-col font-sans">
        <TopNav />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
