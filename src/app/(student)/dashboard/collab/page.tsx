'use client';
import { useState } from 'react';
import PageTitle from "@/components/common/page-title";
import ChatInterface from "@/components/common/chat-interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { placeholderRooms } from "@/lib/placeholder-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Hash, PlusCircle, Users } from "lucide-react";
import { CollabRoom, Message } from "@/lib/types";
import { cn } from '@/lib/utils';

export default function CollabPage() {
    const [selectedRoom, setSelectedRoom] = useState<CollabRoom>(placeholderRooms[0]);
    const [messages, setMessages] = useState<Message[]>(selectedRoom.messages);

    const handleSendMessage = (text: string) => {
        const newMessage: Message = {
            id: `m${messages.length + 1}`,
            sender: "Alex Johnson", // This would come from auth user
            senderAvatar: "https://picsum.photos/seed/user1/100/100",
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([...messages, newMessage]);
    };

    return (
        <div className="h-[calc(100vh-8rem)]">
            <PageTitle title="Collaboration Space" subtitle="Join study rooms and learn together." />
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                <Card className="lg:col-span-1 bg-card/50 backdrop-blur-sm border-border/50 h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Study Rooms</CardTitle>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <PlusCircle className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-2 flex-1 overflow-y-auto">
                        <div className="space-y-1">
                            {placeholderRooms.map(room => (
                                <button
                                    key={room.id}
                                    onClick={() => {
                                        setSelectedRoom(room);
                                        setMessages(room.messages);
                                    }}
                                    className={cn(
                                        "w-full text-left flex items-center gap-3 p-2 rounded-md transition-colors",
                                        selectedRoom.id === room.id ? "bg-accent text-accent-foreground" : "hover:bg-muted/50"
                                    )}
                                >
                                    <Hash className="h-5 w-5 text-muted-foreground" />
                                    <div className="flex-1 truncate">
                                        <p className="font-medium text-sm">{room.topic}</p>
                                        <p className="text-xs text-muted-foreground">{room.memberCount} members</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 bg-card/50 backdrop-blur-sm border-border/50 h-full flex flex-col">
                    <CardHeader className="border-b border-border/50">
                        <div className="flex items-center gap-2">
                             <Hash className="h-5 w-5" />
                             <h2 className="font-semibold text-lg">{selectedRoom.topic}</h2>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{selectedRoom.memberCount} Members</span>
                        </div>
                    </CardHeader>
                    <div className="flex-1 overflow-y-hidden">
                       <ChatInterface messages={messages} onSendMessage={handleSendMessage} chatType="collab" />
                    </div>
                </Card>
            </div>
        </div>
    );
}
