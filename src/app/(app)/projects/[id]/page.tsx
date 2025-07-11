
'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { projects, users } from '@/lib/placeholder-data';
import type { Project, ProjectTask, ProjectMilestone } from '@/lib/types';
import {
  ChevronLeft,
  DollarSign,
  Calendar,
  Users as UsersIcon,
  Flag,
  CheckCircle2,
  ListTodo,
  MoreVertical,
  Circle,
  Clock,
  Link as LinkIcon,
  LayoutGrid,
  List,
} from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KanbanBoard } from '@/components/projects/kanban-board';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


const DetailRow = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: React.ReactNode;
  icon?: React.ElementType;
}) => (
  <div className="flex justify-between items-center py-3 text-sm">
    <div className="flex items-center gap-2 text-muted-foreground">
      {Icon && <Icon className="h-4 w-4" />}
      <span>{label}</span>
    </div>
    <div className="font-medium text-right">{value}</div>
  </div>
);

const TaskRow = ({ task }: { task: ProjectTask }) => {
  const assignee = users.find((u) => u.id === task.assigneeId);

  const getStatusVariant = (status: ProjectTask['status']) => {
    switch (status) {
      case 'Done':
        return 'outline';
      case 'In Progress':
        return 'default';
      case 'Blocked':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{task.name}</TableCell>
      <TableCell>
        <Badge variant={getStatusVariant(task.status)}>{task.status}</Badge>
      </TableCell>
      <TableCell>
        {assignee && (
           <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-7 w-7">
                  <AvatarImage src={assignee.avatarUrl} alt={assignee.name} data-ai-hint="user avatar" />
                  <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent><p>{assignee.name}</p></TooltipContent>
            </Tooltip>
           </TooltipProvider>
        )}
      </TableCell>
      <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

const MilestoneRow = ({ milestone }: { milestone: ProjectMilestone }) => (
    <TableRow>
        <TableCell>
            <div className="flex items-center gap-3">
                {milestone.status === 'Completed' ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                <span className="font-medium">{milestone.name}</span>
            </div>
        </TableCell>
        <TableCell>{new Date(milestone.dueDate).toLocaleDateString()}</TableCell>
        <TableCell>
            {milestone.isBillable && <Badge variant="secondary">Billable</Badge>}
        </TableCell>
    </TableRow>
)

export default function ProjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const project = projects.find((p) => p.id === params.id);
  
  const [tasks, setTasks] = useState(project?.tasks || []);
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>([]);
  
  if (!project) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Not Found</CardTitle>
          <CardDescription>
            The requested project could not be found.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  const handleAssigneeFilterChange = (assigneeId: string, checked: boolean) => {
    setAssigneeFilter(prev =>
      checked ? [...prev, assigneeId] : prev.filter(id => id !== assigneeId)
    );
  };

  const projectUsers = users.filter(user => 
    project.tasks.some(task => task.assigneeId === user.id)
  );

  const filteredTasks = tasks.filter(task => 
    assigneeFilter.length === 0 || assigneeFilter.includes(task.assigneeId)
  );

  const getStatusVariant = (status: Project['status']) => {
    switch (status) {
      case 'In Progress': return 'default';
      case 'Completed': return 'outline';
      case 'On Hold': return 'secondary';
      case 'Cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button asChild variant="outline" size="icon" className="h-8 w-8">
              <Link href="/projects">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back to projects</span>
              </Link>
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold font-headline">
              {project.name}
            </h1>
            <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
          </div>
          <p className="text-muted-foreground ml-12">
            For{' '}
            <Link
              href={`/clients/${project.clientId}`}
              className="font-medium text-primary hover:underline"
            >
              {project.client}
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Edit Project</Button>
          <Button>New Task</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border -mt-2">
                <DetailRow label="Progress" value={<div className="flex items-center gap-2"><Progress value={project.progress} className="w-24" /><span>{project.progress}%</span></div>} />
                <DetailRow label="Start Date" icon={Calendar} value={new Date(project.startDate).toLocaleDateString()} />
                <DetailRow label="End Date" icon={Calendar} value={new Date(project.endDate).toLocaleDateString()} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Budget</CardTitle>
            </CardHeader>
             <CardContent className="divide-y divide-border -mt-2">
                <DetailRow label="Total Budget" icon={DollarSign} value={formatCurrency(project.budget.total)} />
                <DetailRow label="Budget Used" icon={DollarSign} value={formatCurrency(project.budget.used)} />
                <DetailRow label="Remaining" icon={DollarSign} value={formatCurrency(project.budget.total - project.budget.used)} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Flag className="h-5 w-5" />Milestones</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableBody>
                        {project.milestones.map(m => <MilestoneRow key={m.id} milestone={m} />)}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="board">
            <div className="flex justify-between items-center mb-4">
               <TabsList>
                  <TabsTrigger value="board"><LayoutGrid className="mr-2 h-4 w-4" />Board</TabsTrigger>
                  <TabsTrigger value="list"><List className="mr-2 h-4 w-4" />List</TabsTrigger>
                </TabsList>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <UsersIcon className="mr-2 h-4 w-4" />
                        Assignees ({assigneeFilter.length || 'All'})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Filter by Assignee</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {projectUsers.map(user => (
                        <DropdownMenuCheckboxItem
                          key={user.id}
                          checked={assigneeFilter.includes(user.id)}
                          onCheckedChange={(checked) => handleAssigneeFilterChange(user.id, !!checked)}
                        >
                          {user.name}
                        </DropdownMenuCheckboxItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setAssigneeFilter([])}>Clear Filters</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <TabsContent value="board">
              <KanbanBoard tasks={filteredTasks} setTasks={setTasks} />
            </TabsContent>
            <TabsContent value="list">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ListTodo className="h-5 w-5" />Project Tasks</CardTitle>
                  <CardDescription>
                    All tasks associated with this project.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTasks.map((task) => (
                        <TaskRow key={task.id} task={task} />
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
