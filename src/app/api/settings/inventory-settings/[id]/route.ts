import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { InventorySettingsService } from '@/lib/services/inventory-settings';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { orgId } = await getAuthContext();
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'category' | 'location' | 'supplier';

    if (!type) {
      return NextResponse.json(
        { error: 'Missing type parameter' },
        { status: 400 }
      );
    }

    let data;
    switch (type) {
      case 'category':
        data = await InventorySettingsService.getCategoryById(id, orgId);
        break;
      case 'location':
        // Location doesn't have a getById method, so we'll return null
        data = null;
        break;
      case 'supplier':
        // Supplier doesn't have a getById method, so we'll return null
        data = null;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Inventory setting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching inventory setting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory setting' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { orgId, userId } = await getAuthContext();
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'category' | 'location' | 'supplier';
    const body = await request.json();

    if (!type) {
      return NextResponse.json(
        { error: 'Missing type parameter' },
        { status: 400 }
      );
    }

    let updated;
    switch (type) {
      case 'category':
        updated = await InventorySettingsService.updateCategory(id, orgId, body, userId);
        break;
      case 'location':
        updated = await InventorySettingsService.updateLocation(id, orgId, body, userId);
        break;
      case 'supplier':
        updated = await InventorySettingsService.updateSupplier(id, orgId, body, userId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    if (!updated) {
      return NextResponse.json(
        { error: 'Inventory setting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating inventory setting:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory setting', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { orgId, userId } = await getAuthContext();
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'category' | 'location' | 'supplier';

    if (!type) {
      return NextResponse.json(
        { error: 'Missing type parameter' },
        { status: 400 }
      );
    }

    let deleted;
    switch (type) {
      case 'category':
        deleted = await InventorySettingsService.deleteCategory(id, orgId, userId);
        break;
      case 'location':
        deleted = await InventorySettingsService.deleteLocation(id, orgId, userId);
        break;
      case 'supplier':
        deleted = await InventorySettingsService.deleteSupplier(id, orgId, userId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    if (!deleted) {
      return NextResponse.json(
        { error: 'Inventory setting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting inventory setting:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory setting', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}