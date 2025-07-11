
'use client';

import React from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { projects, projectPageStats } from '@/lib/placeholder-data';
import type { Project, DashboardStat } from '@/lib/types';
import {
  PlusCircle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
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

const ProjectRow = ({ project, isInternalITMode }: { project: Project, isInternalITMode: boolean }) => {
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
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/projects/${project.id}`}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default function ProjectsPage() {
  const { isInternalITMode } = useSidebar();
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {projectPageStats.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Projects</CardTitle>
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
              {projects.map((project) => (
                <ProjectRow key={project.id} project={project} isInternalITMode={isInternalITMode} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
