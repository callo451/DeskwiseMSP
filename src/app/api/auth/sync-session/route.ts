import { NextRequest, NextResponse } from 'next/server';
import { WorkOS } from '@workos-inc/node';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { UserService } from '@/lib/services/users';

const workos = new WorkOS(process.env.WORKOS_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { user } = await withAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    console.log(`Syncing session for user: ${user.id}`);

    // Get user from MongoDB
    const existingUser = await UserService.getUserByWorkosId(user.id);
    
    if (!existingUser || !existingUser.orgId || existingUser.orgId === 'setup-pending') {
      return NextResponse.json(
        { error: 'No organization found for user' },
        { status: 404 }
      );
    }

    // Check if membership exists in WorkOS
    try {
      const memberships = await workos.userManagement.listOrganizationMemberships({
        userId: user.id,
      });
      
      const membership = memberships.data.find(m => m.organizationId === existingUser.orgId);
      
      if (!membership) {
        console.log(`Recreating membership for user ${user.id} in organization ${existingUser.orgId}`);
        
        // Recreate the membership
        await workos.userManagement.createOrganizationMembership({
          userId: user.id,
          organizationId: existingUser.orgId,
          roleSlug: 'admin',
        });
        
        console.log(`Recreated membership for user ${user.id}`);
      }

      return NextResponse.json({ 
        success: true,
        organizationId: existingUser.orgId,
        message: 'Session sync completed successfully'
      });

    } catch (error) {
      console.error('Error syncing session:', error);
      return NextResponse.json(
        { error: 'Failed to sync session with WorkOS' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in session sync:', error);
    return NextResponse.json(
      { error: 'Failed to sync session' },
      { status: 500 }
    );
  }
}