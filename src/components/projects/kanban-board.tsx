
'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { ProjectTask } from '@/lib/types';
import { TaskCard } from './task-card';

interface KanbanBoardProps {
  tasks: ProjectTask[];
  setTasks: React.Dispatch<React.SetStateAction<ProjectTask[]>>;
}

type TaskStatus = 'To-Do' | 'In Progress' | 'Blocked' | 'Done';

const columns: TaskStatus[] = ['To-Do', 'In Progress', 'Blocked', 'Done'];

export function KanbanBoard({ tasks, setTasks }: KanbanBoardProps) {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Do nothing if dropped outside a valid destination
    if (!destination) {
      return;
    }

    // Do nothing if the item is dropped in the same place
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    setTasks(prevTasks => {
        const newTasks = Array.from(prevTasks);
        const movedTask = newTasks.find(t => t.id === draggableId);

        if (movedTask) {
            // Update the status of the moved task
            movedTask.status = destination.droppableId as TaskStatus;
        }
        
        // Return the updated array to set the state
        return newTasks;
    });
  };

  const getColumnTasks = (status: TaskStatus) => {
    return tasks
      .filter(task => task.status === status)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  if (!isBrowser) {
    return null; // Don't render on the server to avoid hydration errors with react-beautiful-dnd
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {columns.map(columnId => (
          <Droppable droppableId={columnId} key={columnId}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`p-4 rounded-lg bg-secondary/50 transition-colors ${
                  snapshot.isDraggingOver ? 'bg-secondary' : ''
                }`}
              >
                <h3 className="font-semibold text-lg mb-4 capitalize">{columnId.replace(/-/g, ' ')} ({getColumnTasks(columnId).length})</h3>
                <div className="space-y-4 min-h-[200px]">
                  {getColumnTasks(columnId).map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <TaskCard task={task} isDragging={snapshot.isDragging} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
