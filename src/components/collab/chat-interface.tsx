'use client';
import { Message } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Send } from 'lucide-react';
import { FormEvent, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useUser as useAuthUser } from '@/firebase';
import { formatDistanceToNow } from 'date-fns';

type ChatInterfaceProps = {
    messages: Message[];
    onSendMessage: (message: string) => void;
    isLoading?: boolean;
};

export default function ChatInterface({ messages, onSendMessage, isLoading }: ChatInterfaceProps) {
    const { user: currentUser } = useAuthUser();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const handleSendMessage = (e: FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const input = form.querySelector('input[name="message"]') as HTMLInputElement;
        const message = input.value;
        if (message.trim()) {
            onSendMessage(message.trim());
            input.value = '';
        }
    }
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const getFormattedTimestamp = (timestamp: any) => {
        if (!timestamp) return 'sending...';
        // Firestore Timestamps have a toDate() method, JS Dates do not.
        if (typeof timestamp.toDate === 'function') {
            return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
        }
        // It's likely a JS Date object.
        if (timestamp instanceof Date) {
            return formatDistanceToNow(timestamp, { addSuffix: true });
        }
        return 'just now';
    }

    return (
        <div className="flex flex-col h-full">
            <div ref={scrollAreaRef} className="flex-grow overflow-y-auto p-4 space-y-6">
                {messages.map((message) => (
                    <div key={message.id} className={cn("flex items-start gap-3", message.senderId === currentUser?.uid ? 'justify-end' : 'justify-start')}>
                        {message.senderId !== currentUser?.uid && (
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={message.senderAvatar} data-ai-hint="abstract geometric" />
                                <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        )}
                        <div className={cn("grid gap-1 max-w-[75%]", message.senderId === currentUser?.uid ? 'items-end' : 'items-start')}>
                            <div className="font-semibold text-sm">{message.senderId === currentUser?.uid ? 'You' : message.senderName}</div>
                            <div className={cn("p-3 rounded-lg", message.senderId === currentUser?.uid ? 'bg-primary text-primary-foreground' : 'bg-card/80')}>
                                <p className="text-sm">{message.text}</p>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {getFormattedTimestamp(message.timestamp)}
                            </div>
                        </div>
                         {message.senderId === currentUser?.uid && (
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={currentUser.photoURL || undefined} data-ai-hint="person portrait" />
                                <AvatarFallback>{currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                         <Avatar className="h-8 w-8">
                            <AvatarImage src="https://picsum.photos/seed/ai-mentor/100/100" alt="AI Mentor" data-ai-hint="abstract geometric"/>
                            <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1">
                            <div className="font-semibold text-sm">AI Mentor</div>
                            <div className="p-3 rounded-lg bg-card/80">
                                <p className="text-sm text-foreground animate-pulse">...</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 border-t border-border/50 bg-background/50">
                 <form className="relative" onSubmit={handleSendMessage}>
                    <Input
                        name="message"
                        placeholder={"Type your message..."}
                        className="pr-12 bg-background/50"
                        autoComplete="off"
                        disabled={isLoading}
                    />
                    <Button type="submit" size="icon" className="absolute top-1/2 right-2 -translate-y-1/2 h-8 w-8" disabled={isLoading}>
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}
