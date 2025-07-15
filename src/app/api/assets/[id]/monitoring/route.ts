import { NextRequest, NextResponse } from 'next/server';
import { AssetsService } from '@/lib/services/assets';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();
    
    // Extract organization ID from authentication context
    const orgId = 'default-org'; // TODO: Get from authenticated user context
    
    // Validate monitoring data
    if (data.status) {
      const validStatuses = ['Online', 'Offline', 'Warning'];
      if (!validStatuses.includes(data.status)) {
        return NextResponse.json(
          { error: `Invalid asset status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
    }

    if (data.cpu && (typeof data.cpu.usage !== 'number' || data.cpu.usage < 0 || data.cpu.usage > 100)) {
      return NextResponse.json(
        { error: 'CPU usage must be a number between 0 and 100' },
        { status: 400 }
      );
    }

    if (data.ram && (typeof data.ram.used !== 'number' || typeof data.ram.total !== 'number' || data.ram.used < 0 || data.ram.total < 0)) {
      return NextResponse.json(
        { error: 'RAM values must be positive numbers' },
        { status: 400 }
      );
    }

    if (data.disk && (typeof data.disk.used !== 'number' || typeof data.disk.total !== 'number' || data.disk.used < 0 || data.disk.total < 0)) {
      return NextResponse.json(
        { error: 'Disk values must be positive numbers' },
        { status: 400 }
      );
    }

    const asset = await AssetsService.updateMonitoringData(id, orgId, data);
    
    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error updating asset monitoring data:', error);
    return NextResponse.json(
      { error: 'Failed to update asset monitoring data' },
      { status: 500 }
    );
  }
}