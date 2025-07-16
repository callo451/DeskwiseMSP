import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { NumberingSchemesService, ModuleType } from '@/lib/services/numbering-schemes';

export async function POST(request: NextRequest) {
  try {
    const { orgId } = await getAuthContext();
    const { moduleType } = await request.json();

    if (!moduleType) {
      return NextResponse.json(
        { error: 'Module type is required' },
        { status: 400 }
      );
    }

    const nextId = await NumberingSchemesService.generateNextId(orgId, moduleType as ModuleType);

    return NextResponse.json({ nextId });
  } catch (error) {
    console.error('Error generating next ID:', error);
    return NextResponse.json(
      { error: 'Failed to generate next ID' },
      { status: 500 }
    );
  }
}