'use client';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export function KanbanTaskCard({ task, index, isOverlay = false, onClick }: { task: Task, index: number, isOverlay?: boolean, onClick?: (task: Task) => void }) {
    
    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => onClick?.(task)}
                >
                    <Card className={cn(
                        "mb-4 bg-background/70 hover:bg-muted/80 cursor-grab active:cursor-grabbing",
                        snapshot.isDragging || isOverlay ? "shadow-lg scale-105" : ""
                    )}>
                        <CardContent className="p-4">
                            <p className="font-medium mb-2">{task.title}</p>
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-muted-foreground">
                                    Added {task.createdAt ? formatDistanceToNow(task.createdAt.toDate(), { addSuffix: true }) : '...'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </Draggable>
    );
}

interface KanbanColumnProps {
    id: string;
    title: string;
    tasks: Task[];
    onTaskClick: (task: Task) => void;
    isLoading: boolean;
}

export function KanbanColumn({ id, title, tasks, onTaskClick, isLoading }: KanbanColumnProps) {
    return (
        <Droppable droppableId={id}>
            {(provided, snapshot) => (
                <Card className={cn(
                    "bg-card/30 backdrop-blur-sm border-border/30 transition-colors",
                    snapshot.isDraggingOver && "bg-primary/10 border-primary/50"
                )}>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>{title}</span>
                            <span className="text-sm font-normal text-muted-foreground bg-background px-2 py-1 rounded-full">{tasks.length}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent ref={provided.innerRef} {...provided.droppableProps} className="h-full min-h-[200px] px-4 pb-4 pt-0">
                         <AnimatePresence>
                            {tasks.map((task, index) => (
                                 <motion.div
                                    key={task.id}
                                    layout
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                                    transition={{ duration: 0.2, delay: index * 0.02 }}
                                >
                                    <KanbanTaskCard task={task} index={index} onClick={onTaskClick} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {provided.placeholder}
                        {!isLoading && tasks.length === 0 && (
                            <div className="flex h-full items-center justify-center">
                                <p className="text-sm text-muted-foreground">Drop tasks here</p>
                            </div>
                        )}
                         {isLoading && tasks.length === 0 && (
                            <div className="text-sm text-muted-foreground p-4 text-center">Loading tasks...</div>
                         )}
                    </CardContent>
                </Card>
            )}
        </Droppable>
    );
}
