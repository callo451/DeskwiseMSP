import { NextRequest, NextResponse } from 'next/server';
import { InventoryService } from '@/lib/services/inventory';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { quantity, reason, reference } = await request.json();
    
    // Extract organization ID and user from authentication context
    const orgId = 'default-org'; // TODO: Get from authenticated user context
    const performedBy = 'current-user'; // TODO: Get from authenticated user context
    
    // Validate required fields
    if (typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json(
        { error: 'Quantity must be a non-negative number' },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== 'string') {
      return NextResponse.json(
        { error: 'Reason is required and must be a string' },
        { status: 400 }
      );
    }

    const item = await InventoryService.adjustStock(
      id,
      orgId,
      quantity,
      reason,
      performedBy,
      reference
    );
    
    if (!item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error adjusting inventory stock:', error);
    return NextResponse.json(
      { error: 'Failed to adjust inventory stock' },
      { status: 500 }
    );
  }
}