'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore } from '@/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  doc,
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import type { CollabRoom } from '@/lib/types';

const joinRoomSchema = z.object({
  inviteCode: z.string().length(6, 'Invite code must be 6 characters long.'),
});

type JoinRoomFormValues = z.infer<typeof joinRoomSchema>;

interface JoinCollabRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function JoinCollabRoomDialog({
  open,
  onOpenChange,
}: JoinCollabRoomDialogProps) {
  const [isJoining, setIsJoining] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<JoinRoomFormValues>({
    resolver: zodResolver(joinRoomSchema),
    defaultValues: {
      inviteCode: '',
    },
  });

  const onSubmit = async (values: JoinRoomFormValues) => {
    if (!user) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to join a group.',
        variant: 'destructive',
      });
      return;
    }

    setIsJoining(true);
    const codeToJoin = values.inviteCode.toUpperCase();

    try {
      const roomsCollection = collection(firestore, 'collabRooms');
      const q = query(
        roomsCollection,
        where('inviteCode', '==', codeToJoin),
        where('type', '==', 'private')
      );
      
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          title: 'Invalid Code',
          description: 'No private group found with that invite code.',
          variant: 'destructive',
        });
        setIsJoining(false);
        return;
      }
      
      const roomDoc = querySnapshot.docs[0];
      const roomData = roomDoc.data() as CollabRoom;
      const roomRef = doc(firestore, 'collabRooms', roomDoc.id);

      if (roomData.members.includes(user.uid)) {
        toast({
            title: 'Already a Member',
            description: 'You are already in this study group.',
        });
        form.reset();
        onOpenChange(false);
        setIsJoining(false);
        return;
      }

      await updateDoc(roomRef, {
        members: arrayUnion(user.uid),
      }).catch((err) => {
        const permissionError = new FirestorePermissionError({
          path: roomRef.path,
          operation: 'update',
          requestResourceData: { members: `+ ${user.uid}` },
        });
        errorEmitter.emit('permission-error', permissionError);
        throw err;
      });

      toast({
        title: 'Success!',
        description: `You have joined the group: ${roomData.topic}.`,
      });

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to join room:', error);
      toast({
        title: 'Join Failed',
        description:
          'There was an error joining the group. Please check the code and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900/80 backdrop-blur-md border-slate-700">
        <DialogHeader>
          <DialogTitle>Join a Private Group</DialogTitle>
          <DialogDescription>
            Enter the 6-character invite code to join a study group.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="inviteCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invite Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., A1B2C3"
                      {...field}
                      onChange={e => field.onChange(e.target.value.toUpperCase())}
                      maxLength={6}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isJoining}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isJoining}>
                {isJoining ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join Group'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
