import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { AssetSettingsService } from '@/lib/services/asset-settings';

export async function GET(request: NextRequest) {
  try {
    const { orgId } = await getAuthContext();
    
    const stats = await AssetSettingsService.getStats(orgId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching asset settings stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset settings stats' },
      { status: 500 }
    );
  }
}