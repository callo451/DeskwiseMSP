import { NextRequest, NextResponse } from 'next/server';
import { AssetsService } from '@/lib/services/assets';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Extract organization ID and user from authentication context
    const orgId = 'default-org'; // TODO: Get from authenticated user context
    const restoredBy = 'current-user'; // TODO: Get from authenticated user context
    
    const asset = await AssetsService.restore(id, orgId, restoredBy);
    
    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found or not deleted' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error restoring asset:', error);
    return NextResponse.json(
      { error: 'Failed to restore asset' },
      { status: 500 }
    );
  }
}