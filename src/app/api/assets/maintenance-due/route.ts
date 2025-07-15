import { NextRequest, NextResponse } from 'next/server';
import { AssetsService } from '@/lib/services/assets';

export async function GET(request: NextRequest) {
  try {
    // Extract organization ID from authentication context
    const orgId = 'default-org'; // TODO: Get from authenticated user context
    
    const assetsDue = await AssetsService.getAssetsForMaintenance(orgId);
    
    return NextResponse.json(assetsDue);
  } catch (error) {
    console.error('Error fetching assets due for maintenance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets due for maintenance' },
      { status: 500 }
    );
  }
}