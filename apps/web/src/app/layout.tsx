import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "../providers/QueryProvider";
import AuthProvider from "../providers/AuthProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CivicMind AI — AI-Powered Hyperlocal Community Problem Solver",
  description: "An autonomous community issues classifier, duplicate detector, priority planner, and resolution tracker built for smart municipalities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-[#2563eb] selection:text-white">
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
