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
    
    const asset = await AssetsService.getById(id, orgId);
    
    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error fetching asset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();
    
    // Extract organization ID and user from authentication context
    const orgId = 'default-org'; // TODO: Get from authenticated user context
    const updatedBy = 'current-user'; // TODO: Get from authenticated user context
    
    // Validate asset type if provided
    if (data.type) {
      const validTypes = ['Server', 'Workstation', 'Network', 'Printer'];
      if (!validTypes.includes(data.type)) {
        return NextResponse.json(
          { error: `Invalid asset type. Must be one of: ${validTypes.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Validate asset status if provided
    if (data.status) {
      const validStatuses = ['Online', 'Offline', 'Warning'];
      if (!validStatuses.includes(data.status)) {
        return NextResponse.json(
          { error: `Invalid asset status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Convert date strings to Date objects
    const updates = { ...data };
    if (data.purchaseDate) {
      updates.purchaseDate = new Date(data.purchaseDate);
    }
    if (data.warrantyExpiration) {
      updates.warrantyExpiration = new Date(data.warrantyExpiration);
    }
    if (data.maintenanceSchedule?.nextMaintenanceDate) {
      updates.maintenanceSchedule = {
        ...data.maintenanceSchedule,
        nextMaintenanceDate: new Date(data.maintenanceSchedule.nextMaintenanceDate),
        lastMaintenanceDate: data.maintenanceSchedule.lastMaintenanceDate 
          ? new Date(data.maintenanceSchedule.lastMaintenanceDate)
          : undefined
      };
    }

    const asset = await AssetsService.update(id, orgId, updates, updatedBy);
    
    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json(
      { error: 'Failed to update asset' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Extract organization ID and user from authentication context
    const orgId = 'default-org'; // TODO: Get from authenticated user context
    const deletedBy = 'current-user'; // TODO: Get from authenticated user context
    
    const success = await AssetsService.delete(id, orgId, deletedBy);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    );
  }
}