'use client';
import { useMemo, useState } from 'react';
import { Task } from "@/lib/types";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Edit, MoreVertical, PlusCircle, Trash } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { TaskDialog } from './task-dialog';
import { format } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

type Column = {
    title: string;
    status: Task['status'];
};

const columns: Column[] = [
    { title: "To Do", status: "todo" },
    { title: "In Progress", status: "inprogress" },
    { title: "Done", status: "done" },
];

function TaskCard({ task, onEdit }: { task: Task; onEdit: () => void; }) {
    const firestore = useFirestore();

    const updateTaskStatus = (status: Task['status']) => {
        if (!task.id) return;
        const taskRef = doc(firestore, 'users', task.userId, 'tasks', task.id);
        const updatedData = { status };
        updateDoc(taskRef, updatedData)
            .catch(serverError => {
                const permissionError = new FirestorePermissionError({
                    path: taskRef.path,
                    operation: 'update',
                    requestResourceData: updatedData,
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    };

    const deleteTask = () => {
         if (!task.id) return;
        const taskRef = doc(firestore, 'users', task.userId, 'tasks', task.id);
        deleteDoc(taskRef)
             .catch(serverError => {
                const permissionError = new FirestorePermissionError({
                    path: taskRef.path,
                    operation: 'delete',
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    }

    return (
        <Card className="mb-4 bg-background/50 hover:bg-background/80 transition-colors">
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <p className="font-medium mb-2 pr-2">{task.title}</p>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                                <MoreVertical className="h-4 w-4" />
                           </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onEdit}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={deleteTask} className="text-destructive"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                    <span>{task.subject}</span>
                    <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'} className="capitalize">{task.priority}</Badge>
                </div>
                 <div className="flex flex-wrap gap-2 mb-3">
                    {columns.map(col => (
                        <button
                            key={col.status}
                            onClick={() => updateTaskStatus(col.status)}
                            className={`px-2 py-1 text-xs rounded-full ${task.status === col.status ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                        >
                            {col.title}
                        </button>
                    ))}
                 </div>
                <p className="text-xs text-muted-foreground mt-2">Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</p>
            </CardContent>
        </Card>
    );
}

export default function KanbanBoard() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const tasksQuery = useMemoFirebase(() => {
        if (!user) return null;
        return collection(firestore, 'users', user.uid, 'tasks');
    }, [firestore, user]);

    const { data: tasks, isLoading } = useCollection<Task>(tasksQuery);

    const tasksByStatus = useMemo(() => {
        const groupedTasks: { [key in Task['status']]: Task[] } = {
            todo: [],
            inprogress: [],
            done: [],
        };
        tasks?.forEach(task => {
            if (groupedTasks[task.status]) {
                groupedTasks[task.status].push(task);
            }
        });
        return groupedTasks;
    }, [tasks]);

    const handleAddTask = () => {
        setEditingTask(null);
        setDialogOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setDialogOpen(true);
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map(column => {
                    const columnTasks = tasksByStatus[column.status];
                    return (
                        <div key={column.status} className="rounded-lg">
                            <div className="flex justify-between items-center mb-4 px-1">
                                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    {column.title}
                                    <Badge variant="secondary" className="h-5">{isLoading ? '...' : columnTasks.length}</Badge>
                                </h2>
                                {column.status === 'todo' && (
                                    <Button variant="ghost" size="sm" onClick={handleAddTask}>
                                        <PlusCircle className="w-4 h-4 mr-2" />
                                        Add Task
                                    </Button>
                                )}
                            </div>
                            <Card className="bg-card/30 backdrop-blur-sm border-border/30 min-h-[500px] p-4">
                                <CardContent className="p-0">
                                    {isLoading && <p className="text-muted-foreground text-sm p-2">Loading tasks...</p>}
                                    {columnTasks && columnTasks.map(task => 
                                        <TaskCard 
                                            key={task.id} 
                                            task={task} 
                                            onEdit={() => handleEditTask(task)}
                                        />
                                    )}
                                     {!isLoading && columnTasks?.length === 0 && (
                                        <div className="text-center text-muted-foreground p-4 text-sm">
                                            {column.status === 'todo' ? "You're all clear!" : `No tasks in ${column.title.toLowerCase()}.`}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    );
                })}
            </div>
            <TaskDialog 
                isOpen={isDialogOpen} 
                setIsOpen={setDialogOpen}
                task={editingTask}
            />
        </>
    );
}
