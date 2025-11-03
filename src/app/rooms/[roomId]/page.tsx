
'use client';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp, query, orderBy, Timestamp, updateDoc, arrayRemove } from 'firebase/firestore';
import type { CollabRoom, Message } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ChatInterface from '@/components/collab/chat-interface';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Button } from '@/components/ui/button';
import { DoorOpen, Music2, User as UserIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';

export default function CollabRoomPage() {
  const { roomId } = useParams();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

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
  
  useEffect(() => {
    // Only perform the check once both the user and room data have finished loading.
    if (!isUserLoading && !isRoomLoading && room) {
        if (!user || !room.members.includes(user.uid)) {
            // If the user is not a member, redirect them.
            router.push('/dashboard/collab');
        }
    } else if (!isUserLoading && !isRoomLoading && !room) {
        // If the room doesn't exist after loading, it's a 404
        notFound();
    }
  }, [room, user, isRoomLoading, isUserLoading, router, notFound]);


  if (isUserLoading || isRoomLoading) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-slate-900 to-purple-950">
            <p className="text-white">Loading Room...</p>
        </div>
    )
  }
  
  // After loading, if user is not in the room (or no user), show a redirecting message while the useEffect kicks in.
  if (!user || !room?.members.includes(user.uid)) {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-slate-900 to-purple-950">
            <p className="text-white">Access Denied. Redirecting...</p>
        </div>
      );
  }
  
  const memberProfiles = room.members.map(id => ({ id, name: id.substring(0, 8) + '...', avatarUrl: `https://picsum.photos/seed/${id}/100/100` })) || [];

  const handleSendMessage = (text: string) => {
    if (!user || !roomId) return;
    
    const messagesColRef = collection(firestore, `collabRooms/${roomId}/messages`);
    const newMessage: Omit<Message, 'id'> = {
        senderId: user.uid,
        senderName: user.displayName || user.email || 'Anonymous',
        senderAvatar: user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`,
        text: text,
        timestamp: serverTimestamp() as Timestamp,
        roomId: roomId as string,
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
  
  const handleLeaveRoom = async () => {
    if (!user || !roomRef) return;
    await updateDoc(roomRef, {
        members: arrayRemove(user.uid)
    });
    router.push('/dashboard/collab');
  }

  return (
    <div className="min-h-screen w-full flex flex-col p-4 sm:p-6 bg-gradient-to-br from-gray-950 via-slate-900 to-purple-950">
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr_320px] gap-6">
            
            {/* Left Sidebar */}
            <div className="hidden lg:flex flex-col gap-6 h-full">
                 <Card className="bg-card/50 backdrop-blur-sm border-border/50 flex-1 flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><UserIcon className="h-5 w-5" /> Members ({memberProfiles?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 overflow-y-auto flex-1 p-6">
                       {isRoomLoading ? Array.from({length: 3}).map((_,i) => <Skeleton key={i} className="h-8 w-full" />) 
                       : memberProfiles?.map(member => (
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
            </div>

            {/* Main Chat Panel */}
            <Card className="flex-1 bg-card/50 backdrop-blur-sm border-border/50 h-full flex flex-col overflow-hidden">
                <CardHeader className="py-3 px-4 border-b border-border/50 flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">{room?.topic}</CardTitle>
                        <CardDescription>{room?.description}</CardDescription>
                    </div>
                     <Button variant="ghost" size="sm" onClick={handleLeaveRoom}>
                        <DoorOpen className="mr-2 h-4 w-4" />
                        Leave Room
                    </Button>
                </CardHeader>
                <ChatInterface 
                    messages={messages || []}
                    onSendMessage={handleSendMessage} 
                    isLoading={areMessagesLoading}
                />
            </Card>

            {/* Right Sidebar */}
            <div className="hidden lg:flex flex-col gap-6 h-full">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Music2/> Study Music</CardTitle>
                    </CardHeader>
                    <CardContent className="aspect-video">
                        <iframe
                            className="w-full h-full rounded-md"
                            src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=0&mute=0&loop=1&controls=1"
                            title="Lofi Music Player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        ></iframe>
                    </CardContent>
                </Card>
            </div>
          </main>
    </div>
  );
}
