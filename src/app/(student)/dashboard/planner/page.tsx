'use client';
import { useState, useMemo, useEffect } from 'react';
import PageTitle from '@/components/common/page-title';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, where, orderBy, Timestamp } from 'firebase/firestore';
import type { Task } from '@/lib/types';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { subDays, format, startOfDay, eachDayOfInterval, isSameDay } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const chartConfig = {
  tasks: {
    label: "Tasks Completed",
    color: "hsl(var(--primary))",
  },
};

export default function PlannerPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const tasksQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/tasks`), orderBy('createdAt', 'desc'));
  }, [user, firestore]);

  const { data: tasks, isLoading } = useCollection<Task>(tasksQuery);

  const completedTasksQuery = useMemoFirebase(() => {
    if (!user) return null;
    const sevenDaysAgo = subDays(new Date(), 6);
    return query(
      collection(firestore, 'users', user.uid, 'tasks'),
      where('status', '==', 'done'),
      where('completedAt', '>=', Timestamp.fromDate(startOfDay(sevenDaysAgo)))
    );
  }, [user, firestore]);

  const { data: recentCompletedTasks } = useCollection<Task>(completedTasksQuery);

  const completionChartData = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    });

    return last7Days.map(day => {
      const tasksOnDay = recentCompletedTasks?.filter(task => 
        task.completedAt && isSameDay(task.completedAt.toDate(), day)
      ) || [];
      return {
        date: format(day, 'EEE'),
        tasks: tasksOnDay.length,
      };
    });
  }, [recentCompletedTasks]);
  
  const incompleteTasks = useMemo(() => tasks?.filter(t => t.status !== 'done') || [], [tasks]);
  const completeTasks = useMemo(() => tasks?.filter(t => t.status === 'done') || [], [tasks]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTaskTitle.trim()) return;

    const tasksCollection = collection(firestore, `users/${user.uid}/tasks`);
    const taskData = {
      userId: user.uid,
      title: newTaskTitle,
      status: 'todo' as const,
      createdAt: serverTimestamp(),
      completedAt: null,
    };
    
    addDoc(tasksCollection, taskData).catch(err => {
      const permissionError = new FirestorePermissionError({
        path: tasksCollection.path,
        operation: 'create',
        requestResourceData: taskData
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    setNewTaskTitle('');
  };

  const handleToggleTask = async (task: Task) => {
    if (!user) return;
    const taskRef = doc(firestore, `users/${user.uid}/tasks`, task.id);
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    
    const updateData = {
      status: newStatus,
      completedAt: newStatus === 'done' ? serverTimestamp() : null,
    };

    updateDoc(taskRef, updateData).catch(err => {
      const permissionError = new FirestorePermissionError({
        path: taskRef.path,
        operation: 'update',
        requestResourceData: updateData
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    const taskRef = doc(firestore, `users/${user.uid}/tasks`, taskId);
    deleteDoc(taskRef).catch(err => {
        const permissionError = new FirestorePermissionError({
            path: taskRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  return (
    <div>
      <PageTitle title="Study Planner" subtitle="Organize your tasks and track your progress." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>My Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleAddTask} className="flex gap-2">
                  <Input 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Add a new task..."
                  />
                  <Button type="submit"><Plus className="h-4 w-4 mr-2" /> Add Task</Button>
                </form>

                <div className="space-y-4">
                  <h3 className="font-semibold">To Do</h3>
                  {isLoading && <p>Loading tasks...</p>}
                  {incompleteTasks.length > 0 ? (
                    incompleteTasks.map(task => (
                      <div key={task.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                        <Checkbox id={`task-${task.id}`} onCheckedChange={() => handleToggleTask(task)} />
                        <label htmlFor={`task-${task.id}`} className="flex-grow text-sm">{task.title}</label>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteTask(task.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ))
                  ) : !isLoading && (
                    <p className="text-sm text-muted-foreground pl-2">No tasks to do. Add one above!</p>
                  )}
                </div>

                 <div className="space-y-4">
                  <h3 className="font-semibold">Completed</h3>
                  {completeTasks.length > 0 ? (
                    completeTasks.map(task => (
                     <div key={task.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                        <Checkbox id={`task-${task.id}`} checked onCheckedChange={() => handleToggleTask(task)} />
                        <label htmlFor={`task-${task.id}`} className="flex-grow text-sm line-through text-muted-foreground">{task.title}</label>
                         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteTask(task.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ))
                  ) : !isLoading && (
                    <p className="text-sm text-muted-foreground pl-2">No tasks completed yet.</p>
                  )}
                </div>

              </CardContent>
            </Card>
        </div>
        <div>
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Completion Trend</CardTitle>
              <CardDescription>Tasks you've completed in the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
               <ChartContainer config={chartConfig} className="h-64 w-full">
                <ResponsiveContainer>
                  <BarChart data={completionChartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={10} />
                     <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="tasks" fill="var(--color-tasks)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}