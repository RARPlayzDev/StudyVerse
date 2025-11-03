
'use client';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useUser, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp, query, orderBy, Timestamp, deleteDoc, where } from 'firebase/firestore';
import type { CollabRoom, Message, User as UserType, CollabRoomMember } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ChatInterface from '@/components/collab/chat-interface';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Button } from '@/components/ui/button';
import { DoorOpen, Music2, User as UserIcon, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

function MemberList({ roomId }: { roomId: string }) {
    const firestore = useFirestore();

    // Query the members subcollection
    const membersQuery = useMemoFirebase(() => {
        return query(collection(firestore, `collabRooms/${roomId}/members`));
    }, [firestore, roomId]);

    const { data: members, isLoading: areMembersLoading } = useCollection<CollabRoomMember>(membersQuery);

    // Fetch user profiles for the members
    const memberIds = useMemo(() => members?.map(m => m.userId) || [], [members]);

    const usersQuery = useMemoFirebase(() => {
        if (memberIds.length === 0) return null;
        return query(collection(firestore, 'users'), where('id', 'in', memberIds.slice(0, 10)));
    }, [firestore, memberIds]);

    const { data: memberProfiles, isLoading: areProfilesLoading } = useCollection<UserType>(usersQuery);

    const isLoading = areMembersLoading || areProfilesLoading;

    return (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 flex-1 flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserIcon className="h-5 w-5" /> Members ({members?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto flex-1 p-6">
                {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                {!isLoading && memberProfiles?.map(member => (
                    <div key={member.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 relative">
                            <AvatarImage src={member.avatarUrl} data-ai-hint="person portrait" />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card" />
                        </Avatar>
                        <span>{member.name}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}


export default function CollabRoomPage() {
  const { roomId } = useParams();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isMember, setIsMember] = useState<boolean | null>(null);

  const roomRef = useMemoFirebase(() => {
    if (!roomId) return null;
    return doc(firestore, 'collabRooms', roomId as string);
  }, [firestore, roomId]);

  const { data: room, isLoading: isRoomLoading } = useDoc<CollabRoom>(roomRef);
  
  // Check for membership
  useEffect(() => {
    if (user && roomId) {
        const memberRef = doc(firestore, `collabRooms/${roomId}/members/${user.uid}`);
        const unsub = onSnapshot(doc, (doc) => {
            setIsMember(doc.exists());
        });
        return () => unsub();
    }
  }, [user, roomId, firestore]);


  const messagesQuery = useMemoFirebase(() => {
    if (!roomId) return null;
    return query(collection(firestore, `collabRooms/${roomId}/messages`), orderBy('timestamp', 'asc'));
  }, [firestore, roomId]);

  const { data: messages, isLoading: areMessagesLoading } = useCollection<Message>(messagesQuery);
  
  useEffect(() => {
    const isAuthCheckComplete = !isRoomLoading && !isUserLoading && isMember !== null;
    
    if (isAuthCheckComplete) {
      if (!room) {
        return notFound();
      }
      if (!user) {
        router.push('/login');
      } else if (!isMember) {
        toast({
          title: "Access Denied",
          description: "You are not a member of this room.",
          variant: "destructive",
        });
        router.push('/dashboard/collab');
      }
    }
  }, [room, user, isRoomLoading, isUserLoading, isMember, router, toast]);

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
  
  const handleLeaveOrDeleteRoom = async () => {
    if (!user || !roomRef || !room) return;
    
    // Creator deletes the room entirely
    if (user.uid === room.createdBy) {
      await deleteDoc(roomRef);
      toast({ title: 'Room Deleted', description: 'As the creator, you have deleted the room.' });
      router.push('/dashboard/collab');
    } else {
      // Member leaves the room by deleting their document in the members subcollection
      const memberRef = doc(firestore, `collabRooms/${room.id}/members/${user.uid}`);
      await deleteDoc(memberRef);
      toast({ title: 'You Left the Room' });
      router.push('/dashboard/collab');
    }
  }

  const handleCopyCode = () => {
    if (!room?.inviteCode) return;
    navigator.clipboard.writeText(room.inviteCode);
    toast({
      title: "Invite Code Copied!",
      description: "You can now share it with others.",
    });
  };
  
  const isLoading = isUserLoading || isRoomLoading || isMember === null;

  if (isLoading || !room || !user || !isMember) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-slate-900 to-purple-950">
            <p className="text-white">Loading Room...</p>
        </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex flex-col p-4 sm:p-6 bg-gradient-to-br from-gray-950 via-slate-900 to-purple-950">
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr_320px] gap-6">
            
            <div className="lg:flex flex-col gap-6 h-full">
                <MemberList roomId={roomId as string} />
            </div>

            <Card className="flex-1 bg-card/50 backdrop-blur-sm border-border/50 h-full flex flex-col overflow-hidden">
                <CardHeader className="py-3 px-4 border-b border-border/50 flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">{room?.topic}</CardTitle>
                        <CardDescription>{room?.description}</CardDescription>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopyCode}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Invite Code
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleLeaveOrDeleteRoom}>
                            <DoorOpen className="mr-2 h-4 w-4" />
                            {user.uid === room.createdBy ? 'Delete Room' : 'Leave Room'}
                        </Button>
                     </div>
                </CardHeader>
                <ChatInterface 
                    messages={messages || []}
                    onSendMessage={handleSendMessage} 
                    isLoading={areMessagesLoading}
                />
            </Card>

            <div className="flex flex-col gap-6 h-full">
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

    