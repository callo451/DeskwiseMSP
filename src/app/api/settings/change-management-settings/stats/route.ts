import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { ChangeManagementSettingsService } from '@/lib/services/change-management-settings';

export async function GET(request: NextRequest) {
  try {
    const { orgId } = await getAuthContext();
    
    const stats = await ChangeManagementSettingsService.getStats(orgId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching change management settings stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch change management settings stats' },
      { status: 500 }
    );
  }
}