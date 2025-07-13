
'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Users,
  BarChart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
} from 'date-fns';
import { users } from '@/lib/placeholder-data';
import type { ScheduleItem, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ScheduleItemDialog } from '@/components/scheduling/schedule-item-dialog';
import { AppointmentCreationDialog } from '@/components/scheduling/appointment-creation-dialog';
import { WorkloadAnalysisPanel } from '@/components/scheduling/workload-analysis-panel';

const colStartClasses = [
  '',
  'col-start-2',
  'col-start-3',
  'col-start-4',
  'col-start-5',
  'col-start-6',
  'col-start-7',
];

export default function SchedulingPage() {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = React.useState(today);
  const [currentMonth, setCurrentMonth] = React.useState(
    format(today, 'MMM-yyyy')
  );
  const firstDayCurrentMonth = parse(
    currentMonth,
    'MMM-yyyy',
    new Date()
  );

  const [selectedItem, setSelectedItem] = React.useState<ScheduleItem | null>(null);
  const [scheduleItems, setScheduleItems] = React.useState<ScheduleItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAppointmentDialog, setShowAppointmentDialog] = React.useState(false);
  const [showWorkloadPanel, setShowWorkloadPanel] = React.useState(false);

  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });

  function previousMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  }
  
  const technicians = users.filter(u => u.role === 'Technician' || u.role === 'Administrator');
  const [visibleTechnicians, setVisibleTechnicians] = React.useState<string[]>(technicians.map(t => t.id));

  // Fetch schedule items when component mounts or when selected day changes
  useEffect(() => {
    fetchScheduleItems();
  }, [selectedDay, visibleTechnicians]);

  const fetchScheduleItems = async () => {
    try {
      setLoading(true);
      const dateStr = format(selectedDay, 'yyyy-MM-dd');
      const technicianIdsParam = visibleTechnicians.join(',');
      
      const response = await fetch(`/api/schedule/by-date?date=${dateStr}&technicianIds=${technicianIdsParam}`);
      if (response.ok) {
        const data = await response.json();
        setScheduleItems(data);
      } else {
        console.error('Failed to fetch schedule items');
        setScheduleItems([]);
      }
    } catch (error) {
      console.error('Error fetching schedule items:', error);
      setScheduleItems([]);
    } finally {
      setLoading(false);
    }
  };

  const meetingsForDay = scheduleItems.filter((item) =>
    isSameDay(parse(item.start, 'yyyy-MM-dd HH:mm', new Date()), selectedDay) && visibleTechnicians.includes(item.technicianId)
  );

  const handleItemClick = (item: ScheduleItem) => {
    setSelectedItem(item);
  };
  
  const handleDialogClose = () => {
    setSelectedItem(null);
  };
  
  const handleItemSave = async (updatedItem: ScheduleItem) => {
    try {
      const response = await fetch(`/api/schedule/${updatedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedItem),
      });

      if (response.ok) {
        // Refresh the schedule items to show the update
        await fetchScheduleItems();
        setSelectedItem(null);
      } else {
        const errorData = await response.json();
        console.error('Failed to save schedule item:', errorData);
        // You could show an error toast here
      }
    } catch (error) {
      console.error('Error saving schedule item:', error);
    }
  };

  const handleAppointmentSuccess = () => {
    fetchScheduleItems();
    setShowAppointmentDialog(false);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-headline">Scheduling</h1>
            <p className="text-muted-foreground">
              Manage technician schedules, appointments, and dispatching.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Technicians ({visibleTechnicians.length}/{technicians.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Visible Technicians</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {technicians.map(tech => (
                  <DropdownMenuCheckboxItem
                    key={tech.id}
                    checked={visibleTechnicians.includes(tech.id)}
                    onCheckedChange={(checked) => {
                      setVisibleTechnicians(prev => 
                        checked ? [...prev, tech.id] : prev.filter(id => id !== tech.id)
                      )
                    }}
                  >
                    {tech.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" onClick={() => setShowWorkloadPanel(true)}>
              <BarChart className="mr-2 h-4 w-4" />
              Workload Analysis
            </Button>
            <Button onClick={() => setShowAppointmentDialog(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
          </div>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="md:grid md:grid-cols-2 md:divide-x md:divide-border">
              <div className="p-6">
                <div className="flex items-center">
                  <h2 className="flex-auto font-semibold text-foreground">
                    {format(firstDayCurrentMonth, 'MMMM yyyy')}
                  </h2>
                  <button
                    type="button"
                    onClick={previousMonth}
                    className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <span className="sr-only">Previous month</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button
                    onClick={nextMonth}
                    type="button"
                    className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <span className="sr-only">Next month</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-6 grid grid-cols-7 text-center text-xs leading-6 text-muted-foreground">
                  <div>S</div>
                  <div>M</div>
                  <div>T</div>
                  <div>W</div>
                  <div>T</div>
                  <div>F</div>
                  <div>S</div>
                </div>
                <div className="mt-2 grid grid-cols-7 text-sm">
                  {days.map((day, dayIdx) => (
                    <div
                      key={day.toString()}
                      className={cn(
                        dayIdx === 0 && colStartClasses[getDay(day)],
                        'py-1.5'
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedDay(day)}
                        className={cn(
                          'mx-auto flex h-8 w-8 items-center justify-center rounded-full',
                          isEqual(day, selectedDay) && 'text-white',
                          !isEqual(day, selectedDay) &&
                            isToday(day) &&
                            'text-primary',
                          !isEqual(day, selectedDay) &&
                            !isToday(day) &&
                            isSameMonth(day, firstDayCurrentMonth) &&
                            'text-foreground',
                          !isEqual(day, selectedDay) &&
                            !isToday(day) &&
                            !isSameMonth(day, firstDayCurrentMonth) &&
                            'text-muted-foreground',
                          isEqual(day, selectedDay) && isToday(day) && 'bg-primary',
                          isEqual(day, selectedDay) &&
                            !isToday(day) &&
                            'bg-primary/80',
                          !isEqual(day, selectedDay) && 'hover:bg-accent',
                          (isEqual(day, selectedDay) || isToday(day)) &&
                            'font-semibold'
                        )}
                      >
                        <time dateTime={format(day, 'yyyy-MM-dd')}>
                          {format(day, 'd')}
                        </time>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <section className="p-6">
                <h2 className="font-semibold text-foreground">
                  Schedule for{' '}
                  <time dateTime={format(selectedDay, 'yyyy-MM-dd')}>
                    {format(selectedDay, 'MMM dd, yyy')}
                  </time>
                </h2>
                <ol className="mt-4 space-y-1 text-sm leading-6 text-muted-foreground">
                  {loading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center p-2 rounded-xl">
                          <div className="w-2 h-10 bg-gray-200 rounded-full mr-4 animate-pulse"></div>
                          <div className="flex-auto space-y-2">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                          </div>
                          <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  ) : meetingsForDay.length > 0 ? (
                    meetingsForDay.sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime()).map((meeting) => (
                      <Meeting meeting={meeting} key={meeting.id} onClick={() => handleItemClick(meeting)} />
                    ))
                  ) : (
                    <p>No appointments for today.</p>
                  )}
                </ol>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
      {selectedItem && (
        <ScheduleItemDialog 
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={handleDialogClose}
          onSave={handleItemSave}
        />
      )}
      
      <AppointmentCreationDialog
        open={showAppointmentDialog}
        onOpenChange={setShowAppointmentDialog}
        onSuccess={handleAppointmentSuccess}
        initialDate={format(selectedDay, 'yyyy-MM-dd')}
        initialTime="09:00"
      />
      
      <WorkloadAnalysisPanel
        open={showWorkloadPanel}
        onOpenChange={setShowWorkloadPanel}
      />
    </>
  );
}

function Meeting({ meeting, onClick }: { meeting: ScheduleItem, onClick: () => void }) {
  const startDateTime = parse(meeting.start, 'yyyy-MM-dd HH:mm', new Date());
  const endDateTime = parse(meeting.end, 'yyyy-MM-dd HH:mm', new Date());
  const technician = users.find(u => u.id === meeting.technicianId);
  const typeColor = {
    'Ticket': 'bg-blue-500',
    'Meeting': 'bg-purple-500',
    'Time Off': 'bg-gray-500',
    'Appointment': 'bg-green-500',
  }[meeting.type];

  return (
    <li className="flex items-center rounded-xl p-2 group hover:bg-secondary cursor-pointer" onClick={onClick}>
      <div className={cn("w-2 h-10 rounded-full mr-4", typeColor)}></div>
      <div className="flex-auto">
        <p className="font-semibold text-foreground">{meeting.title}</p>
        <p>
          <time dateTime={meeting.start}>{format(startDateTime, 'h:mm a')}</time> -{' '}
          <time dateTime={meeting.end}>{format(endDateTime, 'h:mm a')}</time>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={meeting.type === 'Ticket' ? 'default' : 'secondary'}>{meeting.type}</Badge>
        {technician && (
           <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={technician.avatarUrl} alt={technician.name} data-ai-hint="user avatar" />
                  <AvatarFallback>{technician.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{technician.name}</p>
              </TooltipContent>
            </Tooltip>
           </TooltipProvider>
        )}
      </div>
    </li>
  );
}
