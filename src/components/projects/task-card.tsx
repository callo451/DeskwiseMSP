
'use client';

import { ProjectTask } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { users } from '@/lib/placeholder-data';
import { format, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

interface TaskCardProps {
  task: ProjectTask;
  isDragging: boolean;
}

export function TaskCard({ task, isDragging }: TaskCardProps) {
  const assignee = users.find(u => u.id === task.assigneeId);
  const dueDate = new Date(task.dueDate);
  const isOverdue = isPast(dueDate) && !isToday(dueDate);

  const getPriorityVariant = (priority: ProjectTask['priority']) => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow", isDragging && "shadow-xl rotate-3")}>
      <CardHeader className="p-4">
        <CardTitle className="text-base font-medium">{task.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {task.priority && <Badge variant={getPriorityVariant(task.priority)}>{task.priority}</Badge>}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className={cn("flex items-center gap-1 text-xs", isOverdue ? "text-destructive font-semibold" : "text-muted-foreground")}>
          <CalendarIcon className="h-4 w-4" />
          <span>{format(dueDate, 'MMM d')}</span>
        </div>
        {assignee && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Avatar className="h-7 w-7">
                  <AvatarImage src={assignee.avatarUrl} alt={assignee.name} data-ai-hint="user avatar" />
                  <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{assignee.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardFooter>
    </Card>
  );
}
