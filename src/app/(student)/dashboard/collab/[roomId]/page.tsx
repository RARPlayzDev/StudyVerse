'use client';
import { notFound, useParams } from 'next/navigation';
import { useDoc, useFirestore, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';
import type { CollabRoom, Message } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ChatInterface from '@/components/collab/chat-interface';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Button } from '@/components/ui/button';
import { Phone, Video, Music2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToast } from '@/hooks/use-toast';

export default function CollabRoomPage() {
  const { roomId } = useParams();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const roomRef = useMemoFirebase(() => {
    if (!roomId) return null;
    return doc(firestore, 'collabRooms', roomId as string);
  }, [firestore, roomId]);

  const { data: room, isLoading: isRoomLoading } = useDoc<CollabRoom>(roomRef);

  const messagesQuery = useMemoFirebase(() => {
    if (!roomId) return null;
    return query(collection(firestore, `collabRooms/${roomId}/messages`), orderBy('timestamp', 'asc'));
  }, [firestore, roomId]);

  const { data: messages, isLoading: areMessagesLoading } = useCollection<Message>(messagesQuery);
  
  const memberProfiles = room?.members.map(id => ({ id, name: id.substring(0, 8) + '...', avatarUrl: `https://picsum.photos/seed/${id}/100/100` })) || [];

  if (isRoomLoading) {
    return <div className="flex items-center justify-center h-full"><p>Loading Room...</p></div>;
  }

  if (!room) {
    notFound();
  }
  
  const handleSendMessage = (text: string) => {
    if (!user || !roomId) return;
    
    const messagesColRef = collection(firestore, `collabRooms/${roomId}/messages`);
    const newMessage = {
        roomId: roomId as string,
        senderId: user.uid,
        senderName: user.displayName || user.email || 'Anonymous',
        senderAvatar: user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`,
        text: text,
        timestamp: serverTimestamp(),
    };

    addDoc(messagesColRef, newMessage).catch((err) => {
      const permissionError = new FirestorePermissionError({
        path: messagesColRef.path,
        operation: 'create',
        requestResourceData: newMessage,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const showComingSoonToast = (feature: string) => {
    toast({
        title: `${feature} Coming Soon!`,
        description: `Keep an eye out for ${feature.toLowerCase()} in a future update.`,
    });
  };

  return (
    <TooltipProvider>
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_300px] gap-6 flex-1 h-full overflow-hidden">
        
        {/* Members Sidebar */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 h-full flex flex-col">
            <CardHeader>
                <CardTitle>Members ({memberProfiles?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto flex-1">
               {memberProfiles?.map(member => (
                   <div key={member.id} className="flex items-center gap-3">
                       <Avatar className="h-8 w-8 relative">
                           <AvatarImage src={member.avatarUrl} data-ai-hint="person portrait"/>
                           <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                           <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card" />
                       </Avatar>
                       <span>{member.name}</span>
                   </div>
               ))}
            </CardContent>
        </Card>

        {/* Main Chat Panel */}
        <div className="lg:col-span-1 h-full">
            <Card className="flex-1 bg-card/50 backdrop-blur-sm border-border/50 h-full flex flex-col overflow-hidden">
                <CardHeader className="py-3 px-4 border-b border-border/50">
                    <CardTitle className="text-lg">{room.topic}</CardTitle>
                    <CardDescription>{room.description}</CardDescription>
                </CardHeader>
                <ChatInterface 
                    messages={messages || []}
                    onSendMessage={handleSendMessage}
                    isLoading={areMessagesLoading}
                />
            </Card>
        </div>

        {/* Right Controls Panel */}
        <div className="flex flex-col gap-6 h-full">
             <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                    <CardTitle>Room Controls</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" className="w-full" onClick={() => showComingSoonToast('Audio Call')}>
                                <Phone className="mr-2 h-4 w-4"/> Audio
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                           <p>Audio call rooms coming soon 🎧</p>
                        </TooltipContent>
                    </Tooltip>
                     <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" className="w-full" onClick={() => showComingSoonToast('Video Call')}>
                                <Video className="mr-2 h-4 w-4"/> Video
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Video call rooms coming soon 🎥</p>
                        </TooltipContent>
                    </Tooltip>
                </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Music2/> Group Music Player</CardTitle>
                </CardHeader>
                <CardContent className="aspect-video">
                    <iframe
                        className="w-full h-full rounded-md"
                        src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1&loop=1"
                        title="Lofi Music Player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                     <div className="flex justify-center gap-2 mt-2">
                        <p className="text-xs text-muted-foreground text-center">Spotify integration coming soon 🎵</p>
                     </div>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
    </TooltipProvider>
  );
}
