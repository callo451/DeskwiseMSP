import { NextRequest, NextResponse } from 'next/server';
import { ServiceCatalogueService } from '@/lib/services/service-catalogue';
import { getAuthContext } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { orgId, userId } = await getAuthContext();
    const { id } = await context.params;

    const success = await ServiceCatalogueService.restore(id, orgId, userId);

    if (!success) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error restoring service:', error);
    return NextResponse.json(
      { error: 'Failed to restore service' },
      { status: 500 }
    );
  }
}