import { NextRequest, NextResponse } from 'next/server';
import { ScheduleService } from '@/lib/services/scheduling';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.technicianId || !body.duration || !body.preferredDate) {
      return NextResponse.json(
        { error: 'Missing required fields: technicianId, duration, preferredDate' },
        { status: 400 }
      );
    }

    const optimalSlot = await ScheduleService.findOptimalTimeSlot(
      body.technicianId,
      body.duration,
      body.preferredDate,
      body.timePreference || 'any'
    );

    if (!optimalSlot) {
      return NextResponse.json(
        { message: 'No available time slot found', slot: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      slot: optimalSlot,
      message: 'Optimal time slot found'
    });
  } catch (error) {
    console.error('Error finding optimal time slot:', error);
    return NextResponse.json(
      { error: 'Failed to find optimal time slot' },
      { status: 500 }
    );
  }
}