import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { TicketSettingsService } from '@/lib/services/ticket-settings';

export async function GET(request: NextRequest) {
  try {
    const { orgId } = await getAuthContext();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'queues') {
      const queues = await TicketSettingsService.getAllQueues(orgId);
      return NextResponse.json({ queues });
    } else if (type === 'statuses') {
      const statuses = await TicketSettingsService.getAllStatuses(orgId);
      return NextResponse.json({ statuses });
    } else if (type === 'priorities') {
      const priorities = await TicketSettingsService.getAllPriorities(orgId);
      return NextResponse.json({ priorities });
    } else {
      // Return all for ticket creation forms
      const [queues, statuses, priorities] = await Promise.all([
        TicketSettingsService.getAllQueues(orgId),
        TicketSettingsService.getAllStatuses(orgId),
        TicketSettingsService.getAllPriorities(orgId)
      ]);
      return NextResponse.json({ queues, statuses, priorities });
    }
  } catch (error) {
    console.error('Error fetching ticket settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket settings' },
      { status: 500 }
    );
  }
}