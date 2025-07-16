import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { InventorySettingsService } from '@/lib/services/inventory-settings';

export async function GET(request: NextRequest) {
  try {
    const { orgId } = await getAuthContext();
    
    const stats = await InventorySettingsService.getStats(orgId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching inventory settings stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory settings stats' },
      { status: 500 }
    );
  }
}