import { NextRequest, NextResponse } from 'next/server';
import { AssetsService } from '@/lib/services/assets';

export async function GET(request: NextRequest) {
  try {
    // Extract organization ID from authentication context
    const orgId = 'default-org'; // TODO: Get from authenticated user context
    
    const typeStats = await AssetsService.getTypeStats(orgId);
    
    return NextResponse.json(typeStats);
  } catch (error) {
    console.error('Error fetching type statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch type statistics' },
      { status: 500 }
    );
  }
}