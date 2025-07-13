import { NextResponse } from 'next/server';
import { TicketService } from '@/lib/services/tickets';

export async function GET() {
  try {
    const stats = await TicketService.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket stats' },
      { status: 500 }
    );
  }
}