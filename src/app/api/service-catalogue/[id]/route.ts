import { NextRequest, NextResponse } from 'next/server';
import { ServiceCatalogueService } from '@/lib/services/service-catalogue';
import { getAuthContext } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { orgId } = await getAuthContext();
    const { id } = await context.params;
    
    const service = await ServiceCatalogueService.getById(id, orgId);

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { orgId, userId } = await getAuthContext();
    const { id } = await context.params;
    const updates = await request.json();

    // Validate price if being updated
    if (updates.price != null && updates.price < 0) {
      return NextResponse.json(
        { error: 'Price must be non-negative' },
        { status: 400 }
      );
    }

    // Validate type if being updated
    if (updates.type && !['Fixed', 'Recurring', 'Hourly'].includes(updates.type)) {
      return NextResponse.json(
        { error: 'Type must be Fixed, Recurring, or Hourly' },
        { status: 400 }
      );
    }

    const service = await ServiceCatalogueService.update(id, orgId, updates, userId);

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { orgId, userId } = await getAuthContext();
    const { id } = await context.params;

    const success = await ServiceCatalogueService.delete(id, orgId, userId);

    if (!success) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}