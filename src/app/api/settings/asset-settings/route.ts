import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { AssetSettingsService } from '@/lib/services/asset-settings';

export async function GET(request: NextRequest) {
  try {
    const { orgId } = await getAuthContext();
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
        data = await AssetSettingsService.getAllCategories(orgId);
        break;
      case 'status':
        data = await AssetSettingsService.getAllStatuses(orgId);
        break;
      case 'maintenance':
        data = await AssetSettingsService.getAllMaintenanceSchedules(orgId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching asset settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orgId, userId } = await getAuthContext();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'category' | 'status' | 'maintenance';
    const body = await request.json();

    if (!type) {
      return NextResponse.json(
        { error: 'Missing type parameter' },
        { status: 400 }
      );
    }

    let created;
    switch (type) {
      case 'category':
        if (!body.name || !body.color) {
          return NextResponse.json(
            { error: 'Missing required fields: name, color' },
            { status: 400 }
          );
        }
        created = await AssetSettingsService.createCategory(orgId, body, userId);
        break;
      case 'status':
        if (!body.name || !body.color || !body.type) {
          return NextResponse.json(
            { error: 'Missing required fields: name, color, type' },
            { status: 400 }
          );
        }
        created = await AssetSettingsService.createStatus(orgId, body, userId);
        break;
      case 'maintenance':
        if (!body.name || !body.type || !body.frequency || !body.estimatedDuration || !body.priority) {
          return NextResponse.json(
            { error: 'Missing required fields: name, type, frequency, estimatedDuration, priority' },
            { status: 400 }
          );
        }
        created = await AssetSettingsService.createMaintenanceSchedule(orgId, body, userId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating asset setting:', error);
    return NextResponse.json(
      { error: 'Failed to create asset setting', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}