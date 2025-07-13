import { NextRequest, NextResponse } from 'next/server';
import { ScheduleService } from '@/lib/services/scheduling';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const technicianId = searchParams.get('technicianId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!technicianId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: technicianId, startDate, endDate' },
        { status: 400 }
      );
    }

    const workload = await ScheduleService.getTechnicianWorkload(
      technicianId,
      startDate,
      endDate
    );

    return NextResponse.json(workload);
  } catch (error) {
    console.error('Error fetching technician workload:', error);
    return NextResponse.json(
      { error: 'Failed to fetch technician workload' },
      { status: 500 }
    );
  }
}