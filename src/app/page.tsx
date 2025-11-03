import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BrainCircuit, Focus, Kanban, NotebookText, Users, ArrowRight, UserPlus, FileSignature, Goal } from "lucide-react";
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

const howItWorksSteps = [
    {
        icon: <UserPlus className="w-8 h-8 text-primary" />,
        title: "1. Create Your Account",
        description: "Sign up in seconds and create your personalized study profile to get started.",
    },
    {
        icon: <FileSignature className="w-8 h-8 text-primary" />,
        title: "2. Organize Your Tasks",
        description: "Use the smart planner to add your subjects, assignments, and deadlines.",
    },
    {
        icon: <Goal className="w-8 h-8 text-primary" />,
        title: "3. Start Achieving",
        description: "Leverage all the tools, from focus timers to AI summaries, to conquer your goals.",
    }
];

const testimonials = [
    {
        quote: "StudyVerse has completely changed how I approach my classes. The Focus Mode is a game-changer for my productivity!",
        name: "Jashwanth Reddy",
        role: "Computer Science Student",
        avatar: "https://picsum.photos/seed/testimonial1/100/100"
    },
    {
        quote: "Being able to collaborate with my classmates in real-time study rooms has been invaluable, especially for tough subjects like calculus.",
        name: "Aasrith",
        role: "Engineering Student",
        avatar: "https://picsum.photos/seed/testimonial2/100/100"
    },
    {
        quote: "The AI Mentor helps me break down complex topics and create study plans that actually work. It's like having a personal tutor 24/7.",
        name: "Krishna",
        role: "Pre-Med Student",
        avatar: "https://picsum.photos/seed/testimonial3/100/100"
    }
]


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

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="flex items-center justify-center pt-32 pb-20">
            <div className="container mx-auto text-center px-4">
            <div className="relative inline-block">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10"></div>
                <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400 mb-4 tracking-tight">
                Welcome to StudyVerse
                </h1>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12">
                Your All-in-One Studyverse. A futuristic, glassmorphic productivity platform to focus, plan, collaborate, and learn smarter.
            </p>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
            <div className="container mx-auto px-4">
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
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-slate-900/40">
            <div className="container mx-auto text-center px-4">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Started in Minutes</h2>
                <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">Follow these simple steps to supercharge your studies and unlock your full potential.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {howItWorksSteps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 border-2 border-primary/50 mb-4">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                            <p className="text-muted-foreground">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20">
            <div className="container mx-auto text-center px-4">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Students Everywhere</h2>
                <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">Don't just take our word for it. Here's what fellow students are saying about StudyVerse.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 text-left">
                            <CardContent className="p-6 flex flex-col h-full">
                                <p className="text-muted-foreground flex-grow">"{testimonial.quote}"</p>
                                <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-700/50">
                                    <Avatar>
                                        <AvatarImage src={testimonial.avatar} data-ai-hint="person portrait" />
                                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{testimonial.name}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto rounded-lg bg-gradient-to-r from-primary to-accent p-8 md:p-12 text-center shadow-2xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Ready to Transform Your Study Habits?</h2>
                    <p className="text-lg text-primary-foreground/80 mb-8">Join thousands of students who are learning smarter, not harder. Sign up for free and unlock your academic potential today.</p>
                    <Button size="lg" variant="secondary" asChild className="text-lg font-semibold">
                        <Link href="/signup">
                            Sign Up Now <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>

      </main>

      <footer className="py-6">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} StudyVerse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
