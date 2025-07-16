import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { NumberingSchemesService } from '@/lib/services/numbering-schemes';

export async function POST(request: NextRequest) {
  try {
    const { orgId, userId } = await getAuthContext();
    
    const schemes = await NumberingSchemesService.initializeDefaults(orgId, userId);

    return NextResponse.json({
      schemes,
      message: `Initialized ${schemes.length} default numbering schemes`
    });
  } catch (error) {
    console.error('Error initializing default schemes:', error);
    return NextResponse.json(
      { error: 'Failed to initialize default schemes' },
      { status: 500 }
    );
  }
}