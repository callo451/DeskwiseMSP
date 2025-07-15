import { NextResponse } from 'next/server';
import { ServiceCatalogueService } from '@/lib/services/service-catalogue';
import { getAuthContext } from '@/lib/auth';

export async function GET() {
  try {
    const { orgId } = await getAuthContext();
    
    const tags = await ServiceCatalogueService.getTags(orgId);

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching service tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service tags' },
      { status: 500 }
    );
  }
}