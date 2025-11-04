
// v1.1 - Bug Fixes and Updates
import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase";
import { FirebaseErrorListener } from "@/components/FirebaseErrorListener";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "StudyVerse - Your All-in-One Studyverse",
  description: "A futuristic, glassmorphic productivity platform for students to focus, plan, collaborate, and learn smarter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22hsl(222,89%,9%)%22/><path fill=%22hsl(217,91%,60%)%22 d=%22M45,20 C35,20 30,30 30,35 C30,40 35,45 40,45 C40,55 30,55 30,65 C30,75 40,80 50,80 M40,45 C50,45 50,35 60,35 M50,80 L70,80 L70,60 L50,60 M70,70 L80,70 M60,35 L80,35 L80,25 M60,35 L60,20%22 stroke=%22hsl(217,91%,60%)%22 stroke-width=%225%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 fill=%22none%22/></svg>" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} font-body antialiased bg-background min-h-screen`} suppressHydrationWarning>
          <FirebaseClientProvider>
            <FirebaseErrorListener />
            {children}
          </FirebaseClientProvider>
          <Toaster />
      </body>
    </html>
  );
}
