
'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import type { Project, DashboardStat } from '@/lib/types';
import {
  PlusCircle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  MoreHorizontal,
  FolderOpen,
} from 'lucide-react';
import Link from 'next/link';
import { useSidebar } from '@/components/ui/sidebar';

const StatCard = ({ stat }: { stat: DashboardStat }) => {
  const isIncrease = stat.changeType === 'increase';
  return (
    <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stat.value}</div>
        <p className="text-xs text-muted-foreground flex items-center">
          <span
            className={`flex items-center mr-1 ${
              isIncrease ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {isIncrease ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            {stat.change}
          </span>
          {stat.description}
        </p>
      </CardContent>
    </Card>
  );
};

const ProjectRow = ({ project, isInternalITMode, onDelete }: { 
  project: Project; 
  isInternalITMode: boolean; 
  onDelete: (id: string) => void;
}) => {
  const getStatusVariant = (status: Project['status']) => {
    switch (status) {
      case 'In Progress':
        return 'default';
      case 'Completed':
        return 'outline';
      case 'On Hold':
        return 'secondary';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <TableRow>
      <TableCell>
        <Link
          href={`/projects/${project.id}`}
          className="font-medium text-primary hover:underline"
        >
          {project.name}
        </Link>
        {!isInternalITMode && <div className="text-sm text-muted-foreground">{project.client}</div>}
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex items-center gap-2">
            <Progress value={project.progress} className="w-24" />
            <span className="text-xs text-muted-foreground">{project.progress}%</span>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {new Date(project.endDate).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild><Link href={`/projects/${project.id}`}>View Details</Link></DropdownMenuItem>
            <DropdownMenuItem>Edit Project</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => onDelete(project.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default function ProjectsPage() {
  const { isInternalITMode } = useSidebar();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        console.error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/projects/stats');
      if (response.ok) {
        const data = await response.json();
        // Transform API stats to dashboard stats format
        const transformedStats: DashboardStat[] = [
          {
            title: "Active Projects", 
            value: data.active.toString(), 
            change: `+${Math.round((data.active / data.total) * 100)}%`, 
            changeType: "increase", 
            description: "of total projects"
          },
          {
            title: "Completed Projects", 
            value: data.completed.toString(), 
            change: `${Math.round((data.completed / data.total) * 100)}%`, 
            changeType: "increase", 
            description: "completion rate"
          },
          {
            title: "Average Progress", 
            value: `${data.averageProgress}%`, 
            change: data.averageProgress > 50 ? "+15%" : "-5%", 
            changeType: data.averageProgress > 50 ? "increase" : "decrease", 
            description: "across all projects"
          },
          {
            title: "Budget Utilization", 
            value: `${Math.round((data.usedBudget / data.totalBudget) * 100)}%`, 
            change: "-10%", 
            changeType: "decrease", 
            description: "of total budget"
          },
        ];
        setStats(transformedStats);
      }
    } catch (error) {
      console.error('Error fetching project stats:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project? This will also delete all associated tasks and milestones.')) return;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProjects(prev => prev.filter(project => project.id !== id));
      } else {
        console.error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-6 w-6 text-primary"/>
                Projects
              </CardTitle>
              <CardDescription>
                Manage all client projects, from onboarding to delivery.
              </CardDescription>
            </div>
            <Link href="/projects/new">
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  New Project
                </span>
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project {isInternalITMode ? '' : '/ Client'}</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Progress</TableHead>
                <TableHead className="hidden md:table-cell">End Date</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span>Loading projects...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : projects.length > 0 ? (
                projects.map((project) => (
                  <ProjectRow 
                    key={project.id} 
                    project={project} 
                    isInternalITMode={isInternalITMode}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No projects found. Create your first project to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
