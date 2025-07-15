import { NextRequest, NextResponse } from 'next/server';
import { AssetsService } from '@/lib/services/assets';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract organization ID from authentication context
    // For now, using a placeholder - this would be extracted from WorkOS user context
    const orgId = 'default-org'; // TODO: Get from authenticated user context
    
    // Parse filters from query parameters
    const filters: any = {};
    
    const type = searchParams.get('type');
    if (type) {
      filters.type = type.split(',');
    }
    
    const status = searchParams.get('status');
    if (status) {
      filters.status = status.split(',');
    }
    
    const isSecure = searchParams.get('isSecure');
    if (isSecure !== null) {
      filters.isSecure = isSecure === 'true';
    }
    
    const client = searchParams.get('client');
    if (client) {
      filters.client = client;
    }
    
    const location = searchParams.get('location');
    if (location) {
      filters.location = location;
    }
    
    const maintenanceDue = searchParams.get('maintenanceDue');
    if (maintenanceDue === 'true') {
      filters.maintenanceDue = true;
    }
    
    const warrantyExpiring = searchParams.get('warrantyExpiring');
    if (warrantyExpiring) {
      filters.warrantyExpiring = parseInt(warrantyExpiring);
    }
    
    const includeDeleted = searchParams.get('includeDeleted');
    if (includeDeleted === 'true') {
      filters.includeDeleted = true;
    }
    
    const search = searchParams.get('search');
    if (search) {
      const assets = await AssetsService.search(orgId, search);
      return NextResponse.json(assets);
    }
    
    const assets = await AssetsService.getAll(orgId, filters);
    return NextResponse.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Extract organization ID and user from authentication context
    const orgId = 'default-org'; // TODO: Get from authenticated user context
    const createdBy = 'current-user'; // TODO: Get from authenticated user context
    
    // Validate required fields
    if (!data.name || !data.client || !data.type || !data.status) {
      return NextResponse.json(
        { error: 'Missing required fields: name, client, type, status' },
        { status: 400 }
      );
    }

    // Validate asset type
    const validTypes = ['Server', 'Workstation', 'Network', 'Printer'];
    if (!validTypes.includes(data.type)) {
      return NextResponse.json(
        { error: `Invalid asset type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate asset status
    const validStatuses = ['Online', 'Offline', 'Warning'];
    if (!validStatuses.includes(data.status)) {
      return NextResponse.json(
        { error: `Invalid asset status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Set default values for required fields
    const assetData = {
      ...data,
      isSecure: data.isSecure ?? false,
      lastSeen: data.lastSeen || new Date().toISOString(),
      ipAddress: data.ipAddress || '',
      macAddress: data.macAddress || '',
      os: data.os || '',
      cpu: data.cpu || { model: '', usage: 0 },
      ram: data.ram || { total: 0, used: 0 },
      disk: data.disk || { total: 0, used: 0 },
      activityLogs: data.activityLogs || [],
      associatedTickets: data.associatedTickets || []
    };

    // Convert date strings to Date objects
    if (data.purchaseDate) {
      assetData.purchaseDate = new Date(data.purchaseDate);
    }
    if (data.warrantyExpiration) {
      assetData.warrantyExpiration = new Date(data.warrantyExpiration);
    }
    if (data.maintenanceSchedule?.nextMaintenanceDate) {
      assetData.maintenanceSchedule = {
        ...data.maintenanceSchedule,
        nextMaintenanceDate: new Date(data.maintenanceSchedule.nextMaintenanceDate),
        lastMaintenanceDate: data.maintenanceSchedule.lastMaintenanceDate 
          ? new Date(data.maintenanceSchedule.lastMaintenanceDate)
          : undefined
      };
    }

    const asset = await AssetsService.create(orgId, assetData, createdBy);
    
    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    );
  }
}