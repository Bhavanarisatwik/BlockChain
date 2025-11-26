import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SupplyChain Provenance | Blockchain-Powered Traceability",
  description: "A tamper-evident supply chain provenance system powered by Ethereum. Track products, verify authenticity, and ensure transparency across the entire supply chain.",
  keywords: ["blockchain", "supply chain", "provenance", "ethereum", "traceability"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[var(--background)]`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
