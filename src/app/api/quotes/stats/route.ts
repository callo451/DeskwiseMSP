import { NextResponse } from 'next/server';
import { QuotesService } from '@/lib/services/quotes';
import { getAuthContext } from '@/lib/auth';

export async function GET() {
  try {
    const { orgId } = await getAuthContext();
    
    const stats = await QuotesService.getStats(orgId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching quote stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote stats' },
      { status: 500 }
    );
  }
}