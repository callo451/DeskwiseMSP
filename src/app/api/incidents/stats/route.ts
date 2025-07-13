import { NextRequest, NextResponse } from 'next/server';
import { IncidentService } from '@/lib/services/incidents';

export async function GET(request: NextRequest) {
  try {
    const stats = await IncidentService.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching incident stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incident stats' },
      { status: 500 }
    );
  }
}