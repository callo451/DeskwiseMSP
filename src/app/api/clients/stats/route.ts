import { NextResponse } from 'next/server';
import { ClientsService } from '@/lib/services/clients';
import { getAuthContext } from '@/lib/auth';

export async function GET() {
  try {
    const { orgId } = await getAuthContext();
    
    const stats = await ClientsService.getStats(orgId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching client stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client stats' },
      { status: 500 }
    );
  }
}