import { NextRequest, NextResponse } from 'next/server';
import { ReportsService } from '@/lib/services/reports';
import { getAuthContext } from '@/lib/auth';
import type { ReportFilter } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { orgId } = await getAuthContext();
    const {
      module,
      columns,
      filters,
      dateRange,
      groupBy
    } = await request.json();

    if (!module || !columns) {
      return NextResponse.json(
        { error: 'Module and columns are required' },
        { status: 400 }
      );
    }

    const reportData = await ReportsService.getReportData(
      orgId,
      module,
      columns,
      filters || [],
      dateRange ? { from: new Date(dateRange.from), to: new Date(dateRange.to) } : undefined,
      groupBy
    );

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error generating report data:', error);
    return NextResponse.json(
      { error: 'Failed to generate report data' },
      { status: 500 }
    );
  }
}