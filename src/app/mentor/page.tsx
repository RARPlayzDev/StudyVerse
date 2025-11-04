// Version 1.0 Final Push
'use client';
import { useState } from 'react';
import PageTitle from '@/components/common/page-title';
import ChatInterface from '@/components/collab/chat-interface';
import { Card } from '@/components/ui/card';
import type { Message } from '@/lib/types';
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
    senderAvatar: 'https://picsum.photos/seed/ai-mentor/100/100',
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
    
    const handleSendMessage = async (text: string) => {
        const userMessage: Message = {
            id: `m${messages.length + 1}`,
            senderId: user!.uid,
            senderName: 'You',
            senderAvatar: user?.photoURL || 'https://picsum.photos/seed/user1/100/100',
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
                senderAvatar: 'https://picsum.photos/seed/ai-mentor/100/100',
                text: result.advice,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Failed to get AI advice:", error);
            const errorMessage: Message = {
                 id: `m${messages.length + 2}`,
                senderId: 'ai-mentor',
                senderName: 'AI Mentor',
                senderAvatar: 'https://picsum.photos/seed/ai-mentor/100/100',
                text: "I'm sorry, but I'm having trouble connecting right now. Please try again in a moment.",
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
                            Here are some ideas:
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            <PromptSuggestion 
                                text={`How can I study more effectively for my exams?`} 
                                onClick={() => handleSendMessage(`How can I study more effectively for my exams?`)}
                            />
                            <PromptSuggestion 
                                text={`Can you help me break down a complex topic?`} 
                                onClick={() => handleSendMessage(`Can you help me break down a complex topic?`)}
                            />
                            <PromptSuggestion 
                                text={`I'm feeling unmotivated. Can you give me a pep talk?`} 
                                onClick={() => handleSendMessage(`I'm feeling unmotivated. Can you give me a pep talk?`)}
                            />
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
