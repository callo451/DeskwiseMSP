import { NextResponse } from 'next/server';
import { ServiceCatalogueService } from '@/lib/services/service-catalogue';
import { getAuthContext } from '@/lib/auth';

export async function GET() {
  try {
    const { orgId } = await getAuthContext();
    
    const categories = await ServiceCatalogueService.getCategories(orgId);

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching service categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service categories' },
      { status: 500 }
    );
  }
}