import { NextRequest, NextResponse } from 'next/server';
import { AssetsService } from '@/lib/services/assets';

export async function GET(request: NextRequest) {
  try {
    // Extract organization ID from authentication context
    const orgId = 'default-org'; // TODO: Get from authenticated user context
    
    const stats = await AssetsService.getStats(orgId);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching asset statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset statistics' },
      { status: 500 }
    );
  }
}