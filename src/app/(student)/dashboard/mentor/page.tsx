// v1.1 - Bug Fixes and Updates
'use client';
import { useState } from 'react';
import PageTitle from '@/components/common/page-title';
import ChatInterface from '@/components/collab/chat-interface';
import { Card } from '@/components/ui/card';
import type { Message, Task } from '@/lib/types';
import { getStudyAdvice } from '@/ai/flows/study-mentor';
import { BrainCircuit, Sparkles } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const initialMessage: Message = {
    id: 'm0',
    senderId: 'ai-mentor',
    senderName: 'AI Mentor',
    senderAvatar: 'https://picsum.photos/seed/ai-abstract/100/100',
    text: "Hello! I'm your AI Study Mentor. How can I help you focus, plan, or learn smarter today?",
    timestamp: new Date(),
};

const PromptSuggestion = ({ text, onClick }: { text: string; onClick: () => void }) => (
  <Button
    variant="outline"
    size="sm"
    className="bg-background/70 h-auto whitespace-normal text-left"
    onClick={onClick}
  >
    <Sparkles className="mr-2 h-4 w-4 text-primary" />
    {text}
  </Button>
);

export default function MentorPage() {
    const [messages, setMessages] = useState<Message[]>([initialMessage]);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useUser();
    const firestore = useFirestore();

    // Fetch user's active tasks
    const tasksQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(
            collection(firestore, 'users', user.uid, 'tasks'),
            where('status', 'in', ['todo', 'inprogress'])
        );
    }, [firestore, user]);

    const { data: tasks, isLoading: tasksLoading } = useCollection<Task>(tasksQuery);

    const handleSendMessage = async (text: string) => {
        const userMessage: Message = {
            id: `m${messages.length + 1}`,
            senderId: user!.uid,
            senderName: 'You',
            senderAvatar: user?.photoURL || 'https://picsum.photos/seed/user-default/100/100',
            text,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const result = await getStudyAdvice({ query: text });
            const aiMessage: Message = {
                id: `m${messages.length + 2}`,
                senderId: 'ai-mentor',
                senderName: 'AI Mentor',
                senderAvatar: 'https://picsum.photos/seed/ai-abstract/100/100',
                text: result.advice,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error: any) {
            console.error("Failed to get AI advice:", error);
            const errorMessage: Message = {
                 id: `m${messages.length + 2}`,
                senderId: 'ai-mentor',
                senderName: 'AI Mentor',
                senderAvatar: 'https://picsum.photos/seed/ai-abstract/100/100',
                text: `I'm sorry, I encountered an issue. ${error.message || "Please try rephrasing your question or try again in a moment."}`,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const showSuggestions = messages.length === 1;

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <PageTitle title="AI Study Mentor" subtitle="Your personal guide to academic success." />
            
            {showSuggestions && (
                 <Card className="mb-4 bg-card/50 backdrop-blur-sm border-border/50">
                    <div className="p-4">
                        <h3 className="text-sm font-semibold mb-2 flex items-center">
                            <Sparkles className="w-4 h-4 mr-2 text-primary" />
                            Here are some ideas based on your planner:
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                             {tasksLoading && Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-10" />)}
                             {tasks?.slice(0, 3).map(task => (
                                <PromptSuggestion 
                                    key={task.id}
                                    text={`Help me create a study plan for my '${task.title}' task.`} 
                                    onClick={() => handleSendMessage(`Help me create a study plan for my '${task.title}' task.`)}
                                />
                             ))}
                             {!tasksLoading && tasks?.length === 0 && (
                                 <p className="text-xs text-muted-foreground col-span-full">No active tasks found in your planner to generate suggestions.</p>
                             )}
                        </div>
                    </div>
                </Card>
            )}

            <Card className="flex-1 bg-card/50 backdrop-blur-sm border-border/50 h-full flex flex-col overflow-hidden">
                <ChatInterface 
                    messages={messages} 
                    onSendMessage={handleSendMessage} 
                    isLoading={isLoading}
                />
            </Card>
        </div>
    );
}
