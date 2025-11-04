'use client';
import { useState, useMemo, useEffect } from 'react';
import {
  DragDropContext,
  DragEndEvent,
  DragStartEvent,
} from '@hello-pangea/dnd';
import TaskDialog from '@/components/planner/task-dialog';
import KanbanColumn from '@/components/planner/kanban-column';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
      // Logic to determine if a task is overdue
      const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
      
      // The 'overdue' column should only show tasks that are not 'done'.
      if (isOverdue) {
        // Prevent adding to 'overdue' if it's already in another column for this render
        if (!groupedTasks.todo.find(t => t.id === task.id) && !groupedTasks.inprogress.find(t => t.id === task.id)) {
           groupedTasks.overdue.push(task);
        }
      } 
      // A task can be in its status column AND the overdue column
      if (groupedTasks[task.status]) {
          groupedTasks[task.status].push(task);
      }
    });
    // De-duplicate tasks within each column as a safeguard
    for (const colId of columns) {
        const uniqueTasks = new Map<string, Task>();
        groupedTasks[colId].forEach(task => uniqueTasks.set(task.id, task));
        groupedTasks[colId] = Array.from(uniqueTasks.values());
    }

    return groupedTasks;
  }, [tasks]);


  const [activeTask, setActiveTask] = useState<Task | null>(null);

  function onDragStart(event: DragStartEvent) {
    const { draggableId } = event;
    const task = tasks?.find(t => t.id === draggableId);
    if (task) {
      setActiveTask(task);
    }
  }

  async function onDragEnd(result: DragEndEvent) {
     setActiveTask(null);
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    
    const movedTask = tasks?.find(t => t.id === draggableId);
    if (!movedTask || !user) return;

    const newStatus = destination.droppableId as ColumnId;

    // If task is moved to 'done'
    if (newStatus === 'done') {
        const completionLog = {
            userId: user.uid,
            taskId: movedTask.id,
            title: movedTask.title,
            subject: movedTask.subject,
            completedAt: serverTimestamp(),
        };
        const completionsRef = collection(firestore, `users/${user.uid}/completions`);
        const taskRef = doc(firestore, `users/${user.uid}/tasks`, movedTask.id);

        await addDoc(completionsRef, completionLog);
        await deleteDoc(taskRef);
        return; // Stop further processing
    }

    // A task moved to 'overdue' column should retain its original status ('todo' or 'inprogress')
    // unless it is being moved out of overdue.
    const finalStatus = newStatus === 'overdue' ? movedTask.status : newStatus;

    if (movedTask.status !== finalStatus) {
        const taskRef = doc(firestore, `users/${user.uid}/tasks`, movedTask.id);
        await updateDoc(taskRef, { status: finalStatus });
    }
  }

  return (
    <>
      <DragDropContext
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
         {isClient && createPortal(
            <div className="pointer-events-none">
              {activeTask && (
                <TaskCard task={activeTask} isOverlay />
              )}
            </div>,
            document.body
          )}
      </DragDropContext>
      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={editingTask}
      />
    </>
  );
}
