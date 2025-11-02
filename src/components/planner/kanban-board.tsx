'use client';
import { useMemo, useState } from 'react';
import { placeholderTasks } from "@/lib/placeholder-data";
import { Task } from "@/lib/types";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Edit, MoreVertical, PlusCircle, Trash } from "lucide-react";
import { TaskDialog } from './task-dialog';

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
                            <DropdownMenuItem className="text-destructive"><Trash className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
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
    const [tasks, setTasks] = useState<Task[]>(placeholderTasks);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const tasksByStatus = useMemo(() => {
        const groupedTasks: { [key in Task['status']]: Task[] } = {
            todo: [],
            inprogress: [],
            done: [],
        };
        tasks.forEach(task => {
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

    const handleSaveTask = (savedTask: Omit<Task, 'id' | 'status'> & { id?: string }) => {
        if (savedTask.id) {
            setTasks(tasks.map(t => t.id === savedTask.id ? { ...t, ...savedTask, status: t.status } : t));
        } else {
            const newTask = {
                ...savedTask,
                id: `t${tasks.length + 1}`,
                status: 'todo' as const
            };
            setTasks([...tasks, newTask]);
        }
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
                                    {columnTasks.map(task => <TaskCard key={task.id} task={task} onEdit={() => handleEditTask(task)} />)}
                                     {columnTasks.length === 0 && (
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
                onSave={handleSaveTask}
            />
        </>
    );
}
