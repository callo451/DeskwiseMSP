import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { WorkOSService } from '@/lib/services/workos';

export async function GET(request: NextRequest) {
  try {
    const { user, organizationId } = await withAuth({ ensureSignedIn: true });
    
    if (!user || !organizationId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const roles = await WorkOSService.getOrganizationRoles(organizationId);

    return NextResponse.json({
      roles,
      total: roles.length,
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, organizationId } = await withAuth({ ensureSignedIn: true });
    
    if (!user || !organizationId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { name, description } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Role name is required' },
        { status: 400 }
      );
    }

    // Create role through WorkOS
    const role = await workos.userManagement.createRole({
      name,
      description,
    });

    return NextResponse.json({
      role,
      message: 'Role created successfully',
    });
  } catch (error: any) {
    console.error('Error creating role:', error);
    
    if (error.code === 'role_already_exists') {
      return NextResponse.json(
        { error: 'Role with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
}