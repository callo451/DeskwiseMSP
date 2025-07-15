import { NextRequest, NextResponse } from 'next/server';
import { InventoryService } from '@/lib/services/inventory';

export async function GET(request: NextRequest) {
  try {
    // Extract organization ID from authentication context
    const orgId = 'default-org'; // TODO: Get from authenticated user context
    
    const categoryStats = await InventoryService.getCategoryStats(orgId);
    
    return NextResponse.json(categoryStats);
  } catch (error) {
    console.error('Error fetching category statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category statistics' },
      { status: 500 }
    );
  }
}