import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SavedInsightsProvider } from "@/lib/context/SavedInsightsContext";
import LayoutShell from "@/components/navigation/LayoutShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SalesVista - Executive Sales Analytics & AI Dashboard",
  description: "Executive sales analytics, AI query pipeline, and custom insights canvas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#F8F9FA",
          fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif",
          color: "#111827",
          minHeight: "100vh",
        }}
      >
        <SavedInsightsProvider>
          <LayoutShell>{children}</LayoutShell>
        </SavedInsightsProvider>
      </body>
    </html>
  );
}
