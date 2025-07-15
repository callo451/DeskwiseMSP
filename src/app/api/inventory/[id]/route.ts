import { NextRequest, NextResponse } from 'next/server';
import { InventoryService } from '@/lib/services/inventory';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Extract organization ID from authentication context
    const orgId = 'default-org'; // TODO: Get from authenticated user context
    
    const item = await InventoryService.getById(id, orgId);
    
    if (!item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory item' },
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
    
    // Validate category if provided
    if (data.category) {
      const validCategories = ['Hardware', 'Software License', 'Consumable', 'Part'];
      if (!validCategories.includes(data.category)) {
        return NextResponse.json(
          { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Validate numeric fields if provided
    if (data.quantity !== undefined && (typeof data.quantity !== 'number' || data.quantity < 0)) {
      return NextResponse.json(
        { error: 'Quantity must be a non-negative number' },
        { status: 400 }
      );
    }

    if (data.reorderPoint !== undefined && (typeof data.reorderPoint !== 'number' || data.reorderPoint < 0)) {
      return NextResponse.json(
        { error: 'Reorder point must be a non-negative number' },
        { status: 400 }
      );
    }

    if (data.unitCost !== undefined && (typeof data.unitCost !== 'number' || data.unitCost < 0)) {
      return NextResponse.json(
        { error: 'Unit cost must be a non-negative number' },
        { status: 400 }
      );
    }

    // Convert date strings to Date objects
    const updates = { ...data };
    if (data.warrantyInfo?.startDate) {
      updates.warrantyInfo = {
        ...data.warrantyInfo,
        startDate: new Date(data.warrantyInfo.startDate),
        endDate: data.warrantyInfo.endDate ? new Date(data.warrantyInfo.endDate) : undefined
      };
    }
    if (data.purchaseInfo?.purchaseDate) {
      updates.purchaseInfo = {
        ...data.purchaseInfo,
        purchaseDate: new Date(data.purchaseInfo.purchaseDate)
      };
    }

    const item = await InventoryService.update(id, orgId, updates, updatedBy);
    
    if (!item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
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
    
    const success = await InventoryService.delete(id, orgId, deletedBy);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
}