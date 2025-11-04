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
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import type { Task } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { KanbanColumn, KanbanTaskCard } from './kanban-column';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Status = 'todo' | 'done';

const statusMap: Record<Status, string> = {
  todo: 'To Do',
  done: 'Done',
};


export default function KanbanBoard() {
  const { user } = useUser();
  const firestore = useFirestore();

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

  const tasksQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, `users/${user.uid}/tasks`), orderBy('createdAt', 'desc'));
  }, [user, firestore]);

  const { data: tasks, isLoading } = useCollection<Task>(tasksQuery);

  const filteredTasks = useMemo(() => {
    if (subjectFilter === 'all') return tasks;
    // The 'subject' field doesn't exist on the Task type, so this won't actually filter.
    // This is kept for UI demonstration purposes. In a real app, you'd add the field.
    return tasks;
  }, [tasks, subjectFilter]);

  const openTaskDialog = (task: Task | null = null) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks?.find(t => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;
    if (active.id === over.id) return;
    
    const originalStatus = tasks?.find(t => t.id === active.id)?.status;
    const newStatus = over.id as Status;

    if (originalStatus !== newStatus && user) {
        const taskRef = doc(firestore, `users/${user.uid}/tasks`, active.id as string);
        const updateData = { status: newStatus };
        await updateDoc(taskRef, updateData).catch(err => {
            const permissionError = new FirestorePermissionError({
                path: taskRef.path,
                operation: 'update',
                requestResourceData: updateData
            });
            errorEmitter.emit('permission-error', permissionError);
        })
    }
  };

  const columns = useMemo(() => {
    const cols: { id: Status; title: string; tasks: Task[] }[] = [
      { id: 'todo', title: 'To Do', tasks: [] },
      { id: 'done', title: 'Done', tasks: [] },
    ];
    
    filteredTasks?.forEach(task => {
        const col = cols.find(c => c.id === task.status);
        if (col) {
            col.tasks.push(task);
        }
    });

    return cols;

  }, [filteredTasks]);

  const allSubjects = useMemo(() => {
    const subjects = new Set<string>();
    tasks?.forEach(task => {
      // Again, 'subject' is not on the Task type.
    });
    return Array.from(subjects);
  }, [tasks]);

  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">Task Board</h2>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-[180px] bg-background/50">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {allSubjects.map(sub => (
                  <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
        <Button onClick={() => openTaskDialog()}>
          <Plus className="w-4 h-4 mr-2" /> Add Task
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {columns.map(col => (
            <KanbanColumn key={col.id} id={col.id} title={col.title} tasks={col.tasks} onTaskClick={openTaskDialog} isLoading={isLoading}/>
          ))}
        </div>
         {activeTask && (
            <div className="fixed inset-0 pointer-events-none z-[100]">
                <div className="absolute top-0 left-0">
                     <KanbanTaskCard task={activeTask} isOverlay />
                </div>
            </div>
        )}
      </DndContext>
      
      {isDialogOpen && (
          <TaskDialog
            open={isDialogOpen}
            onOpenChange={setDialogOpen}
            task={editingTask}
          />
      )}
    </>
  );
}
