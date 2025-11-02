'use client';
import { notFound, useParams } from 'next/navigation';
import { useDoc, useFirestore, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp, query, orderBy, where } from 'firebase/firestore';
import type { CollabRoom, Message, User as UserType } from '@/lib/types';
import PageTitle from '@/components/common/page-title';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ChatInterface from '@/components/collab/chat-interface';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useCollection as useUsersData } from '@/firebase/firestore/use-collection';

export default function CollabRoomPage() {
  const { roomId } = useParams();
  const { user } = useUser();
  const firestore = useFirestore();

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
  
  // This is not efficient, but for a small number of members it is fine.
  // In a production app, you'd fetch user profiles more efficiently, maybe with a separate hook for each user.
  // The previous query was invalid. For now, we'll just display member IDs.
  // A more robust solution would be needed for a real application.
  const memberProfiles = room?.members.map(id => ({ id, name: id.substring(0, 8) + '...', avatarUrl: '' })) || [];


  if (isRoomLoading) {
    return <div>Loading room...</div>;
  }

  if (!room) {
    // This will show a 404 page if the room doesn't exist or user doesn't have access
    notFound();
  }
  
  const handleSendMessage = (text: string) => {
    if (!user || !roomId) return;
    
    const messagesColRef = collection(firestore, `collabRooms/${roomId}/messages`);
    const newMessage: Omit<Message, 'id' | 'timestamp'> = {
        roomId: roomId as string,
        senderId: user.uid,
        senderName: user.displayName || user.email || 'Anonymous',
        senderAvatar: user.photoURL || undefined,
        text: text,
    };

    // The 'timestamp' is added on the server
    addDoc(messagesColRef, { ...newMessage, timestamp: serverTimestamp() }).catch((err) => {
      const permissionError = new FirestorePermissionError({
        path: messagesColRef.path,
        operation: 'create',
        requestResourceData: newMessage,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <PageTitle title={room.topic} subtitle={room.description} />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 h-full overflow-hidden">
        
        <div className="lg:col-span-3 h-full">
            <Card className="flex-1 bg-card/50 backdrop-blur-sm border-border/50 h-full flex flex-col overflow-hidden">
                <ChatInterface 
                    messages={messages || []}
                    onSendMessage={handleSendMessage}
                    isLoading={areMessagesLoading}
                />
            </Card>
        </div>

        <div className="flex flex-col gap-6 h-full">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                    <CardTitle>Members ({memberProfiles?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-48 overflow-y-auto">
                   {memberProfiles?.map(member => (
                       <div key={member.id} className="flex items-center gap-3">
                           <Avatar className="h-8 w-8">
                               <AvatarImage src={member.avatarUrl} data-ai-hint="person portrait"/>
                               <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                           </Avatar>
                           <span>{member.name}</span>
                       </div>
                   ))}
                </CardContent>
            </Card>

             <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                    <CardTitle>Focus Music</CardTitle>
                </CardHeader>
                <CardContent className="aspect-video">
                    <iframe
                    className="w-full h-full rounded-md"
                    src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1&loop=1"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    ></iframe>
                </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50 flex flex-col items-center justify-center text-center p-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-500"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                    Spotify Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Coming soon!</p>
              </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}
