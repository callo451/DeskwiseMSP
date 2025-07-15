import { NextRequest, NextResponse } from 'next/server';
import { InventoryService } from '@/lib/services/inventory';

export async function GET(request: NextRequest) {
  try {
    // Extract organization ID from authentication context
    const orgId = 'default-org'; // TODO: Get from authenticated user context
    
    const stats = await InventoryService.getStats(orgId);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching inventory statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory statistics' },
      { status: 500 }
    );
  }
}