'use client';
import { useState } from 'react';
import PageTitle from '@/components/common/page-title';
import ChatInterface from '@/components/common/chat-interface';
import { Card } from '@/components/ui/card';
import { Message } from '@/lib/types';
import { getStudyAdvice } from '@/ai/flows/study-mentor';
import { BrainCircuit } from 'lucide-react';

const initialMessage: Message = {
    id: 'm0',
    sender: 'AI Mentor',
    senderAvatar: 'https://picsum.photos/seed/ai-mentor/100/100',
    text: "Hello! I'm your AI Study Mentor. How can I help you focus, plan, or learn smarter today?",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export default function MentorPage() {
    const [messages, setMessages] = useState<Message[]>([initialMessage]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async (text: string) => {
        const userMessage: Message = {
            id: `m${messages.length + 1}`,
            sender: 'You',
            senderAvatar: 'https://picsum.photos/seed/user1/100/100',
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const result = await getStudyAdvice({ query: text });
            const aiMessage: Message = {
                id: `m${messages.length + 2}`,
                sender: 'AI Mentor',
                senderAvatar: 'https://picsum.photos/seed/ai-mentor/100/100',
                text: result.advice,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Failed to get AI advice:", error);
            const errorMessage: Message = {
                 id: `m${messages.length + 2}`,
                sender: 'AI Mentor',
                senderAvatar: 'https://picsum.photos/seed/ai-mentor/100/100',
                text: "I'm sorry, but I'm having trouble connecting right now. Please try again in a moment.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <PageTitle title="AI Study Mentor" subtitle="Your personal guide to academic success." />
            <Card className="flex-1 bg-card/50 backdrop-blur-sm border-border/50 h-full flex flex-col overflow-hidden">
                <ChatInterface 
                    messages={messages} 
                    onSendMessage={handleSendMessage} 
                    isLoading={isLoading}
                    chatType="mentor"
                />
            </Card>
        </div>
    );
}
