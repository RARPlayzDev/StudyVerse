'use client';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import PageTitle from '@/components/common/page-title';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Plus,
  Copy,
  Users,
  Music2,
  DoorOpen,
  ChevronLeft,
  Sparkles,
  Search,
  RefreshCw,
} from 'lucide-react';
import { useUser, useFirestore, useMemoFirebase, useDoc, useCollection } from '@/firebase';
import { collection, query, doc, deleteDoc, onSnapshot, addDoc, serverTimestamp, getDoc, orderBy, Timestamp, where, setDoc, Unsubscribe, getDocs } from 'firebase/firestore';
import type { CollabRoom, CollabRoomMember, Message, User as UserType } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ChatInterface from '@/components/collab/chat-interface';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import JoinCollabRoomDialog from '@/components/collab/join-collab-room-dialog';
import { Badge } from '@/components/ui/badge';
import LeaveRoomDialog from '@/components/collab/leave-room-dialog';

const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

function MemberList({ roomId }: { roomId: string }) {
    const firestore = useFirestore();

    const membersQuery = useMemoFirebase(() => {
        return query(collection(firestore, `collabRooms/${roomId}/members`));
    }, [firestore, roomId]);

    const { data: members, isLoading: areMembersLoading } = useCollection<CollabRoomMember>(membersQuery);
    
    const memberIds = useMemo(() => members?.map(m => m.userId) || [], [members]);

    const usersQuery = useMemoFirebase(() => {
        if (!firestore || memberIds.length === 0) return null;
        // Firestore 'in' queries are limited to 10 items. For a real app, pagination would be needed here.
        return query(collection(firestore, 'users'), where('id', 'in', memberIds.slice(0, 10)));
    }, [firestore, memberIds]);

    const { data: memberProfiles, isLoading: areProfilesLoading } = useCollection<UserType>(usersQuery);

    const isLoading = areMembersLoading || areProfilesLoading;

    return (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 flex-1 flex flex-col h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Members ({members?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto flex-1 p-6">
                {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                {!isLoading && memberProfiles?.map(member => (
                    <div key={member.id} className="flex items-center gap-3">
                        <div className="relative">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold">{member.name.charAt(0)}</div>
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card" />
                        </div>
                        <span>{member.name}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export default function CollabSpace() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [rooms, setRooms] = useState<CollabRoom[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<CollabRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [newRoomTopic, setNewRoomTopic] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [roomToLeave, setRoomToLeave] = useState<CollabRoom | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const messageListenerRef = useRef<Unsubscribe | null>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData } = useDoc<UserType>(userDocRef);

  const fetchUserRooms = useCallback(async () => {
    if (!user) return;
    setRoomsLoading(true);
    
    // Find all rooms where the user is a member
    const userRooms: CollabRoom[] = [];
    const roomsSnapshot = await getDocs(query(collection(firestore, 'collabRooms')));
    
    const membershipChecks = roomsSnapshot.docs.map(async (roomDoc) => {
        const memberRef = doc(firestore, `collabRooms/${roomDoc.id}/members/${user.uid}`);
        const memberSnap = await getDoc(memberRef);
        if (memberSnap.exists()) {
            userRooms.push({ id: roomDoc.id, ...roomDoc.data() } as CollabRoom);
        }
    });

    await Promise.all(membershipChecks);

    setRooms(userRooms);
    setRoomsLoading(false);
  }, [user, firestore]);

  // Fetch rooms user is a member of
  useEffect(() => {
    fetchUserRooms();
  }, [user, firestore, fetchUserRooms, refreshTrigger]);

  // Fetch messages for selected room
  useEffect(() => {
    // Clean up previous listener if it exists
    if (messageListenerRef.current) {
        messageListenerRef.current();
        messageListenerRef.current = null;
    }

    if (!selectedRoom?.id) {
      setMessages([]);
      return;
    }

    setMessagesLoading(true);
    const messagesQuery = query(collection(firestore, `collabRooms/${selectedRoom.id}/messages`), orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      setMessagesLoading(false);
    }, (error) => {
        console.error("Error fetching messages:", error);
        if (selectedRoom) {
            const permissionError = new FirestorePermissionError({
                path: `collabRooms/${selectedRoom.id}/messages`,
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
        }
        setMessagesLoading(false);
    });

    messageListenerRef.current = unsubscribe;

    // Cleanup function for when the component unmounts or selectedRoom changes
    return () => {
        if (messageListenerRef.current) {
            messageListenerRef.current();
        }
    };
  }, [selectedRoom, firestore]);
  
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !selectedRoom || !user || !userData) return;

    const newMessage: Omit<Message, 'id' | 'timestamp'> & { timestamp: any } = {
        senderId: user.uid,
        senderName: userData.name || user.displayName || 'Anonymous',
        senderAvatar: user.photoURL || '',
        text: text,
        timestamp: serverTimestamp(),
        roomId: selectedRoom.id,
    };
    const messagesColRef = collection(firestore, `collabRooms/${selectedRoom.id}/messages`);
    addDoc(messagesColRef, newMessage).catch((err) => {
        const permissionError = new FirestorePermissionError({
            path: messagesColRef.path,
            operation: 'create',
            requestResourceData: newMessage,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleConfirmLeave = async (room: CollabRoom) => {
    if (!user) return;
    
    // Stop listening for messages
    if (messageListenerRef.current) {
        messageListenerRef.current();
        messageListenerRef.current = null;
    }

    // Update UI immediately
    if (selectedRoom?.id === room.id) {
        setSelectedRoom(null);
    }
    
    // Manually filter out the room from the local state to ensure UI updates.
    setRooms(prevRooms => prevRooms.filter(r => r.id !== room.id));

    if (user.uid === room.createdBy) {
      // Creator deletes the entire room.
      const roomRef = doc(firestore, 'collabRooms', room.id);
      await deleteDoc(roomRef); 
      toast({ title: 'Room Deleted', description: 'As the creator, you have deleted the room.' });
    } else {
      // Member leaves the room.
      const memberRef = doc(firestore, `collabRooms/${room.id}/members/${user.uid}`);
      await deleteDoc(memberRef);
      toast({ title: 'You Left the Room' });
    }

    setShowLeaveDialog(false);
    setRoomToLeave(null);
  };

  const handleCopyCode = (code: string | undefined) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    toast({
      title: "Invite Code Copied!",
      description: "You can now share it with others.",
    });
  };

  const openLeaveDialog = (room: CollabRoom) => {
    setRoomToLeave(room);
    setShowLeaveDialog(true);
  }

  const filteredRooms = rooms.filter(room => 
    room.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRoomCreated = (newRoom: CollabRoom) => {
    setRooms(prev => [...prev, newRoom]);
    setSelectedRoom(newRoom);
    setShowCreateRoom(false);
    setNewRoomTopic('');
    setNewRoomDescription('');
  };

  const handleCreateRoom = async () => {
    if (!user || !userData) return;
    if (!newRoomTopic.trim() || !newRoomDescription.trim()) {
      toast({ title: "Please fill out all fields.", variant: "destructive" });
      return;
    }
    setIsCreatingRoom(true);

    try {
        const newRoomData = {
            topic: newRoomTopic,
            description: newRoomDescription,
            type: 'private' as const,
            createdBy: user.uid,
            inviteCode: generateInviteCode(),
            createdAt: serverTimestamp(),
        };
        const roomDocRef = await addDoc(collection(firestore, 'collabRooms'), newRoomData);
        
        const memberRef = doc(firestore, 'collabRooms', roomDocRef.id, 'members', user.uid);
        await setDoc(memberRef, { userId: user.uid, joinedAt: serverTimestamp() });
        
        toast({ title: "Room created successfully!", description: `Invite code: ${newRoomData.inviteCode}`});
        const createdRoom = { id: roomDocRef.id, ...newRoomData, createdAt: new Date() } as CollabRoom;
        
        handleRoomCreated(createdRoom);

    } catch (error) {
        console.error(error);
        toast({ title: "Failed to create room.", variant: "destructive" });
    } finally {
        setIsCreatingRoom(false);
    }
  };


  return (
    <div className="flex h-[calc(100vh-8rem)] bg-gradient-to-br from-slate-900 to-purple-950 -m-4 sm:-m-6">
      <div className="flex-1 flex overflow-hidden">
        {/* Rooms List */}
        <div className="w-80 border-r border-purple-500/20 glass-card p-6 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-white">Study Rooms</h2>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button size="icon" className="bg-primary hover:bg-primary/90">
                  <Plus size={20} className="text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setShowCreateRoom(true)}>
                  Create Room
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowJoinRoom(true)}>
                  Join Room
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className='mb-4'>
            <Badge variant="secondary">{rooms.length} rooms joined</Badge>
          </div>
          <div className="mb-4 flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search rooms..." 
                className="pl-8 bg-background/50 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setRefreshTrigger(t => t + 1)}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>


          {showCreateRoom && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-8 rounded-lg max-w-md w-full"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Create Study Room</h2>
                <Input
                  type="text"
                  value={newRoomTopic}
                  onChange={(e) => setNewRoomTopic(e.target.value)}
                  placeholder="Enter room topic"
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-white mb-4"
                />
                 <Textarea
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  placeholder="Enter room description"
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-white mb-4"
                />
                <div className="flex gap-3">
                  <Button onClick={handleCreateRoom} disabled={isCreatingRoom} className="flex-1">
                    {isCreatingRoom ? "Creating..." : "Create"}
                  </Button>
                  <Button onClick={() => setShowCreateRoom(false)} variant="secondary" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}

          <JoinCollabRoomDialog open={showJoinRoom} onOpenChange={setShowJoinRoom} onRoomJoined={() => setRefreshTrigger(t => t + 1)} />
          {roomToLeave && (
            <LeaveRoomDialog 
                open={showLeaveDialog}
                onOpenChange={setShowLeaveDialog}
                roomName={roomToLeave.topic}
                isCreator={user?.uid === roomToLeave.createdBy}
                onConfirm={() => handleConfirmLeave(roomToLeave)}
            />
          )}

          <div className="space-y-3 overflow-y-auto flex-1">
            {roomsLoading && <p className="text-muted-foreground">Loading rooms...</p>}
            {filteredRooms.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedRoom(room)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedRoom?.id === room.id
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center">
                    <Users size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{room.topic}</h3>
                    <p className="text-xs text-gray-400">{room.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            {!roomsLoading && filteredRooms.length === 0 && <p className="text-muted-foreground text-sm p-4 text-center">
              {searchQuery ? 'No rooms match your search.' : "You haven't joined any rooms yet."}
            </p>}
          </div>
            <div className="mt-auto pt-4">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 text-center">
                    <CardContent className="p-3">
                        <p className="text-xs text-muted-foreground">More features coming soon!</p>
                    </CardContent>
                </Card>
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col p-6">
          {selectedRoom ? (
            <>
              <div className="mb-6 flex justify-between items-start">
                  <div className="flex items-center gap-2">
                     <Button variant="ghost" size="icon" onClick={() => setSelectedRoom(null)} className="h-9 w-9">
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold text-white">{selectedRoom.topic}</h2>
                        <p className="text-gray-400">{selectedRoom.description}</p>
                    </div>
                  </div>
                   <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleCopyCode(selectedRoom.inviteCode)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Invite Code
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => openLeaveDialog(selectedRoom)}>
                            <DoorOpen className="mr-2 h-4 w-4" />
                            {user?.uid === selectedRoom.createdBy ? 'Delete Room' : 'Leave Room'}
                        </Button>
                     </div>
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 overflow-hidden">
                <Card className="flex-1 bg-card/50 backdrop-blur-sm border-border/50 h-full flex flex-col overflow-hidden">
                    <ChatInterface 
                        messages={messages || []}
                        onSendMessage={handleSendMessage} 
                        isLoading={messagesLoading}
                    />
                </Card>

                <div className="hidden md:flex flex-col gap-6 h-full">
                    <MemberList roomId={selectedRoom.id} />
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
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Users size={64} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Select a room to start chatting</p>
                <p className="text-gray-500">or create a new one to get started.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
