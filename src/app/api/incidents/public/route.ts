import { NextRequest, NextResponse } from 'next/server';
import { IncidentService } from '@/lib/services/incidents';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const incidents = activeOnly 
      ? await IncidentService.getActive()
      : await IncidentService.getPublished();

    return NextResponse.json(incidents);
  } catch (error) {
    console.error('Error fetching public incidents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public incidents' },
      { status: 500 }
    );
  }
}