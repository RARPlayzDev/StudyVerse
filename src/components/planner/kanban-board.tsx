'use client';
import { placeholderTasks } from "@/lib/placeholder-data";
import { Task } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";

const columns: { title: string; status: Task['status'] }[] = [
    { title: "To Do", status: "todo" },
    { title: "In Progress", status: "inprogress" },
    { title: "Done", status: "done" },
];

function TaskCard({ task }: { task: Task }) {
    return (
        <Card className="mb-4 bg-background/50 hover:bg-background/80 cursor-grab active:cursor-grabbing">
            <CardContent className="p-4">
                <p className="font-medium mb-2">{task.title}</p>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{task.subject}</span>
                    <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'} className="capitalize">{task.priority}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Due: {task.dueDate}</p>
            </CardContent>
        </Card>
    );
}

export default function KanbanBoard() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map(column => {
                const tasks = placeholderTasks.filter(task => task.status === column.status);
                return (
                    <div key={column.status} className="rounded-lg">
                        <div className="flex justify-between items-center mb-4 px-1">
                            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                {column.title}
                                <Badge variant="secondary" className="h-5">{tasks.length}</Badge>
                            </h2>
                            {column.status === 'todo' && (
                                <Button variant="ghost" size="sm">
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Add Task
                                </Button>
                            )}
                        </div>
                        <Card className="bg-card/30 backdrop-blur-sm border-border/30 min-h-[500px] p-4">
                            <CardContent className="p-0">
                                {tasks.map(task => <TaskCard key={task.id} task={task} />)}
                            </CardContent>
                        </Card>
                    </div>
                );
            })}
        </div>
    );
}
