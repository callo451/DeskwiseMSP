import { NextRequest, NextResponse } from 'next/server';
import { ChangeManagementService } from '@/lib/services/change-management';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const riskLevel = searchParams.get('riskLevel');
    const impact = searchParams.get('impact');
    const client = searchParams.get('client');
    const submittedBy = searchParams.get('submittedBy');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const filters: any = {};
    
    if (status) filters.status = status;
    if (riskLevel) filters.riskLevel = riskLevel;
    if (impact) filters.impact = impact;
    if (client) filters.client = client;
    if (submittedBy) filters.submittedBy = submittedBy;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const changeRequests = await ChangeManagementService.getAll(filters);
    return NextResponse.json(changeRequests);
  } catch (error) {
    console.error('Error fetching change requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch change requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.status || !body.riskLevel || !body.impact || !body.submittedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: title, status, riskLevel, impact, submittedBy' },
        { status: 400 }
      );
    }

    const createdBy = body.createdBy || body.submittedBy || 'system'; // TODO: Get from auth context

    // Set default values
    const changeRequest = {
      ...body,
      associatedAssets: body.associatedAssets || [],
      associatedTickets: body.associatedTickets || [],
    };

    const createdChangeRequest = await ChangeManagementService.create(
      changeRequest,
      createdBy
    );

    return NextResponse.json(createdChangeRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating change request:', error);
    return NextResponse.json(
      { error: 'Failed to create change request' },
      { status: 500 }
    );
  }
}