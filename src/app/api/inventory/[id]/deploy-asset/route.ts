import { NextRequest, NextResponse } from 'next/server';
import { InventoryService } from '@/lib/services/inventory';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { assetName, client, assetType, ipAddress, macAddress, location, notes } = await request.json();
    
    // Extract organization ID and user from authentication context
    const orgId = 'default-org'; // TODO: Get from authenticated user context
    const deployedBy = 'current-user'; // TODO: Get from authenticated user context
    
    // Validate required fields
    if (!assetName || typeof assetName !== 'string') {
      return NextResponse.json(
        { error: 'Asset name is required' },
        { status: 400 }
      );
    }

    if (!client || typeof client !== 'string') {
      return NextResponse.json(
        { error: 'Client is required' },
        { status: 400 }
      );
    }

    if (!assetType || !['Server', 'Workstation', 'Network', 'Printer'].includes(assetType)) {
      return NextResponse.json(
        { error: 'Valid asset type is required (Server, Workstation, Network, Printer)' },
        { status: 400 }
      );
    }

    // Deploy inventory item as asset and create the actual asset record
    const [updatedInventoryItem] = await Promise.all([
      InventoryService.deployAsset(id, orgId, `Asset: ${assetName}`, deployedBy, notes),
      // Create asset record using dynamic import to avoid circular dependency
      (async () => {
        try {
          const { AssetsService } = await import('@/lib/services/assets');
          return await AssetsService.createFromInventoryDeployment(
            orgId,
            id,
            {
              name: assetName,
              client,
              type: assetType,
              ipAddress,
              macAddress,
              location,
              notes
            },
            deployedBy
          );
        } catch (error) {
          console.error('Failed to create asset from inventory deployment:', error);
          // Continue with inventory deployment even if asset creation fails
          return null;
        }
      })()
    ]);
    
    if (!updatedInventoryItem) {
      return NextResponse.json(
        { error: 'Inventory item not found or out of stock' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      inventoryItem: updatedInventoryItem,
      message: 'Inventory item deployed as asset successfully'
    });
  } catch (error) {
    console.error('Error deploying inventory item as asset:', error);
    return NextResponse.json(
      { error: 'Failed to deploy inventory item as asset' },
      { status: 500 }
    );
  }
}