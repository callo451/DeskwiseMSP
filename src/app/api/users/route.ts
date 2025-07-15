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

    const { users, memberships } = await WorkOSService.getOrganizationUsersAndMemberships(organizationId);

    return NextResponse.json({
      users,
      memberships,
      total: users.length,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}