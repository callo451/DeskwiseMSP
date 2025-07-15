import { NextRequest, NextResponse } from 'next/server';
import { InventoryService } from '@/lib/services/inventory';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Extract organization ID and user from authentication context
    const orgId = 'default-org'; // TODO: Get from authenticated user context
    const restoredBy = 'current-user'; // TODO: Get from authenticated user context
    
    const item = await InventoryService.restore(id, orgId, restoredBy);
    
    if (!item) {
      return NextResponse.json(
        { error: 'Inventory item not found or not deleted' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error restoring inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to restore inventory item' },
      { status: 500 }
    );
  }
}