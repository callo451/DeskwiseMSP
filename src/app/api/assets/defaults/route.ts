import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { AssetsService } from '@/lib/services/assets';

export async function GET(request: NextRequest) {
  try {
    const { orgId } = await getAuthContext();
    
    const defaults = await AssetsService.getDefaults(orgId);

    return NextResponse.json(defaults);
  } catch (error) {
    console.error('Error fetching asset defaults:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset defaults' },
      { status: 500 }
    );
  }
}