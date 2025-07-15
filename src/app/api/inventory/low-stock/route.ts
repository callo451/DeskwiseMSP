import { NextRequest, NextResponse } from 'next/server';
import { InventoryService } from '@/lib/services/inventory';

export async function GET(request: NextRequest) {
  try {
    // Extract organization ID from authentication context
    const orgId = 'default-org'; // TODO: Get from authenticated user context
    
    const lowStockItems = await InventoryService.getLowStockItems(orgId);
    
    return NextResponse.json(lowStockItems);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch low stock items' },
      { status: 500 }
    );
  }
}