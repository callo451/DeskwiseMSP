import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { AssetSettingsService } from '@/lib/services/asset-settings';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { orgId } = await getAuthContext();
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'category' | 'status' | 'maintenance';

    if (!type) {
      return NextResponse.json(
        { error: 'Missing type parameter' },
        { status: 400 }
      );
    }

    let data;
    switch (type) {
      case 'category':
        data = await AssetSettingsService.getCategoryById(id, orgId);
        break;
      case 'status':
        // Status doesn't have a getById method, so we'll return null
        data = null;
        break;
      case 'maintenance':
        // Maintenance doesn't have a getById method, so we'll return null
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
        { error: 'Asset setting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching asset setting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset setting' },
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
    const type = searchParams.get('type') as 'category' | 'status' | 'maintenance';
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
        updated = await AssetSettingsService.updateCategory(id, orgId, body, userId);
        break;
      case 'status':
        updated = await AssetSettingsService.updateStatus(id, orgId, body, userId);
        break;
      case 'maintenance':
        updated = await AssetSettingsService.updateMaintenanceSchedule(id, orgId, body, userId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    if (!updated) {
      return NextResponse.json(
        { error: 'Asset setting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating asset setting:', error);
    return NextResponse.json(
      { error: 'Failed to update asset setting', details: error instanceof Error ? error.message : 'Unknown error' },
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
    const type = searchParams.get('type') as 'category' | 'status' | 'maintenance';

    if (!type) {
      return NextResponse.json(
        { error: 'Missing type parameter' },
        { status: 400 }
      );
    }

    let deleted;
    switch (type) {
      case 'category':
        deleted = await AssetSettingsService.deleteCategory(id, orgId, userId);
        break;
      case 'status':
        deleted = await AssetSettingsService.deleteStatus(id, orgId, userId);
        break;
      case 'maintenance':
        deleted = await AssetSettingsService.deleteMaintenanceSchedule(id, orgId, userId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    if (!deleted) {
      return NextResponse.json(
        { error: 'Asset setting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting asset setting:', error);
    return NextResponse.json(
      { error: 'Failed to delete asset setting', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}