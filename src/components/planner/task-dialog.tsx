'use client';
import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';
import type { Task } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  status: z.enum(['todo', 'done']),
  subject: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

export default function TaskDialog({ open, onOpenChange, task }: TaskDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      status: 'todo',
      subject: '',
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        status: task.status,
        subject: task.subject || '',
      });
    } else {
      form.reset({
        title: '',
        status: 'todo',
        subject: '',
      });
    }
  }, [task, open, form]);

  const onSubmit = async (values: TaskFormValues) => {
    if (!user) return;
    setIsSaving(true);
    
    const collectionRef = collection(firestore, `users/${user.uid}/tasks`);

    try {
      if (task) {
        // Update existing task
        const taskRef = doc(collectionRef, task.id);
        const updateData: any = {
          ...values,
          completedAt: values.status === 'done' && task.status !== 'done' ? serverTimestamp() : task.completedAt || null,
        };
        await updateDoc(taskRef, updateData).catch(err => {
            const permissionError = new FirestorePermissionError({
                path: taskRef.path,
                operation: 'update',
                requestResourceData: updateData
            });
            errorEmitter.emit('permission-error', permissionError);
            throw err;
        });
        toast({ title: 'Task Updated' });
      } else {
        // Create new task
        const taskData = {
          ...values,
          userId: user.uid,
          createdAt: serverTimestamp(),
          completedAt: null,
        };
        await addDoc(collectionRef, taskData).catch(err => {
            const permissionError = new FirestorePermissionError({
                path: collectionRef.path,
                operation: 'create',
                requestResourceData: taskData
            });
            errorEmitter.emit('permission-error', permissionError);
            throw err;
        });
        toast({ title: 'Task Created' });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save task:', error);
      toast({
        title: 'Save Failed',
        description: 'An error occurred while saving the task.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !task) return;
    setIsSaving(true);
    try {
        const taskRef = doc(firestore, `users/${user.uid}/tasks`, task.id);
        await deleteDoc(taskRef).catch(err => {
            const permissionError = new FirestorePermissionError({
                path: taskRef.path,
                operation: 'delete'
            });
            errorEmitter.emit('permission-error', permissionError);
            throw err;
        });
        toast({ title: 'Task Deleted', variant: 'destructive' });
        onOpenChange(false);
    } catch (error) {
        console.error("Failed to delete task:", error);
        toast({ title: 'Delete Failed', variant: 'destructive'});
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900/80 backdrop-blur-md border-slate-700">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          <DialogDescription>
            {task ? 'Update the details of your task.' : 'Fill out the form to add a new task to your board.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Read Chapter 5" {...field} />
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
                  <FormLabel>Subject (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Physics" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="flex-row justify-between w-full">
              <div>
                {task && (
                    <Button type="button" variant="destructive" size="icon" onClick={handleDelete} disabled={isSaving}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {task ? 'Save Changes' : 'Add Task'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
