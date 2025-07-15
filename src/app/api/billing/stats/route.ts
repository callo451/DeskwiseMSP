import { NextResponse } from 'next/server';
import { BillingService } from '@/lib/services/billing';
import { getAuthContext } from '@/lib/auth';

export async function GET() {
  try {
    const { orgId } = await getAuthContext();
    
    const stats = await BillingService.getBillingStats(orgId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching billing stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing stats' },
      { status: 500 }
    );
  }
}