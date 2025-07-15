import { NextRequest, NextResponse } from 'next/server';
import { AssetsService } from '@/lib/services/assets';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract organization ID from authentication context
    const orgId = 'default-org'; // TODO: Get from authenticated user context
    
    // Get days parameter, default to 30 days
    const days = parseInt(searchParams.get('days') || '30');
    
    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Days must be between 1 and 365' },
        { status: 400 }
      );
    }
    
    const assetsExpiring = await AssetsService.getAssetsWithExpiringWarranties(orgId, days);
    
    return NextResponse.json(assetsExpiring);
  } catch (error) {
    console.error('Error fetching assets with expiring warranties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets with expiring warranties' },
      { status: 500 }
    );
  }
}