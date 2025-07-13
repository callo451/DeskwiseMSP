import { NextRequest, NextResponse } from 'next/server';
import { ScheduleService } from '@/lib/services/scheduling';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const date = searchParams.get('date');
    const technicianIds = searchParams.get('technicianIds')?.split(',').filter(Boolean);
    
    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Get schedule items for the specific date
    const startOfDay = `${date} 00:00`;
    const endOfDay = `${date} 23:59`;
    
    const scheduleItems = await ScheduleService.getByDateRange(
      startOfDay,
      endOfDay,
      technicianIds
    );
    
    return NextResponse.json(scheduleItems);
  } catch (error) {
    console.error('Error fetching schedule items by date:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule items' },
      { status: 500 }
    );
  }
}