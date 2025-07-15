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

    // Get user details from WorkOS
    const userDetails = await workos.userManagement.getUser(id);
    
    // Get user's organization membership
    const { data: memberships } = await workos.userManagement.listOrganizationMemberships({
      userId: id,
      organizationId,
    });

    const membership = memberships[0]; // Should only be one membership per org

    return NextResponse.json({
      user: userDetails,
      membership: membership,
    });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    
    if (error.code === 'user_not_found') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch user' },
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

    // Update user through WorkOS
    const updatedUser = await workos.userManagement.updateUser({
      userId: id,
      ...updates,
    });

    return NextResponse.json({
      user: updatedUser,
      message: 'User updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    
    if (error.code === 'user_not_found') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update user' },
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

    // Get user's organization membership first
    const { data: memberships } = await workos.userManagement.listOrganizationMemberships({
      userId: id,
      organizationId,
    });

    if (memberships.length === 0) {
      return NextResponse.json(
        { error: 'User is not a member of this organization' },
        { status: 404 }
      );
    }

    // Remove user from organization
    await workos.userManagement.deleteOrganizationMembership(memberships[0].id);

    return NextResponse.json({
      message: 'User removed from organization successfully',
    });
  } catch (error: any) {
    console.error('Error removing user:', error);
    
    if (error.code === 'organization_membership_not_found') {
      return NextResponse.json(
        { error: 'User membership not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to remove user' },
      { status: 500 }
    );
  }
}