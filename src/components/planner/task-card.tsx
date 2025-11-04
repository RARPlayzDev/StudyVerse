'use client';
import { Task } from '@/lib/types';
import { Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type TaskCardProps = {
  task: Task;
  index?: number;
  onClick?: () => void;
  isOverlay?: boolean;
};

const priorityStyles = {
  low: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-300 border-red-500/30',
};

export default function TaskCard({ task, index, onClick, isOverlay }: TaskCardProps) {
  const card = (
    <Card
      onClick={onClick}
      className={cn(
        'mb-4 bg-card/70 backdrop-blur-sm border-border/50 hover:border-accent/50 cursor-pointer',
        isOverlay && 'ring-2 ring-primary'
      )}
    >
      <CardHeader className="p-4">
        <h3 className="font-semibold leading-tight">{task.title}</h3>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <p>Due: {format(new Date(task.dueDate), 'MMM d')}</p>
          <Badge
            variant="outline"
            className={cn('capitalize', priorityStyles[task.priority])}
          >
            {task.priority}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  if (isOverlay) {
    return card;
  }
  
  if (typeof index === 'undefined') return null;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {card}
        </div>
      )}
    </Draggable>
  );
}
