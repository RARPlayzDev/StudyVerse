'use client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import type { Task } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const taskFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  subject: z.string().min(2, 'Subject is required.'),
  dueDate: z.date({ required_error: 'Due date is required.' }),
  priority: z.enum(['low', 'medium', 'high']),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  task?: Task | null;
}

export function TaskDialog({ isOpen, setIsOpen, task }: TaskDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || '',
      subject: task?.subject || '',
      dueDate: task?.dueDate ? new Date(task.dueDate) : new Date(),
      priority: task?.priority || 'medium',
    },
  });

  const resetForm = (taskData?: Task | null) => {
    form.reset({
        title: taskData?.title || '',
        subject: taskData?.subject || '',
        dueDate: taskData?.dueDate ? new Date(taskData.dueDate) : new Date(),
        priority: taskData?.priority || 'medium',
    })
  }

  const handleOpenChange = (open: boolean) => {
      setIsOpen(open);
      if(!open) {
          resetForm(null);
      }
  }

  // When the task prop changes (i.e., when opening the dialog for a new or existing task),
  // reset the form with the new task data.
  React.useEffect(() => {
    resetForm(task);
  }, [task, isOpen]);


  const onSubmit = (values: TaskFormValues) => {
    if (!user) return;
    
    const taskData = {
        ...values,
        dueDate: values.dueDate.toISOString(),
        userId: user.uid,
    };

    if (task) {
      // Update existing task
      const taskRef = doc(firestore, 'users', user.uid, 'tasks', task.id);
      const updatePayload = {
          ...taskData,
      }
      updateDoc(taskRef, updatePayload)
        .catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: taskRef.path,
                operation: 'update',
                requestResourceData: updatePayload,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    } else {
      // Add new task
      const collectionRef = collection(firestore, 'users', user.uid, 'tasks');
      const addPayload = {
          ...taskData,
          status: 'todo' as const,
      }
      addDoc(collectionRef, addPayload)
        .catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: collectionRef.path,
                operation: 'create',
                requestResourceData: addPayload,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    }
    handleOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900/80 backdrop-blur-md border-slate-700">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Add New Task'}</DialogTitle>
           <DialogDescription>
            {task ? "Update the details of your task." : "Fill in the details to create a new task."}
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
                    <Input placeholder="e.g., Chapter 5 summary" {...field} />
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
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>Cancel</Button>
              <Button type="submit">{task ? 'Save Changes' : 'Create Task'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
