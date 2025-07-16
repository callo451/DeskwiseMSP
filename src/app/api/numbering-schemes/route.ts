import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { NumberingSchemesService } from '@/lib/services/numbering-schemes';

export async function GET(request: NextRequest) {
  try {
    const { orgId } = await getAuthContext();
    
    const schemes = await NumberingSchemesService.getAll(orgId);

    return NextResponse.json({ schemes });
  } catch (error) {
    console.error('Error fetching numbering schemes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch numbering schemes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orgId, userId } = await getAuthContext();
    const schemeData = await request.json();

    // Validate required fields
    if (!schemeData.moduleType || !schemeData.prefix) {
      return NextResponse.json(
        { error: 'Module type and prefix are required' },
        { status: 400 }
      );
    }

    const scheme = await NumberingSchemesService.create(
      orgId,
      schemeData,
      userId
    );

    return NextResponse.json(
      { 
        scheme,
        message: 'Numbering scheme created successfully' 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating numbering scheme:', error);
    
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create numbering scheme' },
      { status: 500 }
    );
  }
}