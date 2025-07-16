import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { InventoryService } from '@/lib/services/inventory';
import { InventorySettingsService } from '@/lib/services/inventory-settings';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { orgId, userId } = await getAuthContext();
    const { id } = await context.params;
    const { assetName, client, assetType, ipAddress, macAddress, location, notes } = await request.json();
    
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

    // Get inventory item details to enrich asset creation
    const inventoryItem = await InventoryService.getById(id, orgId);
    if (!inventoryItem) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    // Get category settings to help with asset creation
    const categories = await InventorySettingsService.getCategoriesForAssetCreation(orgId);
    const matchingCategory = categories.find(cat => cat.name === inventoryItem.category);

    // Deploy inventory item as asset and create the actual asset record
    const [updatedInventoryItem] = await Promise.all([
      InventoryService.deployAsset(id, orgId, `Asset: ${assetName}`, userId, notes),
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
              notes: notes || `Deployed from inventory: ${inventoryItem.name} (SKU: ${inventoryItem.sku})`,
              // Enhanced fields from inventory
              serialNumber: inventoryItem.serialNumbers?.[0],
              purchaseDate: inventoryItem.purchaseInfo?.purchaseDate,
              warrantyExpiration: inventoryItem.warrantyInfo?.endDate,
              // Use category defaults if available
              ...(matchingCategory && {
                depreciation: {
                  method: 'straight_line' as const,
                  usefulLife: 5,
                  salvageValue: matchingCategory.depreciationRate || 0,
                  currentValue: inventoryItem.unitCost || 0
                }
              })
            },
            userId
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