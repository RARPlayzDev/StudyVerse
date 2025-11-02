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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUser, useFirestore, useFirebaseApp } from '@/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const subjects = ['Maths', 'Physics', 'Chemistry', 'Python'];

const noteUploadSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  subject: z.enum(subjects as [string, ...string[]], {
    errorMap: () => ({ message: 'Please select a subject.' }),
  }),
  file: z
    .instanceof(FileList)
    .refine((files) => files?.length === 1, 'A PDF file is required.')
    .refine(
      (files) => files?.[0]?.type === 'application/pdf',
      'Only PDF files are accepted.'
    ),
});

type NoteUploadFormValues = z.infer<typeof noteUploadSchema>;

interface UploadNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UploadNoteDialog({
  open,
  onOpenChange,
}: UploadNoteDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const firebaseApp = useFirebaseApp();
  const { toast } = useToast();

  const form = useForm<NoteUploadFormValues>({
    resolver: zodResolver(noteUploadSchema),
    defaultValues: {
      title: '',
    },
  });
  const fileRef = form.register('file');

  const onSubmit = async (values: NoteUploadFormValues) => {
    if (!user) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to upload notes.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    const file = values.file[0];
    const storage = getStorage(firebaseApp);
    const storageRef = ref(storage, `notes/${user.uid}/${Date.now()}_${file.name}`);

    try {
      // 1. Upload file to Firebase Storage
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // 2. Create document in Firestore
      const notesCollection = collection(firestore, `users/${user.uid}/notes`);
      const newNote = {
        userId: user.uid,
        title: values.title,
        subject: values.subject,
        uploader: user.displayName || user.email || 'Anonymous',
        date: serverTimestamp(),
        downloads: 0,
        fileUrl: downloadURL,
        fileType: 'pdf',
      };
      
      await addDoc(notesCollection, newNote)
        .catch((err) => {
            const permissionError = new FirestorePermissionError({
                path: notesCollection.path,
                operation: 'create',
                requestResourceData: newNote
            });
            errorEmitter.emit('permission-error', permissionError);
            throw err; // re-throw to be caught by the outer catch block
        });


      toast({
        title: 'Upload Successful!',
        description: `${values.title} has been added to the Notes Hub.`,
      });

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: 'Upload Failed',
        description:
          'There was an error uploading your note. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900/80 backdrop-blur-md border-slate-700">
        <DialogHeader>
          <DialogTitle>Upload a New Note</DialogTitle>
          <DialogDescription>
            Share your knowledge with the StudyVerse community.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Quantum Physics Summary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PDF File</FormLabel>
                  <FormControl>
                    <Input type="file" accept=".pdf" {...fileRef} />
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
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}