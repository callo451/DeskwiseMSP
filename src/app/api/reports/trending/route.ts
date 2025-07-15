import { NextRequest, NextResponse } from 'next/server';
import { ReportsService } from '@/lib/services/reports';
import { getAuthContext } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { orgId } = await getAuthContext();
    const { searchParams } = new URL(request.url);
    
    const metric = searchParams.get('metric') || 'tickets_by_day';
    const days = parseInt(searchParams.get('days') || '30');

    const trendingData = await ReportsService.getTrendingData(orgId, metric, days);

    return NextResponse.json(trendingData);
  } catch (error) {
    console.error('Error fetching trending data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending data' },
      { status: 500 }
    );
  }
}