import { NextRequest, NextResponse } from 'next/server';
import { InventoryService } from '@/lib/services/inventory';

export async function GET(request: NextRequest) {
  try {
    // Extract organization ID from authentication context
    const orgId = 'default-org'; // TODO: Get from authenticated user context
    
    const locationStats = await InventoryService.getLocationStats(orgId);
    
    return NextResponse.json(locationStats);
  } catch (error) {
    console.error('Error fetching location statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location statistics' },
      { status: 500 }
    );
  }
}