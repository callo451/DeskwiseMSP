import { NextRequest, NextResponse } from 'next/server';
import { BillingService } from '@/lib/services/billing';
import { getAuthContext } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { orgId } = await getAuthContext();
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const timeLogs = await BillingService.getTimeLogsByContract(
      orgId, 
      id, 
      startDate || undefined, 
      endDate || undefined
    );

    return NextResponse.json(timeLogs);
  } catch (error) {
    console.error('Error fetching time logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time logs' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { orgId, userId } = await getAuthContext();
    const { id } = await context.params;
    const timeLogData = await request.json();

    // Validate required fields
    if (!timeLogData.technician || !timeLogData.hours || !timeLogData.description || !timeLogData.date) {
      return NextResponse.json(
        { error: 'Missing required fields: technician, hours, description, date' },
        { status: 400 }
      );
    }

    // Validate hours
    if (timeLogData.hours <= 0) {
      return NextResponse.json(
        { error: 'Hours must be greater than 0' },
        { status: 400 }
      );
    }

    const timeLog = await BillingService.createTimeLog(orgId, {
      ...timeLogData,
      contractId: id,
      isBillable: timeLogData.isBillable ?? true
    }, userId);

    return NextResponse.json(timeLog, { status: 201 });
  } catch (error) {
    console.error('Error creating time log:', error);
    return NextResponse.json(
      { error: 'Failed to create time log' },
      { status: 500 }
    );
  }
}