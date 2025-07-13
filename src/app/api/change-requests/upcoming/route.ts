import { NextRequest, NextResponse } from 'next/server';
import { ChangeManagementService } from '@/lib/services/change-management';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    const upcomingChanges = await ChangeManagementService.getUpcoming(days);
    return NextResponse.json(upcomingChanges);
  } catch (error) {
    console.error('Error fetching upcoming change requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upcoming change requests' },
      { status: 500 }
    );
  }
}