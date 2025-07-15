import { NextRequest, NextResponse } from 'next/server';
import { InventoryService } from '@/lib/services/inventory';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { deployedTo, notes } = await request.json();
    
    // Extract organization ID and user from authentication context
    const orgId = 'default-org'; // TODO: Get from authenticated user context
    const deployedBy = 'current-user'; // TODO: Get from authenticated user context
    
    // Validate required fields
    if (!deployedTo || typeof deployedTo !== 'string') {
      return NextResponse.json(
        { error: 'deployedTo is required and must be a string (asset ID or client name)' },
        { status: 400 }
      );
    }

    const item = await InventoryService.deployAsset(
      id,
      orgId,
      deployedTo,
      deployedBy,
      notes
    );
    
    if (!item) {
      return NextResponse.json(
        { error: 'Inventory item not found or out of stock' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error deploying inventory item as asset:', error);
    return NextResponse.json(
      { error: 'Failed to deploy inventory item as asset' },
      { status: 500 }
    );
  }
}