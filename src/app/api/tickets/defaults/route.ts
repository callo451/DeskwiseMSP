import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { TicketService } from '@/lib/services/tickets';

export async function GET(request: NextRequest) {
  try {
    const { orgId } = await getAuthContext();
    
    const defaults = await TicketService.getDefaults(orgId);

    return NextResponse.json(defaults);
  } catch (error) {
    console.error('Error fetching ticket defaults:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket defaults' },
      { status: 500 }
    );
  }
}