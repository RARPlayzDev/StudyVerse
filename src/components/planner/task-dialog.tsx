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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash } from 'lucide-react';
import type { Task } from '@/lib/types';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"


const taskFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  subject: z.string().min(2, 'Subject is required.'),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
}

export default function TaskDialog({ open, onOpenChange, task }: TaskDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      subject: '',
      priority: 'medium',
      dueDate: new Date(),
    },
  });
  
  useEffect(() => {
    if (task) {
      form.reset({ ...task, dueDate: new Date(task.dueDate) });
    } else {
      form.reset({
        title: '',
        subject: '',
        priority: 'medium',
        dueDate: new Date(),
      });
    }
  }, [task, form]);


  const onSubmit = async (values: TaskFormValues) => {
    if (!user) return;
    setIsProcessing(true);

    try {
      if (task) {
        // Update existing task
        const taskRef = doc(firestore, `users/${user.uid}/tasks`, task.id);
        await updateDoc(taskRef, {
          ...values,
          dueDate: values.dueDate.toISOString().split('T')[0], // format to YYYY-MM-DD
        });
        toast({ title: 'Task Updated' });
      } else {
        // Create new task
        const tasksCollection = collection(firestore, `users/${user.uid}/tasks`);
        await addDoc(tasksCollection, {
          ...values,
          userId: user.uid,
          status: 'todo',
          dueDate: values.dueDate.toISOString().split('T')[0], // format to YYYY-MM-DD
        });
        toast({ title: 'Task Created' });
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Failed to save task:', error);
      toast({ title: 'An error occurred', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !task) return;
    setIsProcessing(true);
    try {
      const taskRef = doc(firestore, `users/${user.uid}/tasks`, task.id);
      await deleteDoc(taskRef);
      toast({ title: 'Task Deleted' });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast({ title: 'An error occurred while deleting', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900/80 backdrop-blur-md border-slate-700">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create a New Task'}</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new task to your planner.
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
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., History" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col pt-2">
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>
            <DialogFooter className="pt-4">
              {task && (
                <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isProcessing}
                    className="mr-auto"
                    >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {task ? 'Save Changes' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
