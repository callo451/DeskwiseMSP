import { NextRequest, NextResponse } from 'next/server';
import { TicketService } from '@/lib/services/tickets';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assignee = searchParams.get('assignee') || 'Alice'; // Default to Alice for now
    
    const tickets = await TicketService.getAll({ assignee });
    
    const openTickets = tickets.filter(t => ['Open', 'In Progress', 'On Hold'].includes(t.status));
    const overdueTickets = tickets.filter(t => 
      ['Open', 'In Progress'].includes(t.status) && 
      t.sla?.responseDue && 
      new Date(t.sla.responseDue) < new Date() &&
      !t.sla.respondedAt
    );
    
    // Calculate total billable hours for the current week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const totalHours = tickets.reduce((total, ticket) => {
      if (ticket.timeLogs) {
        return total + ticket.timeLogs
          .filter(log => {
            const logDate = new Date(log.date);
            return logDate >= startOfWeek && log.technician === assignee;
          })
          .reduce((sum, log) => sum + log.hours, 0);
      }
      return total;
    }, 0);

    const stats = [
      {
        title: "My Open Tickets",
        value: openTickets.length.toString(),
        change: "+1",
        changeType: "increase" as const,
        description: "since yesterday"
      },
      {
        title: "My Overdue Tickets",
        value: overdueTickets.length.toString(),
        change: overdueTickets.length > 0 ? "+1" : "-1",
        changeType: overdueTickets.length > 0 ? "increase" as const : "decrease" as const,
        description: "since yesterday"
      },
      {
        title: "My CSAT Score",
        value: "92%",
        change: "-1%",
        changeType: "decrease" as const,
        description: "this month"
      },
      {
        title: "My Logged Hours (Week)",
        value: `${totalHours.toFixed(1)}h`,
        change: `+${Math.max(0, totalHours - 28).toFixed(1)}h`,
        changeType: "increase" as const,
        description: "from last week"
      }
    ];

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching personal stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personal stats' },
      { status: 500 }
    );
  }
}