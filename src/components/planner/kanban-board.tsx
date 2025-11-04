'use client';
import { useState, useMemo, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import TaskDialog from '@/components/planner/task-dialog';
import KanbanColumn from '@/components/planner/kanban-column';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, doc, updateDoc } from 'firebase/firestore';
import type { Task } from '@/lib/types';
import { createPortal } from 'react-dom';
import TaskCard from './task-card';

export type ColumnId = Task['status'];

const columns: ColumnId[] = ['todo', 'inprogress', 'overdue', 'done'];

export default function KanbanBoard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isTaskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const tasksQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/tasks`));
  }, [firestore, user]);

  const { data: tasks, isLoading } = useCollection<Task>(tasksQuery);

  const openNewTaskDialog = () => {
    setEditingTask(null);
    setTaskDialogOpen(true);
  };

  const openEditTaskDialog = (task: Task) => {
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  const tasksByColumn = useMemo(() => {
    const groupedTasks: Record<ColumnId, Task[]> = {
      todo: [],
      inprogress: [],
      overdue: [],
      done: [],
    };
    tasks?.forEach((task) => {
      const status: ColumnId = new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'overdue' : task.status;
      if (groupedTasks[status]) {
        groupedTasks[status].push(task);
      }
    });
    return groupedTasks;
  }, [tasks]);


  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

  async function onDragEnd(event: DragEndEvent) {
     setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;
    
    const isActiveATask = active.data.current?.type === "Task";
    if (!isActiveATask) return;

    const activeTask = tasks?.find(t => t.id === activeId);
    if (!activeTask) return;

    const overColumnId = over.data.current?.type === 'Column' ? over.id as ColumnId : over.data.current?.task.status as ColumnId;

    if (activeTask.status !== overColumnId) {
        const taskRef = doc(firestore, `users/${user!.uid}/tasks`, activeTask.id);
        await updateDoc(taskRef, { status: overColumnId });
    }
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {columns.map((colId) => (
            <KanbanColumn
              key={colId}
              columnId={colId}
              tasks={tasksByColumn[colId] || []}
              isLoading={isLoading}
              onCardClick={openEditTaskDialog}
              onAddTaskClick={openNewTaskDialog}
            />
          ))}
        </div>
         {typeof document !== 'undefined' && createPortal(
            <div className="pointer-events-none">
              {activeTask && (
                <TaskCard task={activeTask} isOverlay />
              )}
            </div>,
            document.body
          )}
      </DndContext>
      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={editingTask}
      />
    </>
  );
}
