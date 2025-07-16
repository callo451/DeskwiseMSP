import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { TicketSettingsService } from '@/lib/services/ticket-settings';

export async function GET(request: NextRequest) {
  try {
    const { orgId } = await getAuthContext();
    
    const stats = await TicketSettingsService.getStats(orgId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching ticket settings stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket settings statistics' },
      { status: 500 }
    );
  }
}