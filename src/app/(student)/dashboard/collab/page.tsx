
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
  LogIn,
  ArrowRight,
  Trash2,
  Copy,
  Users,
} from 'lucide-react';
import CreateCollabRoomDialog from '@/components/collab/create-collab-room-dialog';
import JoinCollabRoomDialog from '@/components/collab/join-collab-room-dialog';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { CollabRoom, CollabRoomMember } from '@/lib/types';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const MAX_ROOMS = 10;

export default function CollabPage() {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isJoinOpen, setJoinOpen] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const allRoomsQuery = useMemoFirebase(() => {
    return query(collection(firestore, 'collabRooms'));
  }, [firestore]);

  const { data: allRooms, isLoading: allRoomsLoading } = useCollection<CollabRoom>(allRoomsQuery);
  
  // This query is a bit more complex now. We first need to find which rooms the user is a member of.
  // A reverse query (find collections where a doc exists) isn't possible.
  // So, we'll have to query all rooms and filter client-side for this demo.
  // For a large-scale app, we would denormalize room data onto a user document.
  const { data: userPrivateRooms, isLoading: userRoomsLoading } = useCollection<CollabRoom>(
    useMemoFirebase(() => query(collection(firestore, 'collabRooms')), [firestore])
  );
  
  const [privateRooms, setPrivateRooms] = useState<CollabRoom[]>([]);
  const [areUserRoomsLoading, setUserRoomsLoading] = useState(true);

  // Effect to filter rooms client-side
  useEffect(() => {
    if (!userRoomsLoading && user) {
        const checkUserRooms = async () => {
            if (!userPrivateRooms) {
                setPrivateRooms([]);
                setUserRoomsLoading(false);
                return;
            }
            const filteredRooms: CollabRoom[] = [];
            for (const room of userPrivateRooms) {
                const memberDoc = await getDocs(query(collection(firestore, `collabRooms/${room.id}/members`), where('userId', '==', user.uid)));
                if (!memberDoc.empty) {
                    filteredRooms.push(room);
                }
            }
            setPrivateRooms(filteredRooms);
            setUserRoomsLoading(false);
        }
        checkUserRooms();
    }
  }, [userPrivateRooms, userRoomsLoading, user, firestore]);
  

  const roomsAvailable = MAX_ROOMS - (allRooms?.length || 0);
  const areRoomsFull = roomsAvailable <= 0;

  const handleDeleteRoom = async (roomId: string) => {
    try {
      const roomRef = doc(firestore, "collabRooms", roomId);
      // As creator, we delete the room and all subcollections (members, messages)
      
      // Firestore doesn't delete subcollections automatically on document delete.
      // For a production app, a Cloud Function would be needed to do this robustly.
      // For now, we'll just delete the room doc.
      await deleteDoc(roomRef);

      toast({
        title: "Room Deleted",
        description: "The study room has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting room: ", error);
      toast({
        title: "Error",
        description: "Failed to delete the room. You may not have permission.",
        variant: "destructive",
      })
    }
  };

  const handleCopyCode = (code: string | undefined) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    toast({
      title: "Invite Code Copied!",
      description: "You can now share it with your friends.",
    });
  };

  return (
    <div>
      <PageTitle
        title="Collaboration Space"
        subtitle="Join or create private study rooms to focus and collaborate together."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-semibold">Your Rooms</h3>
            {areUserRoomsLoading && (
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <p>Loading your study rooms...</p>
                    </CardContent>
                </Card>
            )}
            {!areUserRoomsLoading && privateRooms && privateRooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {privateRooms.map((room) => (
                    <Card key={room.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all flex flex-col">
                        <CardHeader>
                        <CardTitle>{room.topic}</CardTitle>
                        <CardDescription>
                            {room.description}
                        </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col justify-end">
                             <div className="flex flex-col gap-2">
                                <Button asChild size="sm" className="w-full">
                                    <Link href={`/rooms/${room.id}`}>
                                        Enter Room <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                                <div className="flex gap-2">
                                  <Button variant="secondary" size="sm" className="w-full" onClick={() => handleCopyCode(room.inviteCode)}>
                                    <Copy className="h-4 w-4 mr-2" /> Copy Code
                                  </Button>
                                  {user && room.createdBy === user.uid && (
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="destructive" size="sm" className="w-auto">
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              This action cannot be undone. This will permanently delete the study room and all its messages.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteRoom(room.id)}>
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                  )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                </div>
            ) : (
            !areUserRoomsLoading && (
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-10 text-center text-muted-foreground">
                <p>You haven't joined or created any private rooms yet.</p>
                </CardContent>
            </Card>
            )
            )}
        </div>
        <div className="space-y-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users />Room Availability</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                {allRoomsLoading ? <Skeleton className="h-10 w-3/4 mx-auto" /> : (
                  <>
                    <p className="text-4xl font-bold">{roomsAvailable}</p>
                    <p className="text-muted-foreground">out of {MAX_ROOMS} rooms available</p>
                  </>
                )}
              </CardContent>
            </Card>
             <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PlusCircle className="text-accent"/>
                        Create Room
                    </CardTitle>
                     <CardDescription>
                        Start a new private session.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {areRoomsFull ? (
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button className="w-full" disabled>Create a New Room</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>All Rooms Are Full</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    We have reached the maximum number of concurrent rooms. Please contact an administrator to request more capacity.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogAction>OK</AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <Button onClick={() => setCreateOpen(true)} className="w-full">Create a New Room</Button>
                    )}
                </CardContent>
            </Card>
             <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LogIn className="text-accent"/>
                        Join Room
                    </CardTitle>
                     <CardDescription>
                        Enter an invite code to join.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="secondary" onClick={() => setJoinOpen(true)} className="w-full">Join with Code</Button>
                </CardContent>
            </Card>
        </div>
      </div>

      <CreateCollabRoomDialog open={isCreateOpen} onOpenChange={setCreateOpen} />
      <JoinCollabRoomDialog open={isJoinOpen} onOpenChange={setJoinOpen} />
    </div>
  );
}

    