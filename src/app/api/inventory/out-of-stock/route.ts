import { NextRequest, NextResponse } from 'next/server';
import { InventoryService } from '@/lib/services/inventory';

export async function GET(request: NextRequest) {
  try {
    // Extract organization ID from authentication context
    const orgId = 'default-org'; // TODO: Get from authenticated user context
    
    const outOfStockItems = await InventoryService.getOutOfStockItems(orgId);
    
    return NextResponse.json(outOfStockItems);
  } catch (error) {
    console.error('Error fetching out of stock items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch out of stock items' },
      { status: 500 }
    );
  }
}