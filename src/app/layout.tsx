import type { Metadata } from "next";
import { Inter, Micro_5, Quantico, Rammetto_One } from "next/font/google";
import Footer from "@/components/Footer";
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

const title = "Nexus Net · ASEAN Quest";
const description =
  "Company onboarding, AI review of registration evidence, and cross-border growth for ASEAN startups.";

export const metadata: Metadata = {
  // Absolute OG/Twitter image URLs need a base; set NEXT_PUBLIC_SITE_URL in production.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title,
  description,
  openGraph: { title, description, siteName: "Nexus Net", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${micro5.variable} ${quantico.variable} ${rammetto.variable} h-full antialiased`}
    >
      <body className="bg-grid min-h-full flex flex-col font-sans pb-[calc(3.5rem+env(safe-area-inset-bottom))] sm:pb-0">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <TopNav />
        <main
          id="main"
          className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8"
        >
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
