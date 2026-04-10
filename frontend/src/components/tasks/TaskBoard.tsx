// BONUS: Drag-and-drop with keyboard accessibility — status changes via column reordering
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { type Task } from '@/api/tasks';
import { TaskCard } from './TaskCard';
import { EditTaskDialog } from './EditTaskDialog';
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { StatusBadge } from './StatusBadge';

const columns: { id: Task['status']; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
];

interface Props {
  tasks: Task[];
  projectId: string;
}

export function TaskBoard({ tasks, projectId }: Props) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const updateTask = useUpdateTask(projectId);
  const deleteTask = useDeleteTask(projectId);

  const grouped = {
    todo: tasks.filter((t) => t.status === 'todo'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    done: tasks.filter((t) => t.status === 'done'),
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as Task['status'];
    const taskId = result.draggableId;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update with error rollback
    updateTask.mutate({ taskId, status: newStatus });
  };

  const handleDelete = (taskId: string) => {
    if (confirm('Delete this task?')) {
      deleteTask.mutate(taskId);
    }
  };

  return (
    <>
      {/* Desktop: Kanban columns */}
      <div className="hidden md:block">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-3 gap-4">
            {columns.map((col) => (
              <div key={col.id} className="rounded-lg bg-[hsl(var(--muted))] p-3">
                <div className="mb-3 flex items-center justify-between">
                  <StatusBadge status={col.id} />
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{grouped[col.id].length}</span>
                </div>
                <Droppable droppableId={col.id}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 min-h-[100px]">
                      {grouped[col.id].map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                              <TaskCard task={task} onEdit={setEditingTask} onDelete={handleDelete} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Mobile: List view */}
      <div className="space-y-2 md:hidden">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={setEditingTask} onDelete={handleDelete} />
        ))}
      </div>

      {editingTask && (
        <EditTaskDialog task={editingTask} projectId={projectId} onClose={() => setEditingTask(null)} />
      )}
    </>
  );
}
