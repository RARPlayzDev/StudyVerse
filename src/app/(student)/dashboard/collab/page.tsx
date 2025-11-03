'use client';
import { useState } from 'react';
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
  PlusCircle,
  Users,
  Info,
  LogIn,
  ArrowRight,
} from 'lucide-react';
import CreateCollabRoomDialog from '@/components/collab/create-collab-room-dialog';
import JoinCollabRoomDialog from '@/components/collab/join-collab-room-dialog';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { CollabRoom } from '@/lib/types';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CollabPage() {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isJoinOpen, setJoinOpen] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();

  const privateRoomsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'collabRooms'),
      where('type', '==', 'private'),
      where('members', 'array-contains', user.uid)
    );
  }, [firestore, user]);

  const { data: privateRooms, isLoading } = useCollection<CollabRoom>(privateRoomsQuery);

  return (
    <div>
      <PageTitle
        title="Collaboration Space"
        subtitle="Join or create private study rooms to focus and collaborate together."
      />
      
      <Tabs defaultValue="private">
        <TabsList className="mb-4">
            <TabsTrigger value="private">Private Rooms</TabsTrigger>
            <TabsTrigger value="public" disabled>Public Rooms</TabsTrigger>
        </TabsList>
        <TabsContent value="private">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                     <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PlusCircle className="text-accent"/>
                                Create a Study Room
                            </CardTitle>
                             <CardDescription>
                                Start a new private session for you and your friends.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => setCreateOpen(true)}>Create Room</Button>
                        </CardContent>
                    </Card>
                     <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LogIn className="text-accent"/>
                                Join a Study Room
                            </CardTitle>
                             <CardDescription>
                                Enter an invite code to join an existing private room.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="secondary" onClick={() => setJoinOpen(true)}>Join with Code</Button>
                        </CardContent>
                    </Card>
                </div>
                 <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Your Rooms</h3>
                    {isLoading && (
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                            <CardContent className="p-10 text-center text-muted-foreground">
                                <p>Loading your groups...</p>
                            </CardContent>
                        </Card>
                    )}
                    {!isLoading && privateRooms && privateRooms.length > 0 ? (
                        privateRooms.map((room) => (
                            <Card key={room.id} className="bg-card/50 backdrop-blur-sm border-border/50">
                                <CardHeader>
                                <CardTitle>{room.topic}</CardTitle>
                                <CardDescription>
                                    {room.description} | {room.members.length} members
                                </CardDescription>
                                </CardHeader>
                                <CardContent>
                                <Button asChild>
                                    <Link href={`/rooms/${room.id}`}>
                                        Enter Room <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                    !isLoading && (
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                        <CardContent className="p-10 text-center text-muted-foreground">
                        <p>You haven't joined or created any private groups yet.</p>
                        </CardContent>
                    </Card>
                    )
                    )}
                 </div>
            </div>
        </TabsContent>
        <TabsContent value="public">
             <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                <Info className="w-8 h-8" />
                <p>
                    Public study rooms are coming soon! 🔜
                </p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>


      <CreateCollabRoomDialog open={isCreateOpen} onOpenChange={setCreateOpen} />
      <JoinCollabRoomDialog open={isJoinOpen} onOpenChange={setJoinOpen} />
    </div>
  );
}
