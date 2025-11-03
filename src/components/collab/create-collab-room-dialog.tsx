// Version 1.0 Final Push
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import InviteCodeDialog from './invite-code-dialog';

const createRoomSchema = z.object({
  topic: z
    .string()
    .min(5, 'Topic must be at least 5 characters.')
    .max(50, 'Topic must be 50 characters or less.'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters.')
    .max(150, 'Description must be 150 characters or less.'),
});

type CreateRoomFormValues = z.infer<typeof createRoomSchema>;

interface CreateCollabRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export default function CreateCollabRoomDialog({
  open,
  onOpenChange,
}: CreateCollabRoomDialogProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isInviteCodeDialogOpen, setInviteCodeDialogOpen] = useState(false);

  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<CreateRoomFormValues>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      topic: '',
      description: '',
    },
  });

  const onSubmit = async (values: CreateRoomFormValues) => {
    if (!user) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to create a room.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    const newInviteCode = generateInviteCode();

    try {
      const roomsCollection = collection(firestore, 'collabRooms');
      const newRoomData = {
        ...values,
        type: 'private' as const,
        createdBy: user.uid,
        inviteCode: newInviteCode,
        createdAt: serverTimestamp(),
      };

      // 1. Create the room document
      const roomDocRef = await addDoc(roomsCollection, newRoomData).catch((err) => {
        const permissionError = new FirestorePermissionError({
          path: roomsCollection.path,
          operation: 'create',
          requestResourceData: newRoomData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw err;
      });
      
      // 2. Add creator to the members subcollection
      const memberRef = doc(firestore, 'collabRooms', roomDocRef.id, 'members', user.uid);
      const memberData = {
          userId: user.uid,
          joinedAt: serverTimestamp(),
      };
      await setDoc(memberRef, memberData);


      toast({
        title: 'Room Created!',
        description: 'Share this code with friends to join.',
      });

      setInviteCode(newInviteCode);
      setInviteCodeDialogOpen(true);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create room:', error);
      toast({
        title: 'Creation Failed',
        description: 'There was an error creating your room. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-slate-900/80 backdrop-blur-md border-slate-700">
          <DialogHeader>
            <DialogTitle>Create a Private Study Room</DialogTitle>
            <DialogDescription>
              Set a topic and description. An invite code will be generated for you to share.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Topic</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Physics Midterm Prep"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A short description of what this room is for."
                        {...field}
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
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Room'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {inviteCode && (
        <InviteCodeDialog
            open={isInviteCodeDialogOpen}
            onOpenChange={setInviteCodeDialogOpen}
            inviteCode={inviteCode}
        />
      )}
    </>
  );
}
