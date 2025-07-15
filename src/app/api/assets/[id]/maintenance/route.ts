import { NextRequest, NextResponse } from 'next/server';
import { AssetsService } from '@/lib/services/assets';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Extract organization ID from authentication context
    const orgId = 'default-org'; // TODO: Get from authenticated user context
    
    const maintenanceRecords = await AssetsService.getMaintenanceRecords(orgId, id);
    
    return NextResponse.json(maintenanceRecords);
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch maintenance records' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();
    
    // Extract organization ID and user from authentication context
    const orgId = 'default-org'; // TODO: Get from authenticated user context
    const createdBy = 'current-user'; // TODO: Get from authenticated user context
    
    // Validate required fields
    if (!data.maintenanceType || !data.description || !data.performedBy || !data.performedAt) {
      return NextResponse.json(
        { error: 'Missing required fields: maintenanceType, description, performedBy, performedAt' },
        { status: 400 }
      );
    }

    // Validate maintenance type
    const validTypes = ['preventive', 'corrective', 'emergency'];
    if (!validTypes.includes(data.maintenanceType)) {
      return NextResponse.json(
        { error: `Invalid maintenance type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const maintenanceData = {
      assetId: id,
      maintenanceType: data.maintenanceType,
      description: data.description,
      performedBy: data.performedBy,
      performedAt: new Date(data.performedAt),
      nextScheduledDate: data.nextScheduledDate ? new Date(data.nextScheduledDate) : undefined,
      cost: data.cost,
      notes: data.notes
    };

    const maintenanceRecord = await AssetsService.createMaintenanceRecord(orgId, maintenanceData, createdBy);
    
    return NextResponse.json(maintenanceRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    return NextResponse.json(
      { error: 'Failed to create maintenance record' },
      { status: 500 }
    );
  }
}