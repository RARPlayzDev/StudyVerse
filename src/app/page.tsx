import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BrainCircuit, Focus, Kanban, NotebookText, Users } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/common/logo";

const features = [
  {
    icon: <Focus className="w-8 h-8 text-accent" />,
    title: "Focus Mode",
    description: "Immerse yourself with lofi beats and a Pomodoro timer to maximize productivity.",
  },
  {
    icon: <Kanban className="w-8 h-8 text-accent" />,
    title: "Smart Planner",
    description: "Organize your academic life with an intuitive Kanban-style study planner.",
  },
  {
    icon: <NotebookText className="w-8 h-8 text-accent" />,
    title: "Notes Hub",
    description: "Upload, share, and get AI-powered summaries for your notes and PDFs.",
  },
  {
    icon: <Users className="w-8 h-8 text-accent" />,
    title: "Collab Space",
    description: "Create real-time study rooms to collaborate with peers from anywhere.",
  },
  {
    icon: <BrainCircuit className="w-8 h-8 text-accent" />,
    title: "AI Mentor",
    description: "Get personalized study advice and motivation from your AI-powered mentor.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="absolute top-0 left-0 right-0 p-4 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <Logo />
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <div className="container mx-auto text-center px-4 py-24">
          <div className="relative inline-block">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10"></div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 mb-4 tracking-tight">
              Welcome to StudyVerse
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Your All-in-One Studyverse. A futuristic, glassmorphic productivity platform to focus, plan, collaborate, and learn smarter.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 text-left hover:border-accent/50 transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {feature.icon}
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
             <Card className="md:col-span-2 lg:col-span-1 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 text-left hover:border-accent/50 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-center items-center">
                <CardContent className="p-6 text-center">
                   <h3 className="text-lg font-semibold text-foreground mb-2">And so much more...</h3>
                   <p className="text-muted-foreground text-sm mb-4">Ready to revolutionize your study habits?</p>
                   <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                      <Link href="/signup">Join The StudyVerse</Link>
                   </Button>
                </CardContent>
              </Card>
          </div>
        </div>
      </main>

      <footer className="py-6">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} StudyVerse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
