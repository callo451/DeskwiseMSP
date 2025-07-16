import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { InventorySettingsService } from '@/lib/services/inventory-settings';

export async function GET(request: NextRequest) {
  try {
    const { orgId } = await getAuthContext();
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
        data = await InventorySettingsService.getAllCategories(orgId);
        break;
      case 'location':
        data = await InventorySettingsService.getAllLocations(orgId);
        break;
      case 'supplier':
        data = await InventorySettingsService.getAllSuppliers(orgId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching inventory settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orgId, userId } = await getAuthContext();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'category' | 'location' | 'supplier';
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
        if (!body.name || !body.color || !body.trackingMethod || !body.costMethod) {
          return NextResponse.json(
            { error: 'Missing required fields: name, color, trackingMethod, costMethod' },
            { status: 400 }
          );
        }
        created = await InventorySettingsService.createCategory(orgId, body, userId);
        break;
      case 'location':
        if (!body.name || !body.type) {
          return NextResponse.json(
            { error: 'Missing required fields: name, type' },
            { status: 400 }
          );
        }
        created = await InventorySettingsService.createLocation(orgId, body, userId);
        break;
      case 'supplier':
        if (!body.name || !body.contactInfo) {
          return NextResponse.json(
            { error: 'Missing required fields: name, contactInfo' },
            { status: 400 }
          );
        }
        created = await InventorySettingsService.createSupplier(orgId, body, userId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory setting:', error);
    return NextResponse.json(
      { error: 'Failed to create inventory setting', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}