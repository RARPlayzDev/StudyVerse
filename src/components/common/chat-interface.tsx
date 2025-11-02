'use client';
import { placeholderRooms } from "@/lib/placeholder-data";
import { Message } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { CornerDownLeft, Mic, Paperclip, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormEvent } from "react";

type ChatInterfaceProps = {
    messages: Message[];
    onSendMessage: (message: string) => void;
    isLoading?: boolean;
    chatType: 'collab' | 'mentor';
};

export default function ChatInterface({ messages, onSendMessage, isLoading, chatType }: ChatInterfaceProps) {
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

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto p-4 space-y-6">
                {messages.map((message, index) => (
                    <div key={index} className={cn("flex items-start gap-4", message.sender === 'AI Mentor' ? 'justify-start' : 'justify-start')}>
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={message.senderAvatar} data-ai-hint="abstract geometric" />
                            <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1 max-w-[75%]">
                            <div className="font-semibold text-sm">{message.sender}</div>
                            <div className="p-3 rounded-lg bg-card/80">
                                <p className="text-sm text-foreground">{message.text}</p>
                            </div>
                            <div className="text-xs text-muted-foreground">{message.timestamp}</div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-4">
                         <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg" alt="AI Mentor" />
                            <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                        <div className="p-3 rounded-lg bg-card/80">
                            <p className="text-sm text-foreground animate-pulse">...</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 border-t border-border/50 bg-background/50">
                 <form className="relative" onSubmit={handleSendMessage}>
                    <Input
                        name="message"
                        placeholder={chatType === 'mentor' ? "Ask your AI mentor for advice..." : "Type your message..."}
                        className="pr-16 bg-background/50"
                        autoComplete="off"
                    />
                    <Button type="submit" size="icon" className="absolute top-1/2 right-2 -translate-y-1/2 h-8 w-8">
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}
