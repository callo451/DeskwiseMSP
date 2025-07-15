import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS(process.env.WORKOS_API_KEY!);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, organizationId } = await withAuth({ ensureSignedIn: true });
    
    if (!user || !organizationId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Get role details from WorkOS
    const role = await workos.userManagement.getRole(id);

    return NextResponse.json({
      role: role,
    });
  } catch (error: any) {
    console.error('Error fetching role:', error);
    
    if (error.code === 'role_not_found') {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch role' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, organizationId } = await withAuth({ ensureSignedIn: true });
    
    if (!user || !organizationId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    const updates = await request.json();

    // Update role through WorkOS
    const updatedRole = await workos.userManagement.updateRole({
      roleId: id,
      ...updates,
    });

    return NextResponse.json({
      role: updatedRole,
      message: 'Role updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating role:', error);
    
    if (error.code === 'role_not_found') {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, organizationId } = await withAuth({ ensureSignedIn: true });
    
    if (!user || !organizationId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Delete role through WorkOS
    await workos.userManagement.deleteRole(id);

    return NextResponse.json({
      message: 'Role deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting role:', error);
    
    if (error.code === 'role_not_found') {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }
    
    if (error.code === 'role_in_use') {
      return NextResponse.json(
        { error: 'Cannot delete role that is currently assigned to users' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    );
  }
}