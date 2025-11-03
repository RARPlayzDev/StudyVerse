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
} from 'lucide-react';
import CreateCollabRoomDialog from '@/components/collab/create-collab-room-dialog';
import JoinCollabRoomDialog from '@/components/collab/join-collab-room-dialog';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, deleteDoc } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { CollabRoom } from '@/lib/types';
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


export default function CollabPage() {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isJoinOpen, setJoinOpen] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const privateRoomsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'collabRooms'),
      where('members', 'array-contains', user.uid)
    );
  }, [firestore, user]);

  const { data: privateRooms, isLoading } = useCollection<CollabRoom>(privateRoomsQuery);

  const handleDeleteRoom = async (roomId: string) => {
    try {
      // NOTE: This only deletes the room doc. A Cloud Function would be needed to delete the subcollection.
      await deleteDoc(doc(firestore, "collabRooms", roomId));
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

  return (
    <div>
      <PageTitle
        title="Collaboration Space"
        subtitle="Join or create private study rooms to focus and collaborate together."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-semibold">Your Rooms</h3>
            {isLoading && (
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-10 text-center text-muted-foreground">
                        <p>Loading your study rooms...</p>
                    </CardContent>
                </Card>
            )}
            {!isLoading && privateRooms && privateRooms.length > 0 ? (
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
                            <span className="text-xs text-muted-foreground mb-4">{room.members.length} members</span>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button asChild size="sm" className="w-full">
                                    <Link href={`/rooms/${room.id}`}>
                                        Enter Room <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                                 {user && user.uid === room.createdBy && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="destructive" size="sm" className="w-full sm:w-auto">
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
                        </CardContent>
                    </Card>
                ))}
                </div>
            ) : (
            !isLoading && (
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
                    <CardTitle className="flex items-center gap-2">
                        <PlusCircle className="text-accent"/>
                        Create Room
                    </CardTitle>
                     <CardDescription>
                        Start a new private session.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => setCreateOpen(true)} className="w-full">Create a New Room</Button>
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
