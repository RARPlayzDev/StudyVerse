'use client';
import { useMemo, useState } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Task } from "@/lib/types";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '../ui/dropdown-menu';
import { Edit, MoreVertical, PlusCircle, Trash, CheckCircle, Circle, Loader } from "lucide-react";
import { TaskDialog } from './task-dialog';
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

function TaskCard({ task, onEdit, onStatusChange, onDelete }: { task: Task; onEdit: () => void; onStatusChange: (status: Task['status']) => void; onDelete: () => void; }) {
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
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Move to</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    {columns.map(col => (
                                        <DropdownMenuItem 
                                            key={col.status}
                                            disabled={task.status === col.status}
                                            onClick={() => onStatusChange(col.status)}
                                        >
                                            {col.title}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuItem className="text-destructive" onClick={onDelete}><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                    <span>{task.subject}</span>
                    <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'} className="capitalize">{task.priority}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Due: {task.dueDate}</p>
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
        return collection(firestore, `users/${user.uid}/tasks`);
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

    const handleSaveTask = (savedTask: Omit<Task, 'id' | 'userId'> & { id?: string }) => {
        if (!user) return;

        if (savedTask.id) {
            // Update existing task
            const taskRef = doc(firestore, `users/${user.uid}/tasks/${savedTask.id}`);
            const { id, ...taskData } = savedTask;
            updateDoc(taskRef, taskData).catch(err => {
                const permissionError = new FirestorePermissionError({
                    path: taskRef.path,
                    operation: 'update',
                    requestResourceData: taskData
                });
                errorEmitter.emit('permission-error', permissionError);
            });
        } else {
            // Create new task
            const collectionRef = collection(firestore, `users/${user.uid}/tasks`);
            const newTaskData = {
                ...savedTask,
                userId: user.uid,
                status: 'todo' as const
            }
            addDoc(collectionRef, newTaskData).catch(err => {
                const permissionError = new FirestorePermissionError({
                    path: collectionRef.path,
                    operation: 'create',
                    requestResourceData: newTaskData
                });
                errorEmitter.emit('permission-error', permissionError);
            });
        }
    };

    const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
        if (!user) return;
        const taskRef = doc(firestore, `users/${user.uid}/tasks/${taskId}`);
        const updateData = { status: newStatus };
        updateDoc(taskRef, updateData).catch(err => {
            const permissionError = new FirestorePermissionError({
                path: taskRef.path,
                operation: 'update',
                requestResourceData: updateData
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    };
    
    const handleDeleteTask = (taskId: string) => {
        if (!user) return;
        const taskRef = doc(firestore, `users/${user.uid}/tasks/${taskId}`);
        deleteDoc(taskRef).catch(err => {
            const permissionError = new FirestorePermissionError({
                path: taskRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    };


    const getColumnIcon = (status: Task['status']) => {
        switch (status) {
            case 'todo': return <Circle className="h-4 w-4 text-muted-foreground" />;
            case 'inprogress': return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
            case 'done': return <CheckCircle className="h-4 w-4 text-green-500" />;
        }
    }


    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map(column => {
                    const columnTasks = tasksByStatus[column.status];
                    return (
                        <div key={column.status} className="rounded-lg">
                            <div className="flex justify-between items-center mb-4 px-1">
                                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    {getColumnIcon(column.status)}
                                    {column.title}
                                    <Badge variant="secondary" className="h-5">{columnTasks.length}</Badge>
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
                                    {isLoading && <p>Loading...</p>}
                                    {!isLoading && columnTasks.map(task => 
                                        <TaskCard 
                                            key={task.id} 
                                            task={task} 
                                            onEdit={() => handleEditTask(task)}
                                            onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                                            onDelete={() => handleDeleteTask(task.id)}
                                        />
                                    )}
                                     {!isLoading && columnTasks.length === 0 && (
                                        <div className="text-center text-muted-foreground p-4 text-sm">
                                            {column.status === 'done' ? "Let's get some work done!" : `No tasks in ${column.title.toLowerCase()}.`}
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
                onSave={handleSaveTask}
            />
        </>
    );
}
