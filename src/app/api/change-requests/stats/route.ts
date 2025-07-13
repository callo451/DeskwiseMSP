import { NextRequest, NextResponse } from 'next/server';
import { ChangeManagementService } from '@/lib/services/change-management';

export async function GET(request: NextRequest) {
  try {
    const stats = await ChangeManagementService.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching change request stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch change request stats' },
      { status: 500 }
    );
  }
}