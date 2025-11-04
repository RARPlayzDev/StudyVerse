'use client';
import { useMemo } from 'react';
import type { Task } from '@/lib/types';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './task-card';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Plus, Circle, CheckCircle2, AlertTriangle, Loader } from 'lucide-react';
import { ColumnId } from './kanban-board';
import { Skeleton } from '../ui/skeleton';

interface KanbanColumnProps {
  columnId: ColumnId;
  tasks: Task[];
  isLoading: boolean;
  onCardClick: (task: Task) => void;
  onAddTaskClick: () => void;
}

const columnConfig = {
  todo: { title: 'To Do', icon: <Circle className="h-4 w-4" /> },
  inprogress: { title: 'In Progress', icon: <Loader className="h-4 w-4 animate-spin" /> },
  overdue: { title: 'Overdue', icon: <AlertTriangle className="h-4 w-4 text-destructive" /> },
  done: { title: 'Done', icon: <CheckCircle2 className="h-4 w-4 text-green-500" /> },
};


export default function KanbanColumn({ columnId, tasks, isLoading, onCardClick, onAddTaskClick }: KanbanColumnProps) {
  const { title, icon } = columnConfig[columnId];

  return (
    <div className="flex flex-col">
        <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
                {icon}
                <h2 className="font-semibold">{title}</h2>
                <span className="text-sm text-muted-foreground bg-muted h-5 w-5 flex items-center justify-center rounded-full">
                    {tasks.length}
                </span>
            </div>
            {columnId === 'todo' && (
                <Button variant="ghost" size="sm" onClick={onAddTaskClick}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Task
                </Button>
            )}
        </div>

      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'min-h-[400px] rounded-lg bg-slate-900/50 p-4 transition-colors',
              snapshot.isDraggingOver && 'bg-slate-800/70'
            )}
          >
            {isLoading && (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            )}
            {!isLoading && tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onClick={() => onCardClick(task)}
              />
            ))}
            {provided.placeholder}
            {!isLoading && tasks.length === 0 && (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    <p>{columnId === 'overdue' ? 'No overdue tasks. Keep it up!' : `No tasks in ${columnId === 'inprogress' ? 'progress' : title.toLowerCase()}.`}</p>
                </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
