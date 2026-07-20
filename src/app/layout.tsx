import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AppHeader } from "@/components/layout/AppHeader";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

/** Mono is reserved for block heights, addresses, token amounts, and hashes. */
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuarryChain — DPoS Governance",
  description:
    "Delegated Proof of Stake governance, validator onboarding, and network telemetry for the QuarryChain testnet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-surface font-sans">
        <AppHeader />
        <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-8 p-6 lg:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
