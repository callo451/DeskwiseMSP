import { NextResponse } from 'next/server';
import { ServiceCatalogueService } from '@/lib/services/service-catalogue';
import { getAuthContext } from '@/lib/auth';

export async function GET() {
  try {
    const { orgId } = await getAuthContext();
    
    const stats = await ServiceCatalogueService.getStats(orgId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching service catalogue stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service catalogue statistics' },
      { status: 500 }
    );
  }
}