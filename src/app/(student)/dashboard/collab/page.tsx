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
        subtitle="Join public rooms or create your own private study group."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Public Study Rooms</h2>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
              <Info className="w-8 h-8" />
              <p>
                No public groups are available at the moment.
                <br />
                Contact an administrator for more information.
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Private Groups</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setJoinOpen(true)}>
                <LogIn className="w-4 h-4 mr-2" />
                Join Group
              </Button>
              <Button onClick={() => setCreateOpen(true)}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </div>
          </div>
          <div className="space-y-4">
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
                            <Link href={`/dashboard/collab/${room.id}`}>
                                Enter Group <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        </CardContent>
                    </Card>
                ))
            ) : (
             !isLoading && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-10 text-center text-muted-foreground">
                  <p>You haven't joined or created any private groups.</p>
                </CardContent>
              </Card>
             )
            )}
          </div>
        </div>
      </div>

      <CreateCollabRoomDialog open={isCreateOpen} onOpenChange={setCreateOpen} />
      <JoinCollabRoomDialog open={isJoinOpen} onOpenChange={setJoinOpen} />
    </div>
  );
}
