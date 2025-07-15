import { NextRequest, NextResponse } from 'next/server';
import { ReportsService } from '@/lib/services/reports';
import { getAuthContext } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { orgId } = await getAuthContext();
    const { searchParams } = new URL(request.url);
    
    const type = searchParams.get('type') || 'msp';
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    
    let dateRange;
    if (from && to) {
      dateRange = {
        from: new Date(from),
        to: new Date(to)
      };
    }

    let metrics;
    switch (type) {
      case 'msp':
        metrics = await ReportsService.getMSPMetrics(orgId, dateRange);
        break;
      case 'clients':
        metrics = await ReportsService.getClientMetrics(orgId, dateRange);
        break;
      case 'technicians':
        metrics = await ReportsService.getTechnicianMetrics(orgId, dateRange);
        break;
      case 'services':
        metrics = await ReportsService.getServiceMetrics(orgId, dateRange);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid metrics type' },
          { status: 400 }
        );
    }

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}