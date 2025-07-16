import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { NumberingSchemesService, ModuleType } from '@/lib/services/numbering-schemes';

export async function POST(request: NextRequest) {
  try {
    const { orgId } = await getAuthContext();
    const { moduleType, prefix, suffix, paddingLength } = await request.json();

    if (!moduleType || prefix === undefined) {
      return NextResponse.json(
        { error: 'Module type and prefix are required' },
        { status: 400 }
      );
    }

    const previewId = await NumberingSchemesService.previewId(
      orgId,
      moduleType as ModuleType,
      prefix,
      suffix || '',
      paddingLength || 5
    );

    return NextResponse.json({ previewId });
  } catch (error) {
    console.error('Error generating preview ID:', error);
    
    // Check if it's an auth error
    if (error instanceof Error && error.message.includes('Organization required')) {
      const { prefix, suffix, paddingLength } = await request.json();
      const fallbackPreview = `${prefix || ''}${'0'.repeat(paddingLength || 5)}${suffix || ''}`;
      return NextResponse.json(
        { previewId: fallbackPreview },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate preview ID' },
      { status: 500 }
    );
  }
}